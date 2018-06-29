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
const core_1 = require("@angular-devkit/core");
const strings_1 = require("@angular-devkit/core/src/utils/strings");
const find_up_1 = require("../utilities/find-up");
const project_1 = require("../utilities/project");
const yargsParser = require("yargs-parser");
const fs = require("fs");
const path_1 = require("path");
const SilentError = require('silent-error');
/**
 * Run a command.
 * @param commandMap Map of available commands.
 * @param args Raw unparsed arguments.
 * @param logger The logger to use.
 * @param context Execution context.
 */
function runCommand(commandMap, args, logger, context) {
    return __awaiter(this, void 0, void 0, function* () {
        // if not args supplied, just run the help command.
        if (!args || args.length === 0) {
            args = ['help'];
        }
        const rawOptions = yargsParser(args, { alias: { help: ['h'] }, boolean: ['help'] });
        let commandName = rawOptions._[0];
        // remove the command name
        rawOptions._ = rawOptions._.slice(1);
        const executionScope = project_1.insideProject()
            ? command_1.CommandScope.inProject
            : command_1.CommandScope.outsideProject;
        let Cmd;
        Cmd = findCommand(commandMap, commandName);
        if (!Cmd && !commandName && (rawOptions.v || rawOptions.version)) {
            commandName = 'version';
            Cmd = findCommand(commandMap, commandName);
        }
        if (!Cmd && rawOptions.help) {
            commandName = 'help';
            Cmd = findCommand(commandMap, commandName);
        }
        if (!Cmd) {
            // Based off https://en.wikipedia.org/wiki/Levenshtein_distance
            // No optimization, really.
            function levenshtein(a, b) {
                /* base case: empty strings */
                if (a.length == 0) {
                    return b.length;
                }
                if (b.length == 0) {
                    return a.length;
                }
                // Test if last characters of the strings match.
                const cost = a[a.length - 1] == b[b.length - 1] ? 0 : 1;
                /* return minimum of delete char from s, delete char from t, and delete char from both */
                return Math.min(levenshtein(a.slice(0, -1), b) + 1, levenshtein(a, b.slice(0, -1)) + 1, levenshtein(a.slice(0, -1), b.slice(0, -1)) + cost);
            }
            const commandsDistance = {};
            const allCommands = listAllCommandNames(commandMap).sort((a, b) => {
                if (!(a in commandsDistance)) {
                    commandsDistance[a] = levenshtein(a, commandName);
                }
                if (!(b in commandsDistance)) {
                    commandsDistance[b] = levenshtein(b, commandName);
                }
                return commandsDistance[a] - commandsDistance[b];
            });
            logger.error(core_1.tags.stripIndent `
        The specified command ("${commandName}") is invalid. For a list of available options,
        run "ng help".

        Did you mean "${allCommands[0]}"?
    `);
            return 1;
        }
        const command = new Cmd(context, logger);
        args = yield command.initializeRaw(args);
        let options = parseOptions(args, command.options, command.arguments, command.argStrategy);
        yield command.initialize(options);
        options = parseOptions(args, command.options, command.arguments, command.argStrategy);
        if (commandName === 'help') {
            options.commandMap = commandMap;
        }
        if (options.help) {
            return yield runHelp(command, options);
        }
        else {
            verifyCommandInScope(command, executionScope);
            verifyWorkspace(command, executionScope, context.project.root, command.allowMissingWorkspace ? logger : null);
            delete options.h;
            delete options.help;
            return yield validateAndRunCommand(command, options);
        }
    });
}
exports.runCommand = runCommand;
function parseOptions(args, cmdOpts, commandArguments, argStrategy) {
    const parser = yargsParser;
    const aliases = cmdOpts.concat()
        .filter(o => o.aliases && o.aliases.length > 0)
        .reduce((aliases, opt) => {
        aliases[opt.name] = opt.aliases
            .filter(a => a.length === 1);
        return aliases;
    }, {});
    const booleans = cmdOpts
        .filter(o => o.type && o.type === Boolean)
        .map(o => o.name);
    const defaults = cmdOpts
        .filter(o => o.default !== undefined || booleans.indexOf(o.name) !== -1)
        .reduce((defaults, opt) => {
        defaults[opt.name] = opt.default;
        return defaults;
    }, {});
    const strings = cmdOpts
        .filter(o => o.type === String)
        .map(o => o.name);
    const numbers = cmdOpts
        .filter(o => o.type === Number)
        .map(o => o.name);
    aliases.help = ['h'];
    booleans.push('help');
    const yargsOptions = {
        alias: aliases,
        boolean: booleans,
        default: defaults,
        string: strings,
        number: numbers
    };
    const parsedOptions = parser(args, yargsOptions);
    // Remove aliases.
    cmdOpts
        .filter(o => o.aliases && o.aliases.length > 0)
        .map(o => o.aliases)
        .reduce((allAliases, aliases) => {
        return allAliases.concat([...aliases]);
    }, [])
        .forEach((alias) => {
        delete parsedOptions[alias];
    });
    // Remove undefined booleans
    booleans
        .filter(b => parsedOptions[b] === undefined)
        .map(b => strings_1.camelize(b))
        .forEach(b => delete parsedOptions[b]);
    // remove options with dashes.
    Object.keys(parsedOptions)
        .filter(key => key.indexOf('-') !== -1)
        .forEach(key => delete parsedOptions[key]);
    // remove the command name
    parsedOptions._ = parsedOptions._.slice(1);
    switch (argStrategy) {
        case command_1.ArgumentStrategy.MapToOptions:
            parsedOptions._.forEach((value, index) => {
                const arg = commandArguments[index];
                if (arg) {
                    parsedOptions[arg] = value;
                }
            });
            delete parsedOptions._;
            break;
    }
    return parsedOptions;
}
exports.parseOptions = parseOptions;
// Find a command.
function findCommand(map, name) {
    let Cmd = map[name];
    if (!Cmd) {
        // find command via aliases
        Cmd = Object.keys(map)
            .filter(key => {
            if (!map[key].aliases) {
                return false;
            }
            const foundAlias = map[key].aliases
                .filter((alias) => alias === name);
            return foundAlias.length > 0;
        })
            .map((key) => {
            return map[key];
        })[0];
    }
    if (!Cmd) {
        return null;
    }
    return Cmd;
}
function listAllCommandNames(map) {
    return Object.keys(map).concat(Object.keys(map)
        .reduce((acc, key) => {
        if (!map[key].aliases) {
            return acc;
        }
        return acc.concat(map[key].aliases);
    }, []));
}
function verifyCommandInScope(command, scope = command_1.CommandScope.everywhere) {
    if (!command) {
        return;
    }
    if (command.scope !== command_1.CommandScope.everywhere) {
        if (command.scope !== scope) {
            let errorMessage;
            if (command.scope === command_1.CommandScope.inProject) {
                errorMessage = `This command can only be run inside of a CLI project.`;
            }
            else {
                errorMessage = `This command can not be run inside of a CLI project.`;
            }
            throw new SilentError(errorMessage);
        }
    }
}
function verifyWorkspace(command, executionScope, root, logger = null) {
    if (command.scope === command_1.CommandScope.everywhere) {
        return;
    }
    if (executionScope === command_1.CommandScope.inProject) {
        if (fs.existsSync(path_1.join(root, 'angular.json'))) {
            return;
        }
        if (fs.existsSync(path_1.join(root, '.angular.json'))) {
            return;
        }
        // Check if there's an old config file meaning that the project has not been updated
        const oldConfigFileNames = [
            core_1.normalize('.angular-cli.json'),
            core_1.normalize('angular-cli.json'),
        ];
        const oldConfigFilePath = (root && find_up_1.findUp(oldConfigFileNames, root))
            || find_up_1.findUp(oldConfigFileNames, process.cwd())
            || find_up_1.findUp(oldConfigFileNames, __dirname);
        // If an old configuration file is found, throw an exception.
        if (oldConfigFilePath) {
            // ------------------------------------------------------------------------------------------
            // If changing this message, please update the same message in
            // `packages/@angular/cli/bin/ng-update-message.js`
            const message = core_1.tags.stripIndent `
        The Angular CLI configuration format has been changed, and your existing configuration can
        be updated automatically by running the following command:

          ng update @angular/cli
      `;
            if (!logger) {
                throw new SilentError(message);
            }
            else {
                logger.warn(message);
                return;
            }
        }
        // If no configuration file is found (old or new), throw an exception.
        throw new SilentError('Invalid project: missing workspace file.');
    }
}
// Execute a command's `printHelp`.
function runHelp(command, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield command.printHelp(options);
    });
}
// Validate and run a command.
function validateAndRunCommand(command, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const isValid = yield command.validate(options);
        if (isValid !== undefined && !isValid) {
            throw new SilentError(`Validation error. Invalid command`);
        }
        return yield command.run(options);
    });
}
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/models/command-runner.js.map