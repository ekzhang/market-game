angular.module('marketGame', [])
.controller('HomepageController', function($scope) {
  $scope.joinRoom = function(room) {
    window.location.href = '/room/' + room;
  };
})
.controller('RoomController', function($scope) {
  $scope.events = [];
  io.socket.get('/subscribeRoom', {room_id: $scope.room}, function(data, resp) {
    if (resp.statusCode !== 200) {
      alert("An unkonwn error occurred. Please try again.");
    }
    $scope.events = data;
    $scope.$apply();
  });
  io.socket.on("room" + $scope.room, function(msg) {
    $scope.events.push(msg);
  });
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
