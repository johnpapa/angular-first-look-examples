"use strict";
var router_1 = require('@angular/router');
var vehicle_component_1 = require('./vehicle.component');
var vehicles_component_1 = require('./vehicles.component');
var vehicle_list_component_1 = require('./vehicle-list.component');
exports.routes = [
    {
        path: '',
        component: vehicles_component_1.VehiclesComponent,
        children: [
            { path: '', component: vehicle_list_component_1.VehicleListComponent },
            { path: ':id', component: vehicle_component_1.VehicleComponent },
        ]
    }
];
exports.routing = router_1.RouterModule.forRoot(exports.routes);
exports.routedComponents = [
    vehicles_component_1.VehiclesComponent,
    vehicle_list_component_1.VehicleListComponent,
    vehicle_component_1.VehicleComponent
];
//# sourceMappingURL=vehicles.routing.js.map