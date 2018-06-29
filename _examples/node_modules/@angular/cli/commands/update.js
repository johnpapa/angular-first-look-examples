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
const command_1 = require("../models/command");
const schematic_command_1 = require("../models/schematic-command");
const find_up_1 = require("../utilities/find-up");
class UpdateCommand extends schematic_command_1.SchematicCommand {
    constructor() {
        super(...arguments);
        this.name = 'update';
        this.description = 'Updates your application and its dependencies.';
        this.scope = command_1.CommandScope.everywhere;
        this.arguments = ['packages'];
        this.options = [
            // Remove the --force flag.
            ...this.coreOptions.filter(option => option.name !== 'force'),
        ];
        this.allowMissingWorkspace = true;
        this.collectionName = '@schematics/update';
        this.schematicName = 'update';
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
            const schematicOptions = yield this.getOptions({
                schematicName: this.schematicName,
                collectionName: this.collectionName,
            });
            this.options = this.options.concat(schematicOptions.options);
            this.arguments = this.arguments.concat(schematicOptions.arguments.map(a => a.name));
        });
    }
    validate(options) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            if (options._[0] == '@angular/cli'
                && options.migrateOnly === undefined
                && options.from === undefined) {
                // Check for a 1.7 angular-cli.json file.
                const oldConfigFileNames = [
                    core_1.normalize('.angular-cli.json'),
                    core_1.normalize('angular-cli.json'),
                ];
                const oldConfigFilePath = find_up_1.findUp(oldConfigFileNames, process.cwd())
                    || find_up_1.findUp(oldConfigFileNames, __dirname);
                if (oldConfigFilePath) {
                    options.migrateOnly = true;
                    options.from = '1.0.0';
                }
            }
            return _super("validate").call(this, options);
        });
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runSchematic({
                collectionName: this.collectionName,
                schematicName: this.schematicName,
                schematicOptions: options,
                dryRun: options.dryRun,
                force: false,
                showNothingDone: false,
            });
        });
    }
}
UpdateCommand.aliases = [];
exports.default = UpdateCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/update.js.map