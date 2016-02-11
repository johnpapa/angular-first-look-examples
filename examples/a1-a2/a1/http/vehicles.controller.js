(function () {
  angular
    .module('app', [])
    .controller('VehiclesController', VehiclesController);

  VehiclesController.$inject = ['VehicleService'];
  function VehiclesController(VehicleService) {
    var vm = this;
    vm.title = 'Services';
    VehicleService.getVehicles()
      .then(function (vehicles) {
        vm.vehicles = vehicles;
      });
  }
})();

