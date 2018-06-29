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
var http_1 = require("@angular/http");
var core_2 = require("../core");
var charactersUrl = core_2.CONFIG.baseUrls.characters;
var CharacterService = /** @class */ (function () {
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
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.getCharacters = function () {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(charactersUrl)
            .map(function (res) {
            var x = _this.extractData(res);
            return _this.extractData(res);
        })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.getCharacter = function (id) {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(charactersUrl + "/" + id)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.updateCharacter = function (character) {
        var _this = this;
        var body = JSON.stringify(character);
        this.spinnerService.show();
        return this.http
            .put(charactersUrl + "/" + character.id, body)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    CharacterService.prototype.extractData = function (res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        var body = res.json ? res.json() : null;
        return (body && body.data || {});
    };
    CharacterService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            core_2.ExceptionService,
            core_2.MessageService,
            core_2.SpinnerService])
    ], CharacterService);
    return CharacterService;
}());
exports.CharacterService = CharacterService;
//# sourceMappingURL=character.service.js.map