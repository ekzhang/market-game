angular.module('marketGame', [])
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
  $scope.init = function() {
    io.socket.get('/events/' + $scope.room, {}, function(data, resp) {
      if (resp.statusCode !== 200) {
        alert("An unkonwn error occurred. Please try again.");
      }
      $scope.events = data;
      $scope.$apply();
    });
    io.socket.on("message", function(msg) {
      $scope.events.push(msg);
      console.log(msg);
      $scope.$apply();
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
});
