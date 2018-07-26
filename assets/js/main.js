angular.module('marketGame', [])
.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})
.filter('username', function() {
  return function(input) {
    return input.split('|')[0];
  }
})
.filter('sign', function() {
  return function(input) {
    return (Number(input) > 0 ? '+' : '') + input;
  }
})
.controller('HomepageController', function($scope) {
  $scope.joinRoom = function() {
    let room = "";
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 6; i++) {
      room += letters[Math.floor(Math.random() * 26)];
    }
    window.location.href = '/room/' + room;
  };
})
.controller('RoomController', function($scope) {
  $scope.isNaN = isNaN;
  $scope.events = [];

  $scope.action = function(verb, amt) {
    io.socket.post('/action', { verb, room_id: $scope.room, amt }, function(data, resp) {
      if (resp.statusCode !== 200) {
        alert("Error: " + JSON.parse(data));
      }
    });
  };

  $scope.update = function() {
    $scope.sell = NaN, buy = NaN;
    let sellUser, buyUser;
    $scope.ongoing = true;
    $scope.log = [];
    $scope.users = [];
    $scope.exposure = {};
    $scope.profit = {};
    for (const e of $scope.events) {
      if ($scope.users.indexOf(e.user) === -1) {
        $scope.users.push(e.user);
        $scope.exposure[e.user] = 0;
        $scope.profit[e.user] = 0;
      }
      if (e.type === 'end')
        $scope.ongoing = false;
      if (e.type === 'created') {
        $scope.host = e.user;
        $scope.question = e.data.question;
        $scope.value = e.data.value;
      }
      else if (e.type === 'taken') {
        $scope.log.push({
          buyer: e.user,
          seller: sellUser,
          price: $scope.sell
        });
        $scope.sell = $scope.buy = NaN;
      }
      else if (e.type === 'sold') {
        $scope.log.push({
          buyer: buyUser,
          seller: e.user,
          price: $scope.buy
        });
        $scope.sell = $scope.buy = NaN;
      }
      else if (e.type === 'bid') {
        $scope.buy = e.data;
        buyUser = e.user;
      }
      else if (e.type === 'at') {
        $scope.sell = e.data;
        sellUser = e.user;
      }
    }

    for (const item of $scope.log) {
      $scope.exposure[item.buyer]++;
      $scope.exposure[item.seller]--;
      $scope.profit[item.buyer] -= item.price;
      $scope.profit[item.seller] += item.price;
    }

    $scope.$apply();
  }

  $scope.init = function() {
    io.socket.get('/events/' + $scope.room, {}, function(data, resp) {
      if (resp.statusCode !== 200) {
        alert("An unkonwn error occurred. Please try again.");
      }
      $scope.loaded = true;
      $scope.events = data;
      $scope.update();
    });
    io.socket.on("message", function(msg) {
      $scope.events.push(msg);
      console.log(msg);
      $scope.update();
    });
  }
})
.controller('CreateRoomController', function($scope) {
  $scope.options = {};
  $scope.newRoom = function() {
    io.socket.post('/newRoom', {
      options: $scope.options,
      question: $scope.question,
      value: $scope.answer,
      room_id: $scope.room
    }, function(data, resp) {
      if (resp.statusCode === 200)
        window.location.href = '/room/' + $scope.room;
      else
        alert("Error: " + JSON.parse(data));
    });
  }
})
.controller('NicknameController', function($scope, $location) {
  $scope.submit = function() {
    io.socket.post('/nick', { nick: $scope.nick }, function(data, resp) {
      if (resp.statusCode === 200) {
        const next = $location.search().next || '/';
        window.location.href = next;
      }
      else {
        alert("Error: " + JSON.parse(data));
      }
    });
  }
})
;
