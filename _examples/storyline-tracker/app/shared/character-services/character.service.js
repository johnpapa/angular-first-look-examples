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
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var config_1 = require('../config');
var exception_service_1 = require('../exception.service');
var message_service_1 = require('../message.service');
var spinner_1 = require('../spinner');
var charactersUrl = config_1.CONFIG.baseUrls.characters;
var CharacterService = (function () {
    function CharacterService(http, exceptionService, messageService, spinnerService) {
        var _this = this;
        this.http = http;
        this.exceptionService = exceptionService;
        this.messageService = messageService;
        this.spinnerService = spinnerService;
        this.onDbReset = this.messageService.state;
        this.messageService.state.subscribe(function (state) { return _this.getCharacters(); });
    }
    CharacterService.prototype.addCharacter = function (character) {
        var _this = this;
        var body = JSON.stringify(character);
        this.spinnerService.show();
        return this.http
            .post("" + charactersUrl, body)
            .map(function (res) { return res.json().data; })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.deleteCharacter = function (character) {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .delete(charactersUrl + "/" + character.id)
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.getCharacters = function () {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(charactersUrl)
            .map(function (res) { return res.json().data; })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.getCharacter = function (id) {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(charactersUrl + "/" + id)
            .map(function (response) { return response.json().data; })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.updateCharacter = function (character) {
        var _this = this;
        var body = JSON.stringify(character);
        this.spinnerService.show();
        return this.http
            .put(charactersUrl + "/" + character.id, body)
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, exception_service_1.ExceptionService, message_service_1.MessageService, spinner_1.SpinnerService])
    ], CharacterService);
    return CharacterService;
}());
exports.CharacterService = CharacterService;
//# sourceMappingURL=character.service.js.map