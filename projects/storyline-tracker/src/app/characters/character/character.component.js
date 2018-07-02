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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var models_1 = require("../../models");
var core_2 = require("../../core");
var CharacterComponent = /** @class */ (function () {
    function CharacterComponent(entityService, modalService, route, router, characterService, toastService) {
        this.entityService = entityService;
        this.modalService = modalService;
        this.route = route;
        this.router = router;
        this.characterService = characterService;
        this.toastService = toastService;
        this.editCharacter = {};
    }
    CharacterComponent.prototype.cancel = function (showToast) {
        if (showToast === void 0) { showToast = true; }
        this.editCharacter = this.entityService.clone(this.character);
        if (showToast) {
            this.toastService.activate("Cancelled changes to " + this.character.name);
        }
    };
    CharacterComponent.prototype.canDeactivate = function () {
        return !this.character ||
            !this.isDirty() ||
            this.modalService.activate();
    };
    CharacterComponent.prototype.delete = function () {
        var _this = this;
        var msg = "Do you want to delete " + this.character.name + "?";
        this.modalService.activate(msg).then(function (responseOK) {
            if (responseOK) {
                _this.cancel(false);
                _this.characterService.deleteCharacter(_this.character)
                    .subscribe(function () {
                    _this.toastService.activate("Deleted " + _this.character.name);
                    _this.gotoCharacters();
                }, function (err) { return _this.handleServiceError('Delete', err); }, // Failure path
                function () { return console.log('Delete Completed'); } // Completed actions
                );
            }
        });
    };
    CharacterComponent.prototype.isAddMode = function () {
        return isNaN(this.id);
    };
    CharacterComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
    };
    CharacterComponent.prototype.ngOnInit = function () {
        var _this = this;
        componentHandler.upgradeDom();
        this.dbResetSubscription = this.characterService.onDbReset
            .subscribe(function () { return _this.getCharacter(); });
        // Could use a snapshot here, as long as the parameters do not change.
        // This may happen when a component is re-used.
        // this.id = +this.route.snapshot.params['id'];
        this.route
            .params
            .map(function (params) { return params['id']; })
            .do(function (id) { return _this.id = +id; })
            .subscribe(function (id) { return _this.getCharacter(); });
    };
    CharacterComponent.prototype.save = function () {
        var _this = this;
        var character = this.character = this.entityService.merge(this.character, this.editCharacter);
        if (character.id == null) {
            this.characterService.addCharacter(character)
                .subscribe(function (s) {
                _this.setEditCharacter(s);
                _this.toastService.activate("Successfully added " + s.name);
                _this.gotoCharacters();
            });
            return;
        }
        this.characterService.updateCharacter(character)
            .subscribe(function () { return _this.toastService.activate("Successfully saved " + character.name); });
    };
    CharacterComponent.prototype.getCharacter = function () {
        var _this = this;
        if (this.id === 0) {
            return;
        }
        ;
        if (this.isAddMode()) {
            this.character = { name: '', side: '' };
            this.editCharacter = this.entityService.clone(this.character);
            return;
        }
        this.characterService.getCharacter(this.id)
            .subscribe(function (character) { return _this.setEditCharacter(character); });
    };
    CharacterComponent.prototype.gotoCharacters = function () {
        this.router.navigate(['/characters']);
    };
    CharacterComponent.prototype.handleServiceError = function (op, err) {
        console.error(op + " error: " + (err.message || err));
    };
    CharacterComponent.prototype.isDirty = function () {
        return this.entityService.propertiesDiffer(this.character, this.editCharacter);
    };
    CharacterComponent.prototype.setEditCharacter = function (character) {
        if (character) {
            this.character = character;
            this.editCharacter = this.entityService.clone(this.character);
        }
        else {
            this.gotoCharacters();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", models_1.Character)
    ], CharacterComponent.prototype, "character", void 0);
    CharacterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-character',
            templateUrl: './character.component.html',
            styleUrls: ['./character.component.css']
        }),
        __metadata("design:paramtypes", [core_2.EntityService,
            core_2.ModalService,
            router_1.ActivatedRoute,
            router_1.Router,
            models_1.CharacterService,
            core_2.ToastService])
    ], CharacterComponent);
    return CharacterComponent;
}());
exports.CharacterComponent = CharacterComponent;
//# sourceMappingURL=character.component.js.map