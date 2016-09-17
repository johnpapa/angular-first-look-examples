"use strict";
var router_1 = require('@angular/router');
var page_not_found_component_1 = require('./page-not-found.component');
exports.routes = [
    { path: '', pathMatch: 'full', redirectTo: '/characters' },
    { path: 'vehicles', loadChildren: 'app/vehicles/vehicles.module#VehiclesModule' },
    { path: '**', pathMatch: 'full', component: page_not_found_component_1.PageNotFoundComponent },
];
exports.routing = router_1.RouterModule.forRoot(exports.routes);
exports.routableComponents = [page_not_found_component_1.PageNotFoundComponent];
//# sourceMappingURL=app.routing.js.map