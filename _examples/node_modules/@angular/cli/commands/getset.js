"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../models/command");
class GetSetCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'getset';
        this.description = 'Deprecated in favor of config command.';
        this.arguments = [];
        this.options = [];
        this.hidden = true;
    }
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.warn('get/set have been deprecated in favor of the config command.');
        });
    }
}
exports.default = GetSetCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/getset.js.map