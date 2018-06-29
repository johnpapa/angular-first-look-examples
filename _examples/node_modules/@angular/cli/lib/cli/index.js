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
const operators_1 = require("rxjs/operators");
const core_1 = require("@angular-devkit/core");
const command_runner_1 = require("../../models/command-runner");
const project_1 = require("../../utilities/project");
function loadCommands() {
    return {
        // Schematics commands.
        'add': require('../../commands/add').default,
        'new': require('../../commands/new').default,
        'generate': require('../../commands/generate').default,
        'update': require('../../commands/update').default,
        // Architect commands.
        'build': require('../../commands/build').default,
        'serve': require('../../commands/serve').default,
        'test': require('../../commands/test').default,
        'e2e': require('../../commands/e2e').default,
        'lint': require('../../commands/lint').default,
        'xi18n': require('../../commands/xi18n').default,
        'run': require('../../commands/run').default,
        // Disabled commands.
        'eject': require('../../commands/eject').default,
        // Easter eggs.
        'make-this-awesome': require('../../commands/easter-egg').default,
        // Other.
        'config': require('../../commands/config').default,
        'help': require('../../commands/help').default,
        'version': require('../../commands/version').default,
        'doc': require('../../commands/doc').default,
        // deprecated
        'get': require('../../commands/getset').default,
        'set': require('../../commands/getset').default,
    };
}
function default_1(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = loadCommands();
        const logger = new core_1.logging.IndentLogger('cling');
        let loggingSubscription;
        if (!options.testing) {
            loggingSubscription = initializeLogging(logger);
        }
        let projectDetails = project_1.getProjectDetails();
        if (projectDetails === null) {
            projectDetails = { root: process.cwd() };
        }
        const context = {
            project: projectDetails
        };
        try {
            const maybeExitCode = yield command_runner_1.runCommand(commands, options.cliArgs, logger, context);
            if (typeof maybeExitCode === 'number') {
                console.assert(Number.isInteger(maybeExitCode));
                return maybeExitCode;
            }
            return 0;
        }
        catch (err) {
            if (err instanceof Error) {
                logger.fatal(err.message);
                logger.fatal(err.stack);
            }
            else if (typeof err === 'string') {
                logger.fatal(err);
            }
            else if (typeof err === 'number') {
                // Log nothing.
            }
            else {
                logger.fatal('An unexpected error occured: ' + JSON.stringify(err));
            }
            if (options.testing) {
                debugger;
                throw err;
            }
            loggingSubscription.unsubscribe();
            return 1;
        }
    });
}
exports.default = default_1;
// Initialize logging.
function initializeLogging(logger) {
    return logger
        .pipe(operators_1.filter(entry => (entry.level != 'debug')))
        .subscribe(entry => {
        let color = (x) => core_1.terminal.dim(core_1.terminal.white(x));
        let output = process.stdout;
        switch (entry.level) {
            case 'info':
                color = core_1.terminal.white;
                break;
            case 'warn':
                color = core_1.terminal.yellow;
                break;
            case 'error':
                color = core_1.terminal.red;
                output = process.stderr;
                break;
            case 'fatal':
                color = (x) => core_1.terminal.bold(core_1.terminal.red(x));
                output = process.stderr;
                break;
        }
        output.write(color(entry.message) + '\n');
    });
}
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/lib/cli/index.js.map