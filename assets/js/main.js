angular.module('marketGame', [])
.controller('HomepageController', function($scope) {
  $scope.joinRoom = function(room) {
    window.location.href = '/room/' + room;
  };
})
.controller('RoomController', function($scope) {
  // io.socket.get('/')
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
        alert("Error: Room already created!");
    });
  }
});
