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
const schematic_command_1 = require("../models/schematic-command");
class NewCommand extends schematic_command_1.SchematicCommand {
    constructor() {
        super(...arguments);
        this.name = 'new';
        this.description = 'Creates a new directory and a new Angular app.';
        this.scope = command_1.CommandScope.outsideProject;
        this.allowMissingWorkspace = true;
        this.arguments = [];
        this.options = [
            ...this.coreOptions,
            {
                name: 'verbose',
                type: Boolean,
                default: false,
                aliases: ['v'],
                description: 'Adds more details to output logging.'
            },
            {
                name: 'collection',
                type: String,
                aliases: ['c'],
                description: 'Schematics collection to use.'
            }
        ];
        this.schematicName = 'ng-new';
        this.initialized = false;
    }
    initialize(options) {
        if (this.initialized) {
            return Promise.resolve();
        }
        super.initialize(options);
        this.initialized = true;
        const collectionName = this.parseCollectionName(options);
        return this.getOptions({
            schematicName: this.schematicName,
            collectionName,
        })
            .then((schematicOptions) => {
            this.options = this.options.concat(schematicOptions.options);
            const args = schematicOptions.arguments.map(arg => arg.name);
            this.arguments = this.arguments.concat(args);
        });
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.dryRun) {
                options.skipGit = true;
            }
            let collectionName;
            if (options.collection) {
                collectionName = options.collection;
            }
            else {
                collectionName = this.parseCollectionName(options);
            }
            const pathOptions = this.setPathOptions(options, '/');
            options = Object.assign({}, options, pathOptions);
            const packageJson = require('../package.json');
            options.version = packageJson.version;
            // Ensure skipGit has a boolean value.
            options.skipGit = options.skipGit === undefined ? false : options.skipGit;
            options = this.removeLocalOptions(options);
            return this.runSchematic({
                collectionName: collectionName,
                schematicName: this.schematicName,
                schematicOptions: options,
                debug: options.debug,
                dryRun: options.dryRun,
                force: options.force
            });
        });
    }
    parseCollectionName(options) {
        const collectionName = options.collection || options.c || config_1.getDefaultSchematicCollection();
        return collectionName;
    }
    removeLocalOptions(options) {
        const opts = Object.assign({}, options);
        delete opts.verbose;
        delete opts.collection;
        return opts;
    }
}
NewCommand.aliases = ['n'];
exports.default = NewCommand;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/commands/new.js.map