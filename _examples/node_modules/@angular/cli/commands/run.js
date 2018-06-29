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
const architect_command_1 = require("../models/architect-command");
class RunCommand extends architect_command_1.ArchitectCommand {
    constructor() {
        super(...arguments);
        this.name = 'run';
        this.description = 'Runs Architect targets.';
        this.scope = command_1.CommandScope.inProject;
        this.arguments = ['target'];
        this.options = [
            this.configurationOption
        ];
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.target) {
                return this.runArchitectTarget(options);
            }
            else {
                throw new Error('Invalid architect target.');
            }
        });
    }
}
exports.default = RunCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/run.js.map