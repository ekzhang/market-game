angular.module('marketGame', [])
.filter('username', function() {
  return function(input) {
    return input.split('|')[0];
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
  $scope.events = [];

  $scope.action = function(verb, amt) {
    io.socket.post('/action', { verb, room_id: $scope.room, amt }, function(data, resp) {
      if (resp.statusCode !== 200) {
        alert("Error: " + data);
      }
    });
  };

  $scope.update = function() {
    let host = null;
    let sell = NaN, buy = NaN;
    let ongoing = true;
    let nicks = {};
    for (const e of $scope.events) {
      if (e.type === 'end') {
        ongoing = false;
      }
      if (e.type === 'created') {
        host = e.user;
      }
      else if (e.type === 'taken' || e.type === 'sold') {
        sell = buy = NaN;
      }
      else if (e.type === 'bid') {
        buy = e.data;
      }
      else if (e.type === 'at') {
        sell = e.data;
      }
    }

    $scope.$apply();
  }

  $scope.init = function() {
    io.socket.get('/events/' + $scope.room, {}, function(data, resp) {
      if (resp.statusCode !== 200) {
        alert("An unkonwn error occurred. Please try again.");
      }
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
        alert("Error: " + "Invalid room or data!");
    });
  }
})
.controller('NicknameController', function($scope) {
  $scope.submit = function() {
    io.socket.post('/nick', { nick: $scope.nick }, function(data, resp) {
      if (resp.statusCode === 200) {
        window.location.href = '/';
      }
    });
  }
})
;
