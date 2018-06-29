"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const command_1 = require("../models/command");
class EjectCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'eject';
        this.description = 'Temporarily disabled. Ejects your app and output the proper '
            + 'webpack configuration and scripts.';
        this.arguments = [];
        this.options = [];
    }
    run() {
        this.logger.info(core_1.tags.stripIndents `
      The 'eject' command has been temporarily disabled, as it is not yet compatible with the new
      angular.json format. The new configuration format provides further flexibility to modify the
      configuration of your workspace without ejecting. Ejection will be re-enabled in a future
      release of the CLI.

      If you need to eject today, use CLI 1.7 to eject your project.
    `);
    }
}
exports.default = EjectCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/eject.js.map