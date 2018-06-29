"use strict";
/**
 * Refer to the angular shematics library to let the dependency validator
 * know it is used..
 *
 * require('@schematics/angular')
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tools_1 = require("@angular-devkit/schematics/tools");
const SilentError = require('silent-error');
const engineHost = new tools_1.NodeModulesEngineHost();
const engine = new schematics_1.SchematicEngine(engineHost);
// Add support for schemaJson.
const registry = new core_1.schema.CoreSchemaRegistry(schematics_1.formats.standardFormats);
engineHost.registerOptionsTransform(tools_1.validateOptionsWithSchema(registry));
function getEngineHost() {
    return engineHost;
}
exports.getEngineHost = getEngineHost;
function getEngine() {
    return engine;
}
exports.getEngine = getEngine;
function getCollection(collectionName) {
    const engine = getEngine();
    const collection = engine.createCollection(collectionName);
    if (collection === null) {
        throw new SilentError(`Invalid collection (${collectionName}).`);
    }
    return collection;
}
exports.getCollection = getCollection;
function getSchematic(collection, schematicName, allowPrivate) {
    return collection.createSchematic(schematicName, allowPrivate);
}
exports.getSchematic = getSchematic;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/utilities/schematics.js.map