(function () {
  angular
    .module('app', [])
    .controller('VehiclesController', VehiclesController);

  function VehiclesController() {
    var vm = this;
    vm.title = 'Angular 1 Binding Events';
    vm.imagePath = 'angular.png';
    vm.messages = [];
    vm.vehicles = [
      { id: 1, name: 'X-Wing Fighter' },
      { id: 2, name: 'Tie Fighter' },
      { id: 3, name: 'Y-Wing Fighter' }
    ];
    vm.log = function (msg, data) {
      vm.messages.splice(0, 0, msg);
      console.log(msg);
      if (data) {
        console.log(data);
      }
    }
  }
})();

