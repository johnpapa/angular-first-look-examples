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
const config_1 = require("../utilities/config");
const schematics_1 = require("../utilities/schematics");
const core_1 = require("@angular-devkit/core");
const schematic_command_1 = require("../models/schematic-command");
class GenerateCommand extends schematic_command_1.SchematicCommand {
    constructor() {
        super(...arguments);
        this.name = 'generate';
        this.description = 'Generates and/or modifies files based on a schematic.';
        this.scope = command_1.CommandScope.inProject;
        this.arguments = ['schematic'];
        this.options = [
            ...this.coreOptions
        ];
        this.initialized = false;
    }
    initialize(options) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized) {
                return;
            }
            _super("initialize").call(this, options);
            this.initialized = true;
            const [collectionName, schematicName] = this.parseSchematicInfo(options);
            if (!!schematicName) {
                const schematicOptions = yield this.getOptions({
                    schematicName,
                    collectionName,
                });
                this.options = this.options.concat(schematicOptions.options);
                this.arguments = this.arguments.concat(schematicOptions.arguments.map(a => a.name));
            }
        });
    }
    validate(options) {
        if (!options._[0]) {
            this.logger.error(core_1.tags.oneLine `
        The "ng generate" command requires a
        schematic name to be specified.
        For more details, use "ng help".`);
            return false;
        }
        return true;
    }
    run(options) {
        const [collectionName, schematicName] = this.parseSchematicInfo(options);
        // remove the schematic name from the options
        options._ = options._.slice(1);
        return this.runSchematic({
            collectionName,
            schematicName,
            schematicOptions: options,
            debug: options.debug,
            dryRun: options.dryRun,
            force: options.force,
        });
    }
    parseSchematicInfo(options) {
        let collectionName = config_1.getDefaultSchematicCollection();
        let schematicName = options._[0];
        if (schematicName) {
            if (schematicName.includes(':')) {
                [collectionName, schematicName] = schematicName.split(':', 2);
            }
        }
        return [collectionName, schematicName];
    }
    printHelp(options) {
        const schematicName = options._[0];
        if (schematicName) {
            const argDisplay = this.arguments && this.arguments.length > 0
                ? ' ' + this.arguments.filter(a => a !== 'schematic').map(a => `<${a}>`).join(' ')
                : '';
            const optionsDisplay = this.options && this.options.length > 0
                ? ' [options]'
                : '';
            this.logger.info(`usage: ng generate ${schematicName}${argDisplay}${optionsDisplay}`);
            this.printHelpOptions(options);
        }
        else {
            this.printHelpUsage(this.name, this.arguments, this.options);
            const engineHost = schematics_1.getEngineHost();
            const [collectionName] = this.parseSchematicInfo(options);
            const collection = schematics_1.getCollection(collectionName);
            const schematicNames = engineHost.listSchematics(collection);
            this.logger.info('Available schematics:');
            schematicNames.forEach(schematicName => {
                this.logger.info(`    ${schematicName}`);
            });
            this.logger.warn(`\nTo see help for a schematic run:`);
            this.logger.info(core_1.terminal.cyan(`  ng generate <schematic> --help`));
        }
    }
}
GenerateCommand.aliases = ['g'];
exports.default = GenerateCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/generate.js.map