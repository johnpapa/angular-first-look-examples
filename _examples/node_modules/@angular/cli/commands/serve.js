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
const version_1 = require("../upgrade/version");
const architect_command_1 = require("../models/architect-command");
class ServeCommand extends architect_command_1.ArchitectCommand {
    constructor() {
        super(...arguments);
        this.name = 'serve';
        this.target = 'serve';
        this.description = 'Builds and serves your app, rebuilding on file changes.';
        this.scope = command_1.CommandScope.inProject;
        this.options = [
            this.prodOption,
            this.configurationOption
        ];
    }
    validate(_options) {
        // Check Angular and TypeScript versions.
        version_1.Version.assertCompatibleAngularVersion(this.project.root);
        version_1.Version.assertTypescriptVersion(this.project.root);
        return true;
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runArchitectTarget(options);
        });
    }
}
ServeCommand.aliases = ['s'];
exports.default = ServeCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/serve.js.map