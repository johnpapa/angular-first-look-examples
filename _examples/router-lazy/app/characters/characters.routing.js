"use strict";
var router_1 = require('@angular/router');
var character_component_1 = require('./character.component');
var characters_component_1 = require('./characters.component');
var character_list_component_1 = require('./character-list.component');
exports.routes = [
    // { path: '', pathMatch: 'full', redirectTo: '/characters' },
    {
        path: 'characters',
        component: characters_component_1.CharactersComponent,
        children: [
            { path: '', component: character_list_component_1.CharacterListComponent },
            { path: ':id', component: character_component_1.CharacterComponent },
        ]
    }
];
exports.routing = router_1.RouterModule.forRoot(exports.routes);
exports.routedComponents = [
    characters_component_1.CharactersComponent,
    character_list_component_1.CharacterListComponent,
    character_component_1.CharacterComponent
];
//# sourceMappingURL=characters.routing.js.map