"use strict";
var router_1 = require('@angular/router');
var dashboard_1 = require('./dashboard');
var characters_1 = require('./characters');
var vehicles_1 = require('./vehicles');
var app_interfaces_1 = require('./app.interfaces');
exports.routes = dashboard_1.DashboardRoutes.concat(characters_1.CharactersRoutes, vehicles_1.VehiclesRoutes);
exports.APP_ROUTER_PROVIDERS = [
    router_1.provideRouter(exports.routes),
    app_interfaces_1.CanDeactivateGuard
];
//# sourceMappingURL=app.routes.js.map