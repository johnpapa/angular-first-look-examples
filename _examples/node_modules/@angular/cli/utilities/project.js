"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const find_up_1 = require("./find-up");
const core_1 = require("@angular-devkit/core");
function insideProject() {
    return getProjectDetails() !== null;
}
exports.insideProject = insideProject;
function getProjectDetails() {
    const currentDir = process.cwd();
    const possibleConfigFiles = [
        'angular.json',
        '.angular.json',
        'angular-cli.json',
        '.angular-cli.json',
    ];
    const configFilePath = find_up_1.findUp(possibleConfigFiles, currentDir);
    if (configFilePath === null) {
        return null;
    }
    const configFileName = path.basename(configFilePath);
    const possibleDir = path.dirname(configFilePath);
    const homedir = os.homedir();
    if (core_1.normalize(possibleDir) === core_1.normalize(homedir)) {
        const packageJsonPath = path.join(possibleDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            // No package.json
            return null;
        }
        const packageJsonBuffer = fs.readFileSync(packageJsonPath);
        const packageJsonText = packageJsonBuffer === null ? '{}' : packageJsonBuffer.toString();
        const packageJson = JSON.parse(packageJsonText);
        if (!containsCliDep(packageJson)) {
            // No CLI dependency
            return null;
        }
    }
    return {
        root: possibleDir,
        configFile: configFileName,
    };
}
exports.getProjectDetails = getProjectDetails;
function containsCliDep(obj) {
    const pkgName = '@angular/cli';
    if (obj) {
        if (obj.dependencies && obj.dependencies[pkgName]) {
            return true;
        }
        if (obj.devDependencies && obj.devDependencies[pkgName]) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/utilities/project.js.map