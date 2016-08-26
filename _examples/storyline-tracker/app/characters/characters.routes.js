"use strict";
var character_list_1 = require('./character-list');
var character_1 = require('./character');
var characters_component_1 = require('./characters.component');
var app_interfaces_1 = require('../app.interfaces');
exports.CharactersRoutes = [
    {
        path: 'characters',
        component: characters_component_1.CharactersComponent,
        children: [
            {
                path: '',
                component: character_list_1.CharacterListComponent
            },
            {
                path: ':id',
                component: character_1.CharacterComponent,
                canDeactivate: [app_interfaces_1.CanDeactivateGuard]
            },
        ]
    },
];
//# sourceMappingURL=characters.routes.js.map