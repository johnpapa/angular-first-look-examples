(function() {
  'use strict';

  angular
    .module('app')
    .service('VehicleService', VehicleService);

  VehicleService.$inject = ['$http'];

  function VehicleService($http) {
    this.getVehicles = function() {
      return $http.get('api/vehicles.json')
        .then(function(response) {
          return response.data.data;
        })
        .catch(handleError);
    }

    function handleError() {

    }
  }
})();

