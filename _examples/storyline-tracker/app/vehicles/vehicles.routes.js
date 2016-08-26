"use strict";
var vehicle_list_1 = require('./vehicle-list');
var vehicle_1 = require('./vehicle');
var vehicles_component_1 = require('./vehicles.component');
var app_interfaces_1 = require('../app.interfaces');
exports.VehiclesRoutes = [
    {
        path: 'vehicles',
        component: vehicles_component_1.VehiclesComponent,
        children: [
            {
                path: '',
                component: vehicle_list_1.VehicleListComponent
            },
            {
                path: ':id',
                component: vehicle_1.VehicleComponent,
                canDeactivate: [app_interfaces_1.CanDeactivateGuard]
            },
        ]
    },
];
//# sourceMappingURL=vehicles.routes.js.map