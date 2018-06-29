"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../models/command");
const core_1 = require("@angular-devkit/core");
class HelpCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'help';
        this.description = 'Help.';
        this.arguments = [];
        this.options = [];
    }
    run(options) {
        const commands = Object.keys(options.commandMap)
            .map(key => {
            const Cmd = options.commandMap[key];
            const command = new Cmd(null, null);
            return command;
        })
            .filter(cmd => !cmd.hidden && !cmd.unknown)
            .map(cmd => ({
            name: cmd.name,
            description: cmd.description
        }));
        this.logger.info(`Available Commands:`);
        commands.forEach(cmd => {
            this.logger.info(`  ${core_1.terminal.cyan(cmd.name)} ${cmd.description}`);
        });
        this.logger.info(`\nFor more detailed help run "ng [command name] --help"`);
    }
    printHelp(options) {
        return this.run(options);
    }
}
exports.default = HelpCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/help.js.map