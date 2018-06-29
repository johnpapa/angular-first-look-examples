"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os = require("os");
const path = require("path");
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const find_up_1 = require("./find-up");
function getSchemaLocation() {
    return path.join(__dirname, '../lib/config/schema.json');
}
exports.workspaceSchemaPath = getSchemaLocation();
const configNames = ['angular.json', '.angular.json'];
const globalFileName = '.angular-config.json';
function projectFilePath(projectPath) {
    // Find the configuration, either where specified, in the Angular CLI project
    // (if it's in node_modules) or from the current process.
    return (projectPath && find_up_1.findUp(configNames, projectPath))
        || find_up_1.findUp(configNames, process.cwd())
        || find_up_1.findUp(configNames, __dirname);
}
function globalFilePath() {
    const home = os.homedir();
    if (!home) {
        return null;
    }
    const p = path.join(home, globalFileName);
    if (fs_1.existsSync(p)) {
        return p;
    }
    return null;
}
const cachedWorkspaces = new Map();
function getWorkspace(level = 'local') {
    const cached = cachedWorkspaces.get(level);
    if (cached != undefined) {
        return cached;
    }
    let configPath = level === 'local' ? projectFilePath() : globalFilePath();
    if (!configPath) {
        cachedWorkspaces.set(level, null);
        return null;
    }
    const root = core_1.normalize(path.dirname(configPath));
    const file = core_1.normalize(path.basename(configPath));
    const workspace = new core_1.experimental.workspace.Workspace(root, new node_1.NodeJsSyncHost());
    workspace.loadWorkspaceFromHost(file).subscribe();
    cachedWorkspaces.set(level, workspace);
    return workspace;
}
exports.getWorkspace = getWorkspace;
function createGlobalSettings() {
    const home = os.homedir();
    if (!home) {
        throw new Error('No home directory found.');
    }
    const globalPath = path.join(home, globalFileName);
    fs_1.writeFileSync(globalPath, JSON.stringify({ version: 1 }));
    return globalPath;
}
exports.createGlobalSettings = createGlobalSettings;
function getWorkspaceRaw(level = 'local') {
    let configPath = level === 'local' ? projectFilePath() : globalFilePath();
    if (!configPath) {
        if (level === 'global') {
            configPath = createGlobalSettings();
        }
        else {
            return [null, null];
        }
    }
    let content;
    new node_1.NodeJsSyncHost().read(core_1.normalize(configPath))
        .subscribe(data => content = core_1.virtualFs.fileBufferToString(data));
    const ast = core_1.parseJsonAst(content, core_1.JsonParseMode.Loose);
    if (ast.kind != 'object') {
        throw new Error('Invalid JSON');
    }
    return [ast, configPath];
}
exports.getWorkspaceRaw = getWorkspaceRaw;
function validateWorkspace(json) {
    const workspace = new core_1.experimental.workspace.Workspace(core_1.normalize('.'), new node_1.NodeJsSyncHost());
    let error;
    workspace.loadWorkspaceFromJson(json).subscribe({
        error: e => error = e,
    });
    if (error) {
        throw error;
    }
    return true;
}
exports.validateWorkspace = validateWorkspace;
function getPackageManager() {
    let workspace = getWorkspace('local');
    if (workspace) {
        const project = workspace.getProjectByPath(core_1.normalize(process.cwd()));
        if (project && workspace.getProjectCli(project)) {
            const value = workspace.getProjectCli(project)['packageManager'];
            if (typeof value == 'string') {
                return value;
            }
        }
        if (workspace.getCli()) {
            const value = workspace.getCli()['packageManager'];
            if (typeof value == 'string') {
                return value;
            }
        }
    }
    workspace = getWorkspace('global');
    if (workspace && workspace.getCli()) {
        const value = workspace.getCli()['packageManager'];
        if (typeof value == 'string') {
            return value;
        }
    }
    // Only check legacy if updated workspace is not found.
    if (!workspace) {
        const legacyPackageManager = getLegacyPackageManager();
        if (legacyPackageManager !== null) {
            return legacyPackageManager;
        }
    }
    return 'npm';
}
exports.getPackageManager = getPackageManager;
function migrateLegacyGlobalConfig() {
    const homeDir = os.homedir();
    if (homeDir) {
        const legacyGlobalConfigPath = path.join(homeDir, '.angular-cli.json');
        if (fs_1.existsSync(legacyGlobalConfigPath)) {
            const content = fs_1.readFileSync(legacyGlobalConfigPath, 'utf-8');
            const legacy = core_1.parseJson(content, core_1.JsonParseMode.Loose);
            if (!legacy || typeof legacy != 'object' || Array.isArray(legacy)) {
                return false;
            }
            const cli = {};
            if (legacy.packageManager && typeof legacy.packageManager == 'string'
                && legacy.packageManager !== 'default') {
                cli['packageManager'] = legacy.packageManager;
            }
            if (legacy.defaults && typeof legacy.defaults == 'object' && !Array.isArray(legacy.defaults)
                && legacy.defaults.schematics && typeof legacy.defaults.schematics == 'object'
                && !Array.isArray(legacy.defaults.schematics)
                && typeof legacy.defaults.schematics.collection == 'string') {
                cli['defaultCollection'] = legacy.defaults.schematics.collection;
            }
            if (legacy.warnings && typeof legacy.warnings == 'object'
                && !Array.isArray(legacy.warnings)) {
                let warnings = {};
                if (typeof legacy.warnings.versionMismatch == 'boolean') {
                    warnings['versionMismatch'] = legacy.warnings.versionMismatch;
                }
                if (typeof legacy.warnings.typescriptMismatch == 'boolean') {
                    warnings['typescriptMismatch'] = legacy.warnings.typescriptMismatch;
                }
                if (Object.getOwnPropertyNames(warnings).length > 0) {
                    cli['warnings'] = warnings;
                }
            }
            if (Object.getOwnPropertyNames(cli).length > 0) {
                const globalPath = path.join(homeDir, globalFileName);
                fs_1.writeFileSync(globalPath, JSON.stringify({ version: 1, cli }, null, 2));
                return true;
            }
        }
    }
    return false;
}
exports.migrateLegacyGlobalConfig = migrateLegacyGlobalConfig;
// Fallback, check for packageManager in config file in v1.* global config.
function getLegacyPackageManager() {
    const homeDir = os.homedir();
    if (homeDir) {
        const legacyGlobalConfigPath = path.join(homeDir, '.angular-cli.json');
        if (fs_1.existsSync(legacyGlobalConfigPath)) {
            const content = fs_1.readFileSync(legacyGlobalConfigPath, 'utf-8');
            const legacy = core_1.parseJson(content, core_1.JsonParseMode.Loose);
            if (!legacy || typeof legacy != 'object' || Array.isArray(legacy)) {
                return null;
            }
            if (legacy.packageManager && typeof legacy.packageManager === 'string'
                && legacy.packageManager !== 'default') {
                return legacy.packageManager;
            }
        }
    }
    return null;
}
function getDefaultSchematicCollection() {
    let workspace = getWorkspace('local');
    if (workspace) {
        const project = workspace.getProjectByPath(core_1.normalize(process.cwd()));
        if (project && workspace.getProjectCli(project)) {
            const value = workspace.getProjectCli(project)['defaultCollection'];
            if (typeof value == 'string') {
                return value;
            }
        }
        if (workspace.getCli()) {
            const value = workspace.getCli()['defaultCollection'];
            if (typeof value == 'string') {
                return value;
            }
        }
    }
    workspace = getWorkspace('global');
    if (workspace && workspace.getCli()) {
        const value = workspace.getCli()['defaultCollection'];
        if (typeof value == 'string') {
            return value;
        }
    }
    return '@schematics/angular';
}
exports.getDefaultSchematicCollection = getDefaultSchematicCollection;
function getSchematicDefaults(collection, schematic, project) {
    let result = {};
    const fullName = `${collection}:${schematic}`;
    let workspace = getWorkspace('global');
    if (workspace && workspace.getSchematics()) {
        const schematicObject = workspace.getSchematics()[fullName];
        if (schematicObject) {
            result = Object.assign({}, result, schematicObject);
        }
        const collectionObject = workspace.getSchematics()[collection];
        if (typeof collectionObject == 'object' && !Array.isArray(collectionObject)) {
            result = Object.assign({}, result, collectionObject[schematic]);
        }
    }
    workspace = getWorkspace('local');
    if (workspace) {
        if (workspace.getSchematics()) {
            const schematicObject = workspace.getSchematics()[fullName];
            if (schematicObject) {
                result = Object.assign({}, result, schematicObject);
            }
            const collectionObject = workspace.getSchematics()[collection];
            if (typeof collectionObject == 'object' && !Array.isArray(collectionObject)) {
                result = Object.assign({}, result, collectionObject[schematic]);
            }
        }
        project = project || workspace.getProjectByPath(core_1.normalize(process.cwd()));
        if (project && workspace.getProjectSchematics(project)) {
            const schematicObject = workspace.getProjectSchematics(project)[fullName];
            if (schematicObject) {
                result = Object.assign({}, result, schematicObject);
            }
            const collectionObject = workspace.getProjectSchematics(project)[collection];
            if (typeof collectionObject == 'object' && !Array.isArray(collectionObject)) {
                result = Object.assign({}, result, collectionObject[schematic]);
            }
        }
    }
    return result;
}
exports.getSchematicDefaults = getSchematicDefaults;
function isWarningEnabled(warning) {
    let workspace = getWorkspace('local');
    if (workspace) {
        const project = workspace.getProjectByPath(core_1.normalize(process.cwd()));
        if (project && workspace.getProjectCli(project)) {
            const warnings = workspace.getProjectCli(project)['warnings'];
            if (typeof warnings == 'object' && !Array.isArray(warnings)) {
                const value = warnings[warning];
                if (typeof value == 'boolean') {
                    return value;
                }
            }
        }
        if (workspace.getCli()) {
            const warnings = workspace.getCli()['warnings'];
            if (typeof warnings == 'object' && !Array.isArray(warnings)) {
                const value = warnings[warning];
                if (typeof value == 'boolean') {
                    return value;
                }
            }
        }
    }
    workspace = getWorkspace('global');
    if (workspace && workspace.getCli()) {
        const warnings = workspace.getCli()['warnings'];
        if (typeof warnings == 'object' && !Array.isArray(warnings)) {
            const value = warnings[warning];
            if (typeof value == 'boolean') {
                return value;
            }
        }
    }
    return true;
}
exports.isWarningEnabled = isWarningEnabled;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/utilities/config.js.map