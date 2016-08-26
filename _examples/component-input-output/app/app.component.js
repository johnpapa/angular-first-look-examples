System.register(['angular2/core', 'angular2/http', './characters.component'], function(exports_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1, characters_component_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (characters_component_1_1) {
                characters_component_1 = characters_component_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                }
                AppComponent.prototype.changed = function (changedCharacter) {
                    if (changedCharacter) {
                        console.log("Event Emitter said you selected " + changedCharacter.name);
                    }
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'story-app',
                        template: "\n  <div>\n    <h1>Storyline Tracker</h1>\n    <h3>Component Demo</h3>\n    <story-characters [storyId]=\"7\" (changed)=changed($event)></story-characters>\n  </div>\n  ",
                        directives: [characters_component_1.CharactersComponent],
                        providers: [http_1.HTTP_PROVIDERS]
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map