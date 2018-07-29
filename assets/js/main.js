angular.module('marketGame', ['luegg.directives'])
.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}])
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
.controller('HomepageController', ['$scope', function($scope) {
  $scope.joinRoom = function() {
    let room = "";
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 6; i++) {
      room += letters[Math.floor(Math.random() * 26)];
    }
    window.location.href = '/room/' + room;
  };
}])
.controller('RoomController', ['$scope', function($scope) {
  $scope.isNaN = isNaN;
  $scope.events = [];

  $scope.copyLink = function() {
    // create temp element
    var copyElement = document.createElement("span");
    copyElement.appendChild(document.createTextNode(window.location.href));
    copyElement.id = 'tempCopyToClipboard';
    angular.element(document.body.append(copyElement));

    // select the text
    var range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    // copy & cleanup
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyElement.remove();

    var button = document.getElementById("copyLink");
    button.innerHTML = "Copied!";
    button.disabled = true;
    window.setTimeout(function() {
      button.innerHTML = "Copy Link";
      button.disabled = false;
    }, 1000);
  };

  $scope.action = function(verb, name) {
    const amt = this[name];
    if (name)
      this[name] = '';
    io.socket.post('/action', { verb, room_id: $scope.room, amt }, function(data, resp) {
      if (resp.statusCode !== 200) {
        swal("Error", JSON.parse(data), "error");
      }
    });
  };

  $scope.update = function() {
    $scope.sell = $scope.buy = NaN;
    $scope.sellUser = $scope.buyUser = null;
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
          seller: $scope.sellUser,
          price: $scope.sell
        });
        $scope.sell = NaN;
      }
      else if (e.type === 'sold') {
        $scope.log.push({
          buyer: $scope.buyUser,
          seller: e.user,
          price: $scope.buy
        });
        $scope.buy = NaN;
      }
      else if (e.type === 'bid') {
        $scope.buy = e.data;
        $scope.buyUser = e.user;
      }
      else if (e.type === 'at') {
        $scope.sell = e.data;
        $scope.sellUser = e.user;
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
        swal("Error", "An unkonwn error occurred. Please try again.", "error");
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
}])
.controller('CreateRoomController', ['$scope', function($scope) {
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
        swal("Error", JSON.parse(data), "error");
    });
  }
}])
.controller('NicknameController', ['$scope', '$location', function($scope, $location) {
  $scope.submit = function() {
    io.socket.post('/nick', { nick: $scope.nick }, function(data, resp) {
      if (resp.statusCode === 200) {
        const next = $location.search().next || '/';
        window.location.href = next;
      }
      else {
        swal("Error", JSON.parse(data), "error");
      }
    });
  }
}])
;
