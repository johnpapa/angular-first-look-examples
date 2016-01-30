(function () {
  angular
    .module('app', [])
    .controller('VehiclesController', VehiclesController);

  function VehiclesController() {
    var vm = this;
    vm.name = 'World';
    vm.vehicles = [
      { id: 1, name: 'X-Wing Fighter' },
      { id: 2, name: 'Tie Fighter' },
      { id: 3, name: 'Y-Wing Fighter' }
    ];
  }
})();