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
const core_1 = require("@angular-devkit/core");
var CommandScope;
(function (CommandScope) {
    CommandScope[CommandScope["everywhere"] = 0] = "everywhere";
    CommandScope[CommandScope["inProject"] = 1] = "inProject";
    CommandScope[CommandScope["outsideProject"] = 2] = "outsideProject";
})(CommandScope = exports.CommandScope || (exports.CommandScope = {}));
var ArgumentStrategy;
(function (ArgumentStrategy) {
    ArgumentStrategy[ArgumentStrategy["MapToOptions"] = 0] = "MapToOptions";
    ArgumentStrategy[ArgumentStrategy["Nothing"] = 1] = "Nothing";
})(ArgumentStrategy = exports.ArgumentStrategy || (exports.ArgumentStrategy = {}));
class Command {
    constructor(context, logger) {
        this.allowMissingWorkspace = false;
        this.argStrategy = ArgumentStrategy.MapToOptions;
        this.hidden = false;
        this.unknown = false;
        this.scope = CommandScope.everywhere;
        this.logger = logger;
        if (context) {
            this.project = context.project;
        }
    }
    initializeRaw(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this._rawArgs = args;
            return args;
        });
    }
    initialize(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    validate(_options) {
        return true;
    }
    printHelp(_options) {
        this.printHelpUsage(this.name, this.arguments, this.options);
        this.printHelpOptions(this.options);
    }
    printHelpUsage(name, args, options) {
        const argDisplay = args && args.length > 0
            ? ' ' + args.map(a => `<${a}>`).join(' ')
            : '';
        const optionsDisplay = options && options.length > 0
            ? ` [options]`
            : ``;
        this.logger.info(`usage: ng ${name}${argDisplay}${optionsDisplay}`);
    }
    printHelpOptions(options) {
        if (options && this.options.length > 0) {
            this.logger.info(`options:`);
            this.options
                .filter(o => !o.hidden)
                .sort((a, b) => a.name >= b.name ? 1 : -1)
                .forEach(o => {
                const aliases = o.aliases && o.aliases.length > 0
                    ? '(' + o.aliases.map(a => `-${a}`).join(' ') + ')'
                    : '';
                this.logger.info(`  ${core_1.terminal.cyan('--' + o.name)} ${aliases}`);
                this.logger.info(`    ${o.description}`);
            });
        }
    }
}
exports.Command = Command;
class Option {
    constructor() {
        this.hidden = false;
    }
}
exports.Option = Option;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/models/command.js.map