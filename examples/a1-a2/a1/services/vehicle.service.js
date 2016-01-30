(function () {
  'use strict';

  angular
    .module('app')
    .service('VehicleService', VehicleService);

  function VehicleService() {
    this.getVehicles = function () {
      return [
        { id: 1, name: 'X-Wing Fighter' },
        { id: 2, name: 'Tie Fighter' },
        { id: 3, name: 'Y-Wing Fighter' }
      ];
    }
  }
})();