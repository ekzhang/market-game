angular.module('marketGame', [])
.controller('HomepageController', function($scope) {
  $scope.joinRoom = function(room) {
    window.location.href = '/room/' + room;
  };
})
.controller('RoomController', function($scope) {
  // io.socket.get('/')
});
