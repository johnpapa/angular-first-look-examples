"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const semver = require("semver");
const npm_1 = require("./npm");
// This is a map of packageGroupName to range extending function. If it isn't found, the range is
// kept the same.
// Angular guarantees that a major is compatible with its following major (so packages that depend
// on Angular 5 are also compatible with Angular 6). This is, in code, represented by verifying
// that all other packages that have a peer dependency of `"@angular/core": "^5.0.0"` actually
// supports 6.0, by adding that compatibility to the range, so it is `^5.0.0 || ^6.0.0`.
const peerCompatibleWhitelist = {
    '@angular/core': (range) => {
        range = semver.validRange(range);
        let major = 1;
        while (!semver.gtr(major + '.0.0', range)) {
            major++;
            if (major >= 99) {
                // Use original range if it supports a major this high
                // Range is most likely unbounded (e.g., >=5.0.0)
                return range;
            }
        }
        // Add the major version as compatible with the angular compatible. This is already one
        // major above the greatest supported, because we increment `major` before checking.
        return semver.validRange(`^${major}.0.0-rc.0 || ${range}`) || range;
    },
};
function _updatePeerVersion(infoMap, name, range) {
    // Resolve packageGroupName.
    const maybePackageInfo = infoMap.get(name);
    if (!maybePackageInfo) {
        return range;
    }
    if (maybePackageInfo.target) {
        name = maybePackageInfo.target.updateMetadata.packageGroup[0] || name;
    }
    else {
        name = maybePackageInfo.installed.updateMetadata.packageGroup[0] || name;
    }
    const maybeTransform = peerCompatibleWhitelist[name];
    if (maybeTransform) {
        if (typeof maybeTransform == 'function') {
            return maybeTransform(range);
        }
        else {
            return maybeTransform;
        }
    }
    return range;
}
function _validateForwardPeerDependencies(name, infoMap, peers, logger) {
    for (const [peer, range] of Object.entries(peers)) {
        logger.debug(`Checking forward peer ${peer}...`);
        const maybePeerInfo = infoMap.get(peer);
        if (!maybePeerInfo) {
            logger.error([
                `Package ${JSON.stringify(name)} has a missing peer dependency of`,
                `${JSON.stringify(peer)} @ ${JSON.stringify(range)}.`,
            ].join(' '));
            return true;
        }
        const peerVersion = maybePeerInfo.target && maybePeerInfo.target.packageJson.version
            ? maybePeerInfo.target.packageJson.version
            : maybePeerInfo.installed.version;
        logger.debug(`  Range intersects(${range}, ${peerVersion})...`);
        if (!semver.satisfies(peerVersion, range)) {
            logger.error([
                `Package ${JSON.stringify(name)} has an incompatible peer dependency to`,
                `${JSON.stringify(peer)} (requires ${JSON.stringify(range)},`,
                `would install ${JSON.stringify(peerVersion)})`,
            ].join(' '));
            return true;
        }
    }
    return false;
}
function _validateReversePeerDependencies(name, version, infoMap, logger) {
    for (const [installed, installedInfo] of infoMap.entries()) {
        const installedLogger = logger.createChild(installed);
        installedLogger.debug(`${installed}...`);
        const peers = (installedInfo.target || installedInfo.installed).packageJson.peerDependencies;
        for (let [peer, range] of Object.entries(peers || {})) {
            if (peer != name) {
                // Only check peers to the packages we're updating. We don't care about peers
                // that are unmet but we have no effect on.
                continue;
            }
            // Override the peer version range if it's whitelisted.
            range = _updatePeerVersion(infoMap, peer, range);
            if (!semver.satisfies(version, range)) {
                logger.error([
                    `Package ${JSON.stringify(installed)} has an incompatible peer dependency to`,
                    `${JSON.stringify(name)} (requires ${JSON.stringify(range)},`,
                    `would install ${JSON.stringify(version)}).`,
                ].join(' '));
                return true;
            }
        }
    }
    return false;
}
function _validateUpdatePackages(infoMap, force, logger) {
    logger.debug('Updating the following packages:');
    infoMap.forEach(info => {
        if (info.target) {
            logger.debug(`  ${info.name} => ${info.target.version}`);
        }
    });
    let peerErrors = false;
    infoMap.forEach(info => {
        const { name, target } = info;
        if (!target) {
            return;
        }
        const pkgLogger = logger.createChild(name);
        logger.debug(`${name}...`);
        const peers = target.packageJson.peerDependencies || {};
        peerErrors = _validateForwardPeerDependencies(name, infoMap, peers, pkgLogger) || peerErrors;
        peerErrors
            = _validateReversePeerDependencies(name, target.version, infoMap, pkgLogger)
                || peerErrors;
    });
    if (!force && peerErrors) {
        throw new schematics_1.SchematicsException(`Incompatible peer dependencies found. See above.`);
    }
}
function _performUpdate(tree, context, infoMap, logger, migrateOnly) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    const updateDependency = (deps, name, newVersion) => {
        const oldVersion = deps[name];
        // We only respect caret and tilde ranges on update.
        const execResult = /^[\^~]/.exec(oldVersion);
        deps[name] = `${execResult ? execResult[0] : ''}${newVersion}`;
    };
    const toInstall = [...infoMap.values()]
        .map(x => [x.name, x.target, x.installed])
        .filter(([name, target, installed]) => {
        return !!name && !!target && !!installed;
    });
    toInstall.forEach(([name, target, installed]) => {
        logger.info(`Updating package.json with dependency ${name} `
            + `@ ${JSON.stringify(target.version)} (was ${JSON.stringify(installed.version)})...`);
        if (packageJson.dependencies && packageJson.dependencies[name]) {
            updateDependency(packageJson.dependencies, name, target.version);
            if (packageJson.devDependencies && packageJson.devDependencies[name]) {
                delete packageJson.devDependencies[name];
            }
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
            updateDependency(packageJson.devDependencies, name, target.version);
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
            updateDependency(packageJson.peerDependencies, name, target.version);
        }
        else {
            logger.warn(`Package ${name} was not found in dependencies.`);
        }
    });
    const newContent = JSON.stringify(packageJson, null, 2);
    if (packageJsonContent.toString() != newContent || migrateOnly) {
        let installTask = [];
        if (!migrateOnly) {
            // If something changed, also hook up the task.
            tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
            installTask = [context.addTask(new tasks_1.NodePackageInstallTask())];
        }
        // Run the migrate schematics with the list of packages to use. The collection contains
        // version information and we need to do this post installation. Please note that the
        // migration COULD fail and leave side effects on disk.
        // Run the schematics task of those packages.
        toInstall.forEach(([name, target, installed]) => {
            if (!target.updateMetadata.migrations) {
                return;
            }
            const collection = (target.updateMetadata.migrations.match(/^[./]/)
                ? name + '/'
                : '') + target.updateMetadata.migrations;
            context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
                package: name,
                collection,
                from: installed.version,
                to: target.version,
            }), installTask);
        });
    }
    return rxjs_1.of(undefined);
}
function _migrateOnly(info, context, from, to) {
    if (!info) {
        return rxjs_1.of();
    }
    const target = info.installed;
    if (!target || !target.updateMetadata.migrations) {
        return rxjs_1.of(undefined);
    }
    const collection = (target.updateMetadata.migrations.match(/^[./]/)
        ? info.name + '/'
        : '') + target.updateMetadata.migrations;
    context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
        package: info.name,
        collection,
        from: from,
        to: to || target.version,
    }));
    return rxjs_1.of(undefined);
}
function _getUpdateMetadata(packageJson, logger) {
    const metadata = packageJson['ng-update'];
    const result = {
        packageGroup: [],
        requirements: {},
    };
    if (!metadata || typeof metadata != 'object' || Array.isArray(metadata)) {
        return result;
    }
    if (metadata['packageGroup']) {
        const packageGroup = metadata['packageGroup'];
        // Verify that packageGroup is an array of strings. This is not an error but we still warn
        // the user and ignore the packageGroup keys.
        if (!Array.isArray(packageGroup) || packageGroup.some(x => typeof x != 'string')) {
            logger.warn(`packageGroup metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.packageGroup = packageGroup;
        }
    }
    if (metadata['requirements']) {
        const requirements = metadata['requirements'];
        // Verify that requirements are
        if (typeof requirements != 'object'
            || Array.isArray(requirements)
            || Object.keys(requirements).some(name => typeof requirements[name] != 'string')) {
            logger.warn(`requirements metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.requirements = requirements;
        }
    }
    if (metadata['migrations']) {
        const migrations = metadata['migrations'];
        if (typeof migrations != 'string') {
            logger.warn(`migrations metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.migrations = migrations;
        }
    }
    return result;
}
function _usageMessage(options, infoMap, logger) {
    const packageGroups = new Map();
    const packagesToUpdate = [...infoMap.entries()]
        .map(([name, info]) => {
        const tag = options.next
            ? (info.npmPackageJson['dist-tags']['next'] ? 'next' : 'latest') : 'latest';
        const version = info.npmPackageJson['dist-tags'][tag];
        const target = info.npmPackageJson.versions[version];
        return {
            name,
            info,
            version,
            tag,
            target,
        };
    })
        .filter(({ name, info, version, target }) => {
        return (target && semver.compare(info.installed.version, version) < 0);
    })
        .filter(({ target }) => {
        return target['ng-update'];
    })
        .map(({ name, info, version, tag, target }) => {
        // Look for packageGroup.
        if (target['ng-update'] && target['ng-update']['packageGroup']) {
            const packageGroup = target['ng-update']['packageGroup'];
            const packageGroupName = target['ng-update']['packageGroupName']
                || target['ng-update']['packageGroup'][0];
            if (packageGroupName) {
                if (packageGroups.has(name)) {
                    return null;
                }
                packageGroup.forEach((x) => packageGroups.set(x, packageGroupName));
                packageGroups.set(packageGroupName, packageGroupName);
                name = packageGroupName;
            }
        }
        let command = `ng update ${name}`;
        if (tag == 'next') {
            command += ' --next';
        }
        return [name, `${info.installed.version} -> ${version}`, command];
    })
        .filter(x => x !== null)
        .sort((a, b) => a && b ? a[0].localeCompare(b[0]) : 0);
    if (packagesToUpdate.length == 0) {
        logger.info('We analyzed your package.json and everything seems to be in order. Good work!');
        return rxjs_1.of(undefined);
    }
    logger.info('We analyzed your package.json, there are some packages to update:\n');
    // Find the largest name to know the padding needed.
    let namePad = Math.max(...[...infoMap.keys()].map(x => x.length)) + 2;
    if (!Number.isFinite(namePad)) {
        namePad = 30;
    }
    const pads = [namePad, 25, 0];
    logger.info('  '
        + ['Name', 'Version', 'Command to update'].map((x, i) => x.padEnd(pads[i])).join(''));
    logger.info(' ' + '-'.repeat(pads.reduce((s, x) => s += x, 0) + 20));
    packagesToUpdate.forEach(fields => {
        if (!fields) {
            return;
        }
        logger.info('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''));
    });
    logger.info('\n');
    logger.info('There might be additional packages that are outdated.');
    logger.info('Or run ng update --all to try to update all at the same time.\n');
    return rxjs_1.of(undefined);
}
function _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger) {
    const name = npmPackageJson.name;
    const packageJsonRange = allDependencies.get(name);
    if (!packageJsonRange) {
        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(name)} was not found in package.json.`);
    }
    // Find out the currently installed version. Either from the package.json or the node_modules/
    // TODO: figure out a way to read package-lock.json and/or yarn.lock.
    let installedVersion;
    const packageContent = tree.read(`/node_modules/${name}/package.json`);
    if (packageContent) {
        const content = JSON.parse(packageContent.toString());
        installedVersion = content.version;
    }
    if (!installedVersion) {
        // Find the version from NPM that fits the range to max.
        installedVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), packageJsonRange);
    }
    const installedPackageJson = npmPackageJson.versions[installedVersion] || packageContent;
    if (!installedPackageJson) {
        throw new schematics_1.SchematicsException(`An unexpected error happened; package ${name} has no version ${installedVersion}.`);
    }
    let targetVersion = packages.get(name);
    if (targetVersion) {
        if (npmPackageJson['dist-tags'][targetVersion]) {
            targetVersion = npmPackageJson['dist-tags'][targetVersion];
        }
        else if (targetVersion == 'next') {
            targetVersion = npmPackageJson['dist-tags']['latest'];
        }
        else {
            targetVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), targetVersion);
        }
    }
    if (targetVersion && semver.lte(targetVersion, installedVersion)) {
        logger.debug(`Package ${name} already satisfied by package.json (${packageJsonRange}).`);
        targetVersion = undefined;
    }
    const target = targetVersion
        ? {
            version: targetVersion,
            packageJson: npmPackageJson.versions[targetVersion],
            updateMetadata: _getUpdateMetadata(npmPackageJson.versions[targetVersion], logger),
        }
        : undefined;
    // Check if there's an installed version.
    return {
        name,
        npmPackageJson,
        installed: {
            version: installedVersion,
            packageJson: installedPackageJson,
            updateMetadata: _getUpdateMetadata(installedPackageJson, logger),
        },
        target,
        packageJsonRange,
    };
}
function _buildPackageList(options, projectDeps, logger) {
    // Parse the packages options to set the targeted version.
    const packages = new Map();
    const commandLinePackages = (options.packages && options.packages.length > 0)
        ? options.packages
        : (options.all ? projectDeps.keys() : []);
    for (const pkg of commandLinePackages) {
        // Split the version asked on command line.
        const m = pkg.match(/^((?:@[^/]{1,100}\/)?[^@]{1,100})(?:@(.{1,100}))?$/);
        if (!m) {
            logger.warn(`Invalid package argument: ${JSON.stringify(pkg)}. Skipping.`);
            continue;
        }
        const [, npmName, maybeVersion] = m;
        const version = projectDeps.get(npmName);
        if (!version) {
            logger.warn(`Package not installed: ${JSON.stringify(npmName)}. Skipping.`);
            continue;
        }
        // Verify that people have an actual version in the package.json, otherwise (label or URL or
        // gist or ...) we don't update it.
        if (version.startsWith('http:') // HTTP
            || version.startsWith('file:') // Local folder
            || version.startsWith('git:') // GIT url
            || version.match(/^\w{1,100}\/\w{1,100}/) // GitHub's "user/repo"
            || version.match(/^(?:\.{0,2}\/)\w{1,100}/) // Local folder, maybe relative.
        ) {
            // We only do that for --all. Otherwise we have the installed version and the user specified
            // it on the command line.
            if (options.all) {
                logger.warn(`Package ${JSON.stringify(npmName)} has a custom version: `
                    + `${JSON.stringify(version)}. Skipping.`);
                continue;
            }
        }
        packages.set(npmName, (maybeVersion || (options.next ? 'next' : 'latest')));
    }
    return packages;
}
function _addPackageGroup(packages, allDependencies, npmPackageJson, logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const version = npmPackageJson['dist-tags'][maybePackage] || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const ngUpdateMetadata = npmPackageJson.versions[version]['ng-update'];
    if (!ngUpdateMetadata) {
        return;
    }
    const packageGroup = ngUpdateMetadata['packageGroup'];
    if (!packageGroup) {
        return;
    }
    if (!Array.isArray(packageGroup) || packageGroup.some(x => typeof x != 'string')) {
        logger.warn(`packageGroup metadata of package ${npmPackageJson.name} is malformed.`);
        return;
    }
    packageGroup
        .filter(name => !packages.has(name)) // Don't override names from the command line.
        .filter(name => allDependencies.has(name)) // Remove packages that aren't installed.
        .forEach(name => {
        packages.set(name, maybePackage);
    });
}
/**
 * Add peer dependencies of packages on the command line to the list of packages to update.
 * We don't do verification of the versions here as this will be done by a later step (and can
 * be ignored by the --force flag).
 * @private
 */
function _addPeerDependencies(packages, _allDependencies, npmPackageJson, _logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const version = npmPackageJson['dist-tags'][maybePackage] || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const packageJson = npmPackageJson.versions[version];
    const error = false;
    for (const [peer, range] of Object.entries(packageJson.peerDependencies || {})) {
        if (!packages.has(peer)) {
            packages.set(peer, range);
        }
    }
    if (error) {
        throw new schematics_1.SchematicsException('An error occured, see above.');
    }
}
function _getAllDependencies(tree) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    return new Map([
        ...Object.entries(packageJson.peerDependencies || {}),
        ...Object.entries(packageJson.devDependencies || {}),
        ...Object.entries(packageJson.dependencies || {}),
    ]);
}
function _formatVersion(version) {
    if (version === undefined) {
        return undefined;
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!semver.valid(version)) {
        throw new schematics_1.SchematicsException(`Invalid migration version: ${JSON.stringify(version)}`);
    }
    return version;
}
function default_1(options) {
    if (!options.packages) {
        // We cannot just return this because we need to fetch the packages from NPM still for the
        // help/guide to show.
        options.packages = [];
    }
    else if (typeof options.packages == 'string') {
        // If a string, then we should split it and make it an array.
        options.packages = options.packages.split(/,/g);
    }
    if (options.migrateOnly && options.from) {
        if (options.packages.length !== 1) {
            throw new schematics_1.SchematicsException('--from requires that only a single package be passed.');
        }
    }
    options.from = _formatVersion(options.from);
    options.to = _formatVersion(options.to);
    return (tree, context) => {
        const logger = context.logger;
        const allDependencies = _getAllDependencies(tree);
        const packages = _buildPackageList(options, allDependencies, logger);
        return rxjs_1.from([...allDependencies.keys()]).pipe(
        // Grab all package.json from the npm repository. This requires a lot of HTTP calls so we
        // try to parallelize as many as possible.
        operators_1.mergeMap(depName => npm_1.getNpmPackageJson(depName, options.registry, logger)), 
        // Build a map of all dependencies and their packageJson.
        operators_1.reduce((acc, npmPackageJson) => {
            // If the package was not found on the registry. It could be private, so we will just
            // ignore. If the package was part of the list, we will error out, but will simply ignore
            // if it's either not requested (so just part of package.json. silently) or if it's a
            // `--all` situation. There is an edge case here where a public package peer depends on a
            // private one, but it's rare enough.
            if (!npmPackageJson.name) {
                if (packages.has(npmPackageJson.requestedName)) {
                    if (options.all) {
                        logger.warn(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not `
                            + 'found on the registry. Skipping.');
                    }
                    else {
                        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not found on the `
                            + 'registry. Cannot continue as this may be an error.');
                    }
                }
            }
            else {
                acc.set(npmPackageJson.name, npmPackageJson);
            }
            return acc;
        }, new Map()), operators_1.map(npmPackageJsonMap => {
            // Augment the command line package list with packageGroups and forward peer dependencies.
            // Each added package may uncover new package groups and peer dependencies, so we must
            // repeat this process until the package list stabilizes.
            let lastPackagesSize;
            do {
                lastPackagesSize = packages.size;
                npmPackageJsonMap.forEach((npmPackageJson) => {
                    _addPackageGroup(packages, allDependencies, npmPackageJson, logger);
                    _addPeerDependencies(packages, allDependencies, npmPackageJson, logger);
                });
            } while (packages.size > lastPackagesSize);
            // Build the PackageInfo for each module.
            const packageInfoMap = new Map();
            npmPackageJsonMap.forEach((npmPackageJson) => {
                packageInfoMap.set(npmPackageJson.name, _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger));
            });
            return packageInfoMap;
        }), operators_1.switchMap(infoMap => {
            // Now that we have all the information, check the flags.
            if (packages.size > 0) {
                if (options.migrateOnly && options.from && options.packages) {
                    return _migrateOnly(infoMap.get(options.packages[0]), context, options.from, options.to);
                }
                const sublog = new core_1.logging.LevelCapLogger('validation', logger.createChild(''), 'warn');
                _validateUpdatePackages(infoMap, options.force, sublog);
                return _performUpdate(tree, context, infoMap, logger, options.migrateOnly);
            }
            else {
                return _usageMessage(options, infoMap, logger);
            }
        }), operators_1.switchMap(() => rxjs_1.of(tree)));
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvdXBkYXRlL3VwZGF0ZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUErQztBQUMvQywyREFNb0M7QUFDcEMsNERBQTRGO0FBQzVGLCtCQUE4RDtBQUM5RCw4Q0FBa0U7QUFDbEUsaUNBQWlDO0FBQ2pDLCtCQUEwQztBQVExQyxpR0FBaUc7QUFDakcsaUJBQWlCO0FBQ2pCLGtHQUFrRztBQUNsRywrRkFBK0Y7QUFDL0YsOEZBQThGO0FBQzlGLHdGQUF3RjtBQUN4RixNQUFNLHVCQUF1QixHQUE2QztJQUN4RSxlQUFlLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUNqQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFDUixFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsc0RBQXNEO2dCQUN0RCxpREFBaUQ7Z0JBQ2pELE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDZixDQUFDO1FBQ0gsQ0FBQztRQUVELHVGQUF1RjtRQUN2RixvRkFBb0Y7UUFDcEYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLGdCQUFnQixLQUFLLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUN0RSxDQUFDO0NBQ0YsQ0FBQztBQXNCRiw0QkFBNEIsT0FBaUMsRUFBRSxJQUFZLEVBQUUsS0FBYTtJQUN4Riw0QkFBNEI7SUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFD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QUFDLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxDQUFDLFlBQVksQ0FDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hDLE9BQU8sRUFDUCxPQUFPLENBQUMsSUFBSSxFQUNaLE9BQU8sQ0FBQyxFQUFFLENBQ1gsQ0FBQztnQkFDSixDQUFDO2dCQUVELE1BQU0sTUFBTSxHQUFHLElBQUksY0FBTyxDQUFDLGNBQWMsQ0FDdkMsWUFBWSxFQUNaLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQ3RCLE1BQU0sQ0FDUCxDQUFDO2dCQUNGLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV4RCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBRUYscUJBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDMUIsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUM7QUE5R0QsNEJBOEdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRhc2tJZCxcbiAgVHJlZSxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgTm9kZVBhY2thZ2VJbnN0YWxsVGFzaywgUnVuU2NoZW1hdGljVGFzayB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rhc2tzJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20gYXMgb2JzZXJ2YWJsZUZyb20sIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAsIG1lcmdlTWFwLCByZWR1Y2UsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHsgZ2V0TnBtUGFja2FnZUpzb24gfSBmcm9tICcuL25wbSc7XG5pbXBvcnQgeyBOcG1SZXBvc2l0b3J5UGFja2FnZUpzb24gfSBmcm9tICcuL25wbS1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgRGVwZW5kZW5jeSwgSnNvblNjaGVtYUZvck5wbVBhY2thZ2VKc29uRmlsZXMgfSBmcm9tICcuL3BhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBVcGRhdGVTY2hlbWEgfSBmcm9tICcuL3NjaGVtYSc7XG5cbnR5cGUgVmVyc2lvblJhbmdlID0gc3RyaW5nICYgeyBfX1ZFUlNJT05fUkFOR0U6IHZvaWQ7IH07XG50eXBlIFBlZXJWZXJzaW9uVHJhbnNmb3JtID0gc3RyaW5nIHwgKChyYW5nZTogc3RyaW5nKSA9PiBzdHJpbmcpO1xuXG4vLyBUaGlzIGlzIGEgbWFwIG9mIHBhY2thZ2VHcm91cE5hbWUgdG8gcmFuZ2UgZXh0ZW5kaW5nIGZ1bmN0aW9uLiBJZiBpdCBpc24ndCBmb3VuZCwgdGhlIHJhbmdlIGlzXG4vLyBrZXB0IHRoZSBzYW1lLlxuLy8gQW5ndWxhciBndWFyYW50ZWVzIHRoYXQgYSBtYWpvciBpcyBjb21wYXRpYmxlIHdpdGggaXRzIGZvbGxvd2luZyBtYWpvciAoc28gcGFja2FnZXMgdGhhdCBkZXBlbmRcbi8vIG9uIEFuZ3VsYXIgNSBhcmUgYWxzbyBjb21wYXRpYmxlIHdpdGggQW5ndWxhciA2KS4gVGhpcyBpcywgaW4gY29kZSwgcmVwcmVzZW50ZWQgYnkgdmVyaWZ5aW5nXG4vLyB0aGF0IGFsbCBvdGhlciBwYWNrYWdlcyB0aGF0IGhhdmUgYSBwZWVyIGRlcGVuZGVuY3kgb2YgYFwiQGFuZ3VsYXIvY29yZVwiOiBcIl41LjAuMFwiYCBhY3R1YWxseVxuLy8gc3VwcG9ydHMgNi4wLCBieSBhZGRpbmcgdGhhdCBjb21wYXRpYmlsaXR5IHRvIHRoZSByYW5nZSwgc28gaXQgaXMgYF41LjAuMCB8fCBeNi4wLjBgLlxuY29uc3QgcGVlckNvbXBhdGlibGVXaGl0ZWxpc3Q6IHsgW25hbWU6IHN0cmluZ106IFBlZXJWZXJzaW9uVHJhbnNmb3JtIH0gPSB7XG4gICdAYW5ndWxhci9jb3JlJzogKHJhbmdlOiBzdHJpbmcpID0+IHtcbiAgICByYW5nZSA9IHNlbXZlci52YWxpZFJhbmdlKHJhbmdlKTtcbiAgICBsZXQgbWFqb3IgPSAxO1xuICAgIHdoaWxlICghc2VtdmVyLmd0cihtYWpvciArICcuMC4wJywgcmFuZ2UpKSB7XG4gICAgICBtYWpvcisrO1xuICAgICAgaWYgKG1ham9yID49IDk5KSB7XG4gICAgICAgIC8vIFVzZSBvcmlnaW5hbCByYW5nZSBpZiBpdCBzdXBwb3J0cyBhIG1ham9yIHRoaXMgaGlnaFxuICAgICAgICAvLyBSYW5nZSBpcyBtb3N0IGxpa2VseSB1bmJvdW5kZWQgKGUuZy4sID49NS4wLjApXG4gICAgICAgIHJldHVybiByYW5nZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIG1ham9yIHZlcnNpb24gYXMgY29tcGF0aWJsZSB3aXRoIHRoZSBhbmd1bGFyIGNvbXBhdGlibGUuIFRoaXMgaXMgYWxyZWFkeSBvbmVcbiAgICAvLyBtYWpvciBhYm92ZSB0aGUgZ3JlYXRlc3Qgc3VwcG9ydGVkLCBiZWNhdXNlIHdlIGluY3JlbWVudCBgbWFqb3JgIGJlZm9yZSBjaGVja2luZy5cbiAgICByZXR1cm4gc2VtdmVyLnZhbGlkUmFuZ2UoYF4ke21ham9yfS4wLjAtcmMuMCB8fCAke3JhbmdlfWApIHx8IHJhbmdlO1xuICB9LFxufTtcblxuaW50ZXJmYWNlIFBhY2thZ2VWZXJzaW9uSW5mbyB7XG4gIHZlcnNpb246IFZlcnNpb25SYW5nZTtcbiAgcGFja2FnZUpzb246IEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICB1cGRhdGVNZXRhZGF0YTogVXBkYXRlTWV0YWRhdGE7XG59XG5cbmludGVyZmFjZSBQYWNrYWdlSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbjtcbiAgaW5zdGFsbGVkOiBQYWNrYWdlVmVyc2lvbkluZm87XG4gIHRhcmdldD86IFBhY2thZ2VWZXJzaW9uSW5mbztcbiAgcGFja2FnZUpzb25SYW5nZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlTWV0YWRhdGEge1xuICBwYWNrYWdlR3JvdXA6IHN0cmluZ1tdO1xuICByZXF1aXJlbWVudHM6IHsgW3BhY2thZ2VOYW1lOiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWlncmF0aW9ucz86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gX3VwZGF0ZVBlZXJWZXJzaW9uKGluZm9NYXA6IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPiwgbmFtZTogc3RyaW5nLCByYW5nZTogc3RyaW5nKSB7XG4gIC8vIFJlc29sdmUgcGFja2FnZUdyb3VwTmFtZS5cbiAgY29uc3QgbWF5YmVQYWNrYWdlSW5mbyA9IGluZm9NYXAuZ2V0KG5hbWUpO1xuICBpZiAoIW1heWJlUGFja2FnZUluZm8pIHtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH1cbiAgaWYgKG1heWJlUGFja2FnZUluZm8udGFyZ2V0KSB7XG4gICAgbmFtZSA9IG1heWJlUGFja2FnZUluZm8udGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLnBhY2thZ2VHcm91cFswXSB8fCBuYW1lO1xuICB9IGVsc2Uge1xuICAgIG5hbWUgPSBtYXliZVBhY2thZ2VJbmZvLmluc3RhbGxlZC51cGRhdGVNZXRhZGF0YS5wYWNrYWdlR3JvdXBbMF0gfHwgbmFtZTtcbiAgfVxuXG4gIGNvbnN0IG1heWJlVHJhbnNmb3JtID0gcGVlckNvbXBhdGlibGVXaGl0ZWxpc3RbbmFtZV07XG4gIGlmIChtYXliZVRyYW5zZm9ybSkge1xuICAgIGlmICh0eXBlb2YgbWF5YmVUcmFuc2Zvcm0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG1heWJlVHJhbnNmb3JtKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1heWJlVHJhbnNmb3JtO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cblxuZnVuY3Rpb24gX3ZhbGlkYXRlRm9yd2FyZFBlZXJEZXBlbmRlbmNpZXMoXG4gIG5hbWU6IHN0cmluZyxcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBwZWVyczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgW3BlZXIsIHJhbmdlXSBvZiBPYmplY3QuZW50cmllcyhwZWVycykpIHtcbiAgICBsb2dnZXIuZGVidWcoYENoZWNraW5nIGZvcndhcmQgcGVlciAke3BlZXJ9Li4uYCk7XG4gICAgY29uc3QgbWF5YmVQZWVySW5mbyA9IGluZm9NYXAuZ2V0KHBlZXIpO1xuICAgIGlmICghbWF5YmVQZWVySW5mbykge1xuICAgICAgbG9nZ2VyLmVycm9yKFtcbiAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gaGFzIGEgbWlzc2luZyBwZWVyIGRlcGVuZGVuY3kgb2ZgLFxuICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShwZWVyKX0gQCAke0pTT04uc3RyaW5naWZ5KHJhbmdlKX0uYCxcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlclZlcnNpb24gPSBtYXliZVBlZXJJbmZvLnRhcmdldCAmJiBtYXliZVBlZXJJbmZvLnRhcmdldC5wYWNrYWdlSnNvbi52ZXJzaW9uXG4gICAgICA/IG1heWJlUGVlckluZm8udGFyZ2V0LnBhY2thZ2VKc29uLnZlcnNpb25cbiAgICAgIDogbWF5YmVQZWVySW5mby5pbnN0YWxsZWQudmVyc2lvbjtcblxuICAgIGxvZ2dlci5kZWJ1ZyhgICBSYW5nZSBpbnRlcnNlY3RzKCR7cmFuZ2V9LCAke3BlZXJWZXJzaW9ufSkuLi5gKTtcbiAgICBpZiAoIXNlbXZlci5zYXRpc2ZpZXMocGVlclZlcnNpb24sIHJhbmdlKSkge1xuICAgICAgbG9nZ2VyLmVycm9yKFtcbiAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gaGFzIGFuIGluY29tcGF0aWJsZSBwZWVyIGRlcGVuZGVuY3kgdG9gLFxuICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShwZWVyKX0gKHJlcXVpcmVzICR7SlNPTi5zdHJpbmdpZnkocmFuZ2UpfSxgLFxuICAgICAgICBgd291bGQgaW5zdGFsbCAke0pTT04uc3RyaW5naWZ5KHBlZXJWZXJzaW9uKX0pYCxcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmZ1bmN0aW9uIF92YWxpZGF0ZVJldmVyc2VQZWVyRGVwZW5kZW5jaWVzKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZlcnNpb246IHN0cmluZyxcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKSB7XG4gIGZvciAoY29uc3QgW2luc3RhbGxlZCwgaW5zdGFsbGVkSW5mb10gb2YgaW5mb01hcC5lbnRyaWVzKCkpIHtcbiAgICBjb25zdCBpbnN0YWxsZWRMb2dnZXIgPSBsb2dnZXIuY3JlYXRlQ2hpbGQoaW5zdGFsbGVkKTtcbiAgICBpbnN0YWxsZWRMb2dnZXIuZGVidWcoYCR7aW5zdGFsbGVkfS4uLmApO1xuICAgIGNvbnN0IHBlZXJzID0gKGluc3RhbGxlZEluZm8udGFyZ2V0IHx8IGluc3RhbGxlZEluZm8uaW5zdGFsbGVkKS5wYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzO1xuXG4gICAgZm9yIChsZXQgW3BlZXIsIHJhbmdlXSBvZiBPYmplY3QuZW50cmllcyhwZWVycyB8fCB7fSkpIHtcbiAgICAgIGlmIChwZWVyICE9IG5hbWUpIHtcbiAgICAgICAgLy8gT25seSBjaGVjayBwZWVycyB0byB0aGUgcGFja2FnZXMgd2UncmUgdXBkYXRpbmcuIFdlIGRvbid0IGNhcmUgYWJvdXQgcGVlcnNcbiAgICAgICAgLy8gdGhhdCBhcmUgdW5tZXQgYnV0IHdlIGhhdmUgbm8gZWZmZWN0IG9uLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIHBlZXIgdmVyc2lvbiByYW5nZSBpZiBpdCdzIHdoaXRlbGlzdGVkLlxuICAgICAgcmFuZ2UgPSBfdXBkYXRlUGVlclZlcnNpb24oaW5mb01hcCwgcGVlciwgcmFuZ2UpO1xuXG4gICAgICBpZiAoIXNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UpKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihbXG4gICAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShpbnN0YWxsZWQpfSBoYXMgYW4gaW5jb21wYXRpYmxlIHBlZXIgZGVwZW5kZW5jeSB0b2AsXG4gICAgICAgICAgYCR7SlNPTi5zdHJpbmdpZnkobmFtZSl9IChyZXF1aXJlcyAke0pTT04uc3RyaW5naWZ5KHJhbmdlKX0sYCxcbiAgICAgICAgICBgd291bGQgaW5zdGFsbCAke0pTT04uc3RyaW5naWZ5KHZlcnNpb24pfSkuYCxcbiAgICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3ZhbGlkYXRlVXBkYXRlUGFja2FnZXMoXG4gIGluZm9NYXA6IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPixcbiAgZm9yY2U6IGJvb2xlYW4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiB2b2lkIHtcbiAgbG9nZ2VyLmRlYnVnKCdVcGRhdGluZyB0aGUgZm9sbG93aW5nIHBhY2thZ2VzOicpO1xuICBpbmZvTWFwLmZvckVhY2goaW5mbyA9PiB7XG4gICAgaWYgKGluZm8udGFyZ2V0KSB7XG4gICAgICBsb2dnZXIuZGVidWcoYCAgJHtpbmZvLm5hbWV9ID0+ICR7aW5mby50YXJnZXQudmVyc2lvbn1gKTtcbiAgICB9XG4gIH0pO1xuXG4gIGxldCBwZWVyRXJyb3JzID0gZmFsc2U7XG4gIGluZm9NYXAuZm9yRWFjaChpbmZvID0+IHtcbiAgICBjb25zdCB7bmFtZSwgdGFyZ2V0fSA9IGluZm87XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwa2dMb2dnZXIgPSBsb2dnZXIuY3JlYXRlQ2hpbGQobmFtZSk7XG4gICAgbG9nZ2VyLmRlYnVnKGAke25hbWV9Li4uYCk7XG5cbiAgICBjb25zdCBwZWVycyA9IHRhcmdldC5wYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzIHx8IHt9O1xuICAgIHBlZXJFcnJvcnMgPSBfdmFsaWRhdGVGb3J3YXJkUGVlckRlcGVuZGVuY2llcyhuYW1lLCBpbmZvTWFwLCBwZWVycywgcGtnTG9nZ2VyKSB8fCBwZWVyRXJyb3JzO1xuICAgIHBlZXJFcnJvcnNcbiAgICAgID0gX3ZhbGlkYXRlUmV2ZXJzZVBlZXJEZXBlbmRlbmNpZXMobmFtZSwgdGFyZ2V0LnZlcnNpb24sIGluZm9NYXAsIHBrZ0xvZ2dlcilcbiAgICAgIHx8IHBlZXJFcnJvcnM7XG4gIH0pO1xuXG4gIGlmICghZm9yY2UgJiYgcGVlckVycm9ycykge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBJbmNvbXBhdGlibGUgcGVlciBkZXBlbmRlbmNpZXMgZm91bmQuIFNlZSBhYm92ZS5gKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9wZXJmb3JtVXBkYXRlKFxuICB0cmVlOiBUcmVlLFxuICBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0LFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIG1pZ3JhdGVPbmx5OiBib29sZWFuLFxuKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gIGNvbnN0IHBhY2thZ2VKc29uQ29udGVudCA9IHRyZWUucmVhZCgnL3BhY2thZ2UuanNvbicpO1xuICBpZiAoIXBhY2thZ2VKc29uQ29udGVudCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgZmluZCBhIHBhY2thZ2UuanNvbi4gQXJlIHlvdSBpbiBhIE5vZGUgcHJvamVjdD8nKTtcbiAgfVxuXG4gIGxldCBwYWNrYWdlSnNvbjogSnNvblNjaGVtYUZvck5wbVBhY2thZ2VKc29uRmlsZXM7XG4gIHRyeSB7XG4gICAgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHBhY2thZ2VKc29uQ29udGVudC50b1N0cmluZygpKSBhcyBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdwYWNrYWdlLmpzb24gY291bGQgbm90IGJlIHBhcnNlZDogJyArIGUubWVzc2FnZSk7XG4gIH1cblxuICBjb25zdCB1cGRhdGVEZXBlbmRlbmN5ID0gKGRlcHM6IERlcGVuZGVuY3ksIG5hbWU6IHN0cmluZywgbmV3VmVyc2lvbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgb2xkVmVyc2lvbiA9IGRlcHNbbmFtZV07XG4gICAgLy8gV2Ugb25seSByZXNwZWN0IGNhcmV0IGFuZCB0aWxkZSByYW5nZXMgb24gdXBkYXRlLlxuICAgIGNvbnN0IGV4ZWNSZXN1bHQgPSAvXltcXF5+XS8uZXhlYyhvbGRWZXJzaW9uKTtcbiAgICBkZXBzW25hbWVdID0gYCR7ZXhlY1Jlc3VsdCA/IGV4ZWNSZXN1bHRbMF0gOiAnJ30ke25ld1ZlcnNpb259YDtcbiAgfTtcblxuICBjb25zdCB0b0luc3RhbGwgPSBbLi4uaW5mb01hcC52YWx1ZXMoKV1cbiAgICAgIC5tYXAoeCA9PiBbeC5uYW1lLCB4LnRhcmdldCwgeC5pbnN0YWxsZWRdKVxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vbi1udWxsLW9wZXJhdG9yXG4gICAgICAuZmlsdGVyKChbbmFtZSwgdGFyZ2V0LCBpbnN0YWxsZWRdKSA9PiB7XG4gICAgICAgIHJldHVybiAhIW5hbWUgJiYgISF0YXJnZXQgJiYgISFpbnN0YWxsZWQ7XG4gICAgICB9KSBhcyBbc3RyaW5nLCBQYWNrYWdlVmVyc2lvbkluZm8sIFBhY2thZ2VWZXJzaW9uSW5mb11bXTtcblxuICB0b0luc3RhbGwuZm9yRWFjaCgoW25hbWUsIHRhcmdldCwgaW5zdGFsbGVkXSkgPT4ge1xuICAgIGxvZ2dlci5pbmZvKFxuICAgICAgYFVwZGF0aW5nIHBhY2thZ2UuanNvbiB3aXRoIGRlcGVuZGVuY3kgJHtuYW1lfSBgXG4gICAgICArIGBAICR7SlNPTi5zdHJpbmdpZnkodGFyZ2V0LnZlcnNpb24pfSAod2FzICR7SlNPTi5zdHJpbmdpZnkoaW5zdGFsbGVkLnZlcnNpb24pfSkuLi5gLFxuICAgICk7XG5cbiAgICBpZiAocGFja2FnZUpzb24uZGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLmRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgdXBkYXRlRGVwZW5kZW5jeShwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMsIG5hbWUsIHRhcmdldC52ZXJzaW9uKTtcblxuICAgICAgaWYgKHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgICAgZGVsZXRlIHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llc1tuYW1lXTtcbiAgICAgIH1cbiAgICAgIGlmIChwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgICAgZGVsZXRlIHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXNbbmFtZV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICB1cGRhdGVEZXBlbmRlbmN5KHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llcywgbmFtZSwgdGFyZ2V0LnZlcnNpb24pO1xuXG4gICAgICBpZiAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICB1cGRhdGVEZXBlbmRlbmN5KHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMsIG5hbWUsIHRhcmdldC52ZXJzaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLndhcm4oYFBhY2thZ2UgJHtuYW1lfSB3YXMgbm90IGZvdW5kIGluIGRlcGVuZGVuY2llcy5gKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IG5ld0NvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMik7XG4gIGlmIChwYWNrYWdlSnNvbkNvbnRlbnQudG9TdHJpbmcoKSAhPSBuZXdDb250ZW50IHx8IG1pZ3JhdGVPbmx5KSB7XG4gICAgbGV0IGluc3RhbGxUYXNrOiBUYXNrSWRbXSA9IFtdO1xuICAgIGlmICghbWlncmF0ZU9ubHkpIHtcbiAgICAgIC8vIElmIHNvbWV0aGluZyBjaGFuZ2VkLCBhbHNvIGhvb2sgdXAgdGhlIHRhc2suXG4gICAgICB0cmVlLm92ZXJ3cml0ZSgnL3BhY2thZ2UuanNvbicsIEpTT04uc3RyaW5naWZ5KHBhY2thZ2VKc29uLCBudWxsLCAyKSk7XG4gICAgICBpbnN0YWxsVGFzayA9IFtjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSldO1xuICAgIH1cblxuICAgIC8vIFJ1biB0aGUgbWlncmF0ZSBzY2hlbWF0aWNzIHdpdGggdGhlIGxpc3Qgb2YgcGFja2FnZXMgdG8gdXNlLiBUaGUgY29sbGVjdGlvbiBjb250YWluc1xuICAgIC8vIHZlcnNpb24gaW5mb3JtYXRpb24gYW5kIHdlIG5lZWQgdG8gZG8gdGhpcyBwb3N0IGluc3RhbGxhdGlvbi4gUGxlYXNlIG5vdGUgdGhhdCB0aGVcbiAgICAvLyBtaWdyYXRpb24gQ09VTEQgZmFpbCBhbmQgbGVhdmUgc2lkZSBlZmZlY3RzIG9uIGRpc2suXG4gICAgLy8gUnVuIHRoZSBzY2hlbWF0aWNzIHRhc2sgb2YgdGhvc2UgcGFja2FnZXMuXG4gICAgdG9JbnN0YWxsLmZvckVhY2goKFtuYW1lLCB0YXJnZXQsIGluc3RhbGxlZF0pID0+IHtcbiAgICAgIGlmICghdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gKFxuICAgICAgICB0YXJnZXQudXBkYXRlTWV0YWRhdGEubWlncmF0aW9ucy5tYXRjaCgvXlsuL10vKVxuICAgICAgICA/IG5hbWUgKyAnLydcbiAgICAgICAgOiAnJ1xuICAgICAgKSArIHRhcmdldC51cGRhdGVNZXRhZGF0YS5taWdyYXRpb25zO1xuXG4gICAgICBjb250ZXh0LmFkZFRhc2sobmV3IFJ1blNjaGVtYXRpY1Rhc2soJ0BzY2hlbWF0aWNzL3VwZGF0ZScsICdtaWdyYXRlJywge1xuICAgICAgICAgIHBhY2thZ2U6IG5hbWUsXG4gICAgICAgICAgY29sbGVjdGlvbixcbiAgICAgICAgICBmcm9tOiBpbnN0YWxsZWQudmVyc2lvbixcbiAgICAgICAgICB0bzogdGFyZ2V0LnZlcnNpb24sXG4gICAgICAgIH0pLFxuICAgICAgICBpbnN0YWxsVGFzayxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gX21pZ3JhdGVPbmx5KFxuICBpbmZvOiBQYWNrYWdlSW5mbyB8IHVuZGVmaW5lZCxcbiAgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCxcbiAgZnJvbTogc3RyaW5nLFxuICB0bz86IHN0cmluZyxcbikge1xuICBpZiAoIWluZm8pIHtcbiAgICByZXR1cm4gb2Y8dm9pZD4oKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGluZm8uaW5zdGFsbGVkO1xuICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMpIHtcbiAgICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbiAgfVxuXG4gIGNvbnN0IGNvbGxlY3Rpb24gPSAoXG4gICAgdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMubWF0Y2goL15bLi9dLylcbiAgICAgID8gaW5mby5uYW1lICsgJy8nXG4gICAgICA6ICcnXG4gICkgKyB0YXJnZXQudXBkYXRlTWV0YWRhdGEubWlncmF0aW9ucztcblxuICBjb250ZXh0LmFkZFRhc2sobmV3IFJ1blNjaGVtYXRpY1Rhc2soJ0BzY2hlbWF0aWNzL3VwZGF0ZScsICdtaWdyYXRlJywge1xuICAgICAgcGFja2FnZTogaW5mby5uYW1lLFxuICAgICAgY29sbGVjdGlvbixcbiAgICAgIGZyb206IGZyb20sXG4gICAgICB0bzogdG8gfHwgdGFyZ2V0LnZlcnNpb24sXG4gICAgfSksXG4gICk7XG5cbiAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRVcGRhdGVNZXRhZGF0YShcbiAgcGFja2FnZUpzb246IEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogVXBkYXRlTWV0YWRhdGEge1xuICBjb25zdCBtZXRhZGF0YSA9IHBhY2thZ2VKc29uWyduZy11cGRhdGUnXTtcblxuICBjb25zdCByZXN1bHQ6IFVwZGF0ZU1ldGFkYXRhID0ge1xuICAgIHBhY2thZ2VHcm91cDogW10sXG4gICAgcmVxdWlyZW1lbnRzOiB7fSxcbiAgfTtcblxuICBpZiAoIW1ldGFkYXRhIHx8IHR5cGVvZiBtZXRhZGF0YSAhPSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG1ldGFkYXRhKSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAobWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddKSB7XG4gICAgY29uc3QgcGFja2FnZUdyb3VwID0gbWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddO1xuICAgIC8vIFZlcmlmeSB0aGF0IHBhY2thZ2VHcm91cCBpcyBhbiBhcnJheSBvZiBzdHJpbmdzLiBUaGlzIGlzIG5vdCBhbiBlcnJvciBidXQgd2Ugc3RpbGwgd2FyblxuICAgIC8vIHRoZSB1c2VyIGFuZCBpZ25vcmUgdGhlIHBhY2thZ2VHcm91cCBrZXlzLlxuICAgIGlmICghQXJyYXkuaXNBcnJheShwYWNrYWdlR3JvdXApIHx8IHBhY2thZ2VHcm91cC5zb21lKHggPT4gdHlwZW9mIHggIT0gJ3N0cmluZycpKSB7XG4gICAgICBsb2dnZXIud2FybihcbiAgICAgICAgYHBhY2thZ2VHcm91cCBtZXRhZGF0YSBvZiBwYWNrYWdlICR7cGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLiBJZ25vcmluZy5gLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhY2thZ2VHcm91cCA9IHBhY2thZ2VHcm91cDtcbiAgICB9XG4gIH1cblxuICBpZiAobWV0YWRhdGFbJ3JlcXVpcmVtZW50cyddKSB7XG4gICAgY29uc3QgcmVxdWlyZW1lbnRzID0gbWV0YWRhdGFbJ3JlcXVpcmVtZW50cyddO1xuICAgIC8vIFZlcmlmeSB0aGF0IHJlcXVpcmVtZW50cyBhcmVcbiAgICBpZiAodHlwZW9mIHJlcXVpcmVtZW50cyAhPSAnb2JqZWN0J1xuICAgICAgICB8fCBBcnJheS5pc0FycmF5KHJlcXVpcmVtZW50cylcbiAgICAgICAgfHwgT2JqZWN0LmtleXMocmVxdWlyZW1lbnRzKS5zb21lKG5hbWUgPT4gdHlwZW9mIHJlcXVpcmVtZW50c1tuYW1lXSAhPSAnc3RyaW5nJykpIHtcbiAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICBgcmVxdWlyZW1lbnRzIG1ldGFkYXRhIG9mIHBhY2thZ2UgJHtwYWNrYWdlSnNvbi5uYW1lfSBpcyBtYWxmb3JtZWQuIElnbm9yaW5nLmAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucmVxdWlyZW1lbnRzID0gcmVxdWlyZW1lbnRzO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtZXRhZGF0YVsnbWlncmF0aW9ucyddKSB7XG4gICAgY29uc3QgbWlncmF0aW9ucyA9IG1ldGFkYXRhWydtaWdyYXRpb25zJ107XG4gICAgaWYgKHR5cGVvZiBtaWdyYXRpb25zICE9ICdzdHJpbmcnKSB7XG4gICAgICBsb2dnZXIud2FybihgbWlncmF0aW9ucyBtZXRhZGF0YSBvZiBwYWNrYWdlICR7cGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLiBJZ25vcmluZy5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0Lm1pZ3JhdGlvbnMgPSBtaWdyYXRpb25zO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxuZnVuY3Rpb24gX3VzYWdlTWVzc2FnZShcbiAgb3B0aW9uczogVXBkYXRlU2NoZW1hLFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pIHtcbiAgY29uc3QgcGFja2FnZUdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHBhY2thZ2VzVG9VcGRhdGUgPSBbLi4uaW5mb01hcC5lbnRyaWVzKCldXG4gICAgLm1hcCgoW25hbWUsIGluZm9dKSA9PiB7XG4gICAgICBjb25zdCB0YWcgPSBvcHRpb25zLm5leHRcbiAgICAgICAgPyAoaW5mby5ucG1QYWNrYWdlSnNvblsnZGlzdC10YWdzJ11bJ25leHQnXSA/ICduZXh0JyA6ICdsYXRlc3QnKSA6ICdsYXRlc3QnO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IGluZm8ubnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhZ107XG4gICAgICBjb25zdCB0YXJnZXQgPSBpbmZvLm5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3ZlcnNpb25dO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBpbmZvLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgICB0YWcsXG4gICAgICAgIHRhcmdldCxcbiAgICAgIH07XG4gICAgfSlcbiAgICAuZmlsdGVyKCh7IG5hbWUsIGluZm8sIHZlcnNpb24sIHRhcmdldCB9KSA9PiB7XG4gICAgICByZXR1cm4gKHRhcmdldCAmJiBzZW12ZXIuY29tcGFyZShpbmZvLmluc3RhbGxlZC52ZXJzaW9uLCB2ZXJzaW9uKSA8IDApO1xuICAgIH0pXG4gICAgLmZpbHRlcigoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgcmV0dXJuIHRhcmdldFsnbmctdXBkYXRlJ107XG4gICAgfSlcbiAgICAubWFwKCh7IG5hbWUsIGluZm8sIHZlcnNpb24sIHRhZywgdGFyZ2V0IH0pID0+IHtcbiAgICAgIC8vIExvb2sgZm9yIHBhY2thZ2VHcm91cC5cbiAgICAgIGlmICh0YXJnZXRbJ25nLXVwZGF0ZSddICYmIHRhcmdldFsnbmctdXBkYXRlJ11bJ3BhY2thZ2VHcm91cCddKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VHcm91cCA9IHRhcmdldFsnbmctdXBkYXRlJ11bJ3BhY2thZ2VHcm91cCddO1xuICAgICAgICBjb25zdCBwYWNrYWdlR3JvdXBOYW1lID0gdGFyZ2V0WyduZy11cGRhdGUnXVsncGFja2FnZUdyb3VwTmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB0YXJnZXRbJ25nLXVwZGF0ZSddWydwYWNrYWdlR3JvdXAnXVswXTtcbiAgICAgICAgaWYgKHBhY2thZ2VHcm91cE5hbWUpIHtcbiAgICAgICAgICBpZiAocGFja2FnZUdyb3Vwcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhY2thZ2VHcm91cC5mb3JFYWNoKCh4OiBzdHJpbmcpID0+IHBhY2thZ2VHcm91cHMuc2V0KHgsIHBhY2thZ2VHcm91cE5hbWUpKTtcbiAgICAgICAgICBwYWNrYWdlR3JvdXBzLnNldChwYWNrYWdlR3JvdXBOYW1lLCBwYWNrYWdlR3JvdXBOYW1lKTtcbiAgICAgICAgICBuYW1lID0gcGFja2FnZUdyb3VwTmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgY29tbWFuZCA9IGBuZyB1cGRhdGUgJHtuYW1lfWA7XG4gICAgICBpZiAodGFnID09ICduZXh0Jykge1xuICAgICAgICBjb21tYW5kICs9ICcgLS1uZXh0JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtuYW1lLCBgJHtpbmZvLmluc3RhbGxlZC52ZXJzaW9ufSAtPiAke3ZlcnNpb259YCwgY29tbWFuZF07XG4gICAgfSlcbiAgICAuZmlsdGVyKHggPT4geCAhPT0gbnVsbClcbiAgICAuc29ydCgoYSwgYikgPT4gYSAmJiBiID8gYVswXS5sb2NhbGVDb21wYXJlKGJbMF0pIDogMCk7XG5cbiAgaWYgKHBhY2thZ2VzVG9VcGRhdGUubGVuZ3RoID09IDApIHtcbiAgICBsb2dnZXIuaW5mbygnV2UgYW5hbHl6ZWQgeW91ciBwYWNrYWdlLmpzb24gYW5kIGV2ZXJ5dGhpbmcgc2VlbXMgdG8gYmUgaW4gb3JkZXIuIEdvb2Qgd29yayEnKTtcblxuICAgIHJldHVybiBvZjx2b2lkPih1bmRlZmluZWQpO1xuICB9XG5cbiAgbG9nZ2VyLmluZm8oXG4gICAgJ1dlIGFuYWx5emVkIHlvdXIgcGFja2FnZS5qc29uLCB0aGVyZSBhcmUgc29tZSBwYWNrYWdlcyB0byB1cGRhdGU6XFxuJyxcbiAgKTtcblxuICAvLyBGaW5kIHRoZSBsYXJnZXN0IG5hbWUgdG8ga25vdyB0aGUgcGFkZGluZyBuZWVkZWQuXG4gIGxldCBuYW1lUGFkID0gTWF0aC5tYXgoLi4uWy4uLmluZm9NYXAua2V5cygpXS5tYXAoeCA9PiB4Lmxlbmd0aCkpICsgMjtcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobmFtZVBhZCkpIHtcbiAgICBuYW1lUGFkID0gMzA7XG4gIH1cbiAgY29uc3QgcGFkcyA9IFtuYW1lUGFkLCAyNSwgMF07XG5cbiAgbG9nZ2VyLmluZm8oXG4gICAgJyAgJ1xuICAgICsgWydOYW1lJywgJ1ZlcnNpb24nLCAnQ29tbWFuZCB0byB1cGRhdGUnXS5tYXAoKHgsIGkpID0+IHgucGFkRW5kKHBhZHNbaV0pKS5qb2luKCcnKSxcbiAgKTtcbiAgbG9nZ2VyLmluZm8oJyAnICsgJy0nLnJlcGVhdChwYWRzLnJlZHVjZSgocywgeCkgPT4gcyArPSB4LCAwKSArIDIwKSk7XG5cbiAgcGFja2FnZXNUb1VwZGF0ZS5mb3JFYWNoKGZpZWxkcyA9PiB7XG4gICAgaWYgKCFmaWVsZHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbygnICAnICsgZmllbGRzLm1hcCgoeCwgaSkgPT4geC5wYWRFbmQocGFkc1tpXSkpLmpvaW4oJycpKTtcbiAgfSk7XG5cbiAgbG9nZ2VyLmluZm8oJ1xcbicpO1xuICBsb2dnZXIuaW5mbygnVGhlcmUgbWlnaHQgYmUgYWRkaXRpb25hbCBwYWNrYWdlcyB0aGF0IGFyZSBvdXRkYXRlZC4nKTtcbiAgbG9nZ2VyLmluZm8oJ09yIHJ1biBuZyB1cGRhdGUgLS1hbGwgdG8gdHJ5IHRvIHVwZGF0ZSBhbGwgYXQgdGhlIHNhbWUgdGltZS5cXG4nKTtcblxuICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbn1cblxuXG5mdW5jdGlvbiBfYnVpbGRQYWNrYWdlSW5mbyhcbiAgdHJlZTogVHJlZSxcbiAgcGFja2FnZXM6IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4sXG4gIGFsbERlcGVuZGVuY2llczogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IFBhY2thZ2VJbmZvIHtcbiAgY29uc3QgbmFtZSA9IG5wbVBhY2thZ2VKc29uLm5hbWU7XG4gIGNvbnN0IHBhY2thZ2VKc29uUmFuZ2UgPSBhbGxEZXBlbmRlbmNpZXMuZ2V0KG5hbWUpO1xuICBpZiAoIXBhY2thZ2VKc29uUmFuZ2UpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgIGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobmFtZSl9IHdhcyBub3QgZm91bmQgaW4gcGFja2FnZS5qc29uLmAsXG4gICAgKTtcbiAgfVxuXG4gIC8vIEZpbmQgb3V0IHRoZSBjdXJyZW50bHkgaW5zdGFsbGVkIHZlcnNpb24uIEVpdGhlciBmcm9tIHRoZSBwYWNrYWdlLmpzb24gb3IgdGhlIG5vZGVfbW9kdWxlcy9cbiAgLy8gVE9ETzogZmlndXJlIG91dCBhIHdheSB0byByZWFkIHBhY2thZ2UtbG9jay5qc29uIGFuZC9vciB5YXJuLmxvY2suXG4gIGxldCBpbnN0YWxsZWRWZXJzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHBhY2thZ2VDb250ZW50ID0gdHJlZS5yZWFkKGAvbm9kZV9tb2R1bGVzLyR7bmFtZX0vcGFja2FnZS5qc29uYCk7XG4gIGlmIChwYWNrYWdlQ29udGVudCkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnBhcnNlKHBhY2thZ2VDb250ZW50LnRvU3RyaW5nKCkpIGFzIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICAgIGluc3RhbGxlZFZlcnNpb24gPSBjb250ZW50LnZlcnNpb247XG4gIH1cbiAgaWYgKCFpbnN0YWxsZWRWZXJzaW9uKSB7XG4gICAgLy8gRmluZCB0aGUgdmVyc2lvbiBmcm9tIE5QTSB0aGF0IGZpdHMgdGhlIHJhbmdlIHRvIG1heC5cbiAgICBpbnN0YWxsZWRWZXJzaW9uID0gc2VtdmVyLm1heFNhdGlzZnlpbmcoXG4gICAgICBPYmplY3Qua2V5cyhucG1QYWNrYWdlSnNvbi52ZXJzaW9ucyksXG4gICAgICBwYWNrYWdlSnNvblJhbmdlLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBpbnN0YWxsZWRQYWNrYWdlSnNvbiA9IG5wbVBhY2thZ2VKc29uLnZlcnNpb25zW2luc3RhbGxlZFZlcnNpb25dIHx8IHBhY2thZ2VDb250ZW50O1xuICBpZiAoIWluc3RhbGxlZFBhY2thZ2VKc29uKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICBgQW4gdW5leHBlY3RlZCBlcnJvciBoYXBwZW5lZDsgcGFja2FnZSAke25hbWV9IGhhcyBubyB2ZXJzaW9uICR7aW5zdGFsbGVkVmVyc2lvbn0uYCxcbiAgICApO1xuICB9XG5cbiAgbGV0IHRhcmdldFZlcnNpb246IFZlcnNpb25SYW5nZSB8IHVuZGVmaW5lZCA9IHBhY2thZ2VzLmdldChuYW1lKTtcbiAgaWYgKHRhcmdldFZlcnNpb24pIHtcbiAgICBpZiAobnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhcmdldFZlcnNpb25dKSB7XG4gICAgICB0YXJnZXRWZXJzaW9uID0gbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhcmdldFZlcnNpb25dIGFzIFZlcnNpb25SYW5nZTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldFZlcnNpb24gPT0gJ25leHQnKSB7XG4gICAgICB0YXJnZXRWZXJzaW9uID0gbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddWydsYXRlc3QnXSBhcyBWZXJzaW9uUmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFZlcnNpb24gPSBzZW12ZXIubWF4U2F0aXNmeWluZyhcbiAgICAgICAgT2JqZWN0LmtleXMobnBtUGFja2FnZUpzb24udmVyc2lvbnMpLFxuICAgICAgICB0YXJnZXRWZXJzaW9uLFxuICAgICAgKSBhcyBWZXJzaW9uUmFuZ2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhcmdldFZlcnNpb24gJiYgc2VtdmVyLmx0ZSh0YXJnZXRWZXJzaW9uLCBpbnN0YWxsZWRWZXJzaW9uKSkge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUGFja2FnZSAke25hbWV9IGFscmVhZHkgc2F0aXNmaWVkIGJ5IHBhY2thZ2UuanNvbiAoJHtwYWNrYWdlSnNvblJhbmdlfSkuYCk7XG4gICAgdGFyZ2V0VmVyc2lvbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldDogUGFja2FnZVZlcnNpb25JbmZvIHwgdW5kZWZpbmVkID0gdGFyZ2V0VmVyc2lvblxuICAgID8ge1xuICAgICAgdmVyc2lvbjogdGFyZ2V0VmVyc2lvbixcbiAgICAgIHBhY2thZ2VKc29uOiBucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t0YXJnZXRWZXJzaW9uXSxcbiAgICAgIHVwZGF0ZU1ldGFkYXRhOiBfZ2V0VXBkYXRlTWV0YWRhdGEobnBtUGFja2FnZUpzb24udmVyc2lvbnNbdGFyZ2V0VmVyc2lvbl0sIGxvZ2dlciksXG4gICAgfVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIC8vIENoZWNrIGlmIHRoZXJlJ3MgYW4gaW5zdGFsbGVkIHZlcnNpb24uXG4gIHJldHVybiB7XG4gICAgbmFtZSxcbiAgICBucG1QYWNrYWdlSnNvbixcbiAgICBpbnN0YWxsZWQ6IHtcbiAgICAgIHZlcnNpb246IGluc3RhbGxlZFZlcnNpb24gYXMgVmVyc2lvblJhbmdlLFxuICAgICAgcGFja2FnZUpzb246IGluc3RhbGxlZFBhY2thZ2VKc29uLFxuICAgICAgdXBkYXRlTWV0YWRhdGE6IF9nZXRVcGRhdGVNZXRhZGF0YShpbnN0YWxsZWRQYWNrYWdlSnNvbiwgbG9nZ2VyKSxcbiAgICB9LFxuICAgIHRhcmdldCxcbiAgICBwYWNrYWdlSnNvblJhbmdlLFxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIF9idWlsZFBhY2thZ2VMaXN0KFxuICBvcHRpb25zOiBVcGRhdGVTY2hlbWEsXG4gIHByb2plY3REZXBzOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPiB7XG4gIC8vIFBhcnNlIHRoZSBwYWNrYWdlcyBvcHRpb25zIHRvIHNldCB0aGUgdGFyZ2V0ZWQgdmVyc2lvbi5cbiAgY29uc3QgcGFja2FnZXMgPSBuZXcgTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPigpO1xuICBjb25zdCBjb21tYW5kTGluZVBhY2thZ2VzID1cbiAgICAob3B0aW9ucy5wYWNrYWdlcyAmJiBvcHRpb25zLnBhY2thZ2VzLmxlbmd0aCA+IDApXG4gICAgPyBvcHRpb25zLnBhY2thZ2VzXG4gICAgOiAob3B0aW9ucy5hbGwgPyBwcm9qZWN0RGVwcy5rZXlzKCkgOiBbXSk7XG5cbiAgZm9yIChjb25zdCBwa2cgb2YgY29tbWFuZExpbmVQYWNrYWdlcykge1xuICAgIC8vIFNwbGl0IHRoZSB2ZXJzaW9uIGFza2VkIG9uIGNvbW1hbmQgbGluZS5cbiAgICBjb25zdCBtID0gcGtnLm1hdGNoKC9eKCg/OkBbXi9dezEsMTAwfVxcLyk/W15AXXsxLDEwMH0pKD86QCguezEsMTAwfSkpPyQvKTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIGxvZ2dlci53YXJuKGBJbnZhbGlkIHBhY2thZ2UgYXJndW1lbnQ6ICR7SlNPTi5zdHJpbmdpZnkocGtnKX0uIFNraXBwaW5nLmApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgWywgbnBtTmFtZSwgbWF5YmVWZXJzaW9uXSA9IG07XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gcHJvamVjdERlcHMuZ2V0KG5wbU5hbWUpO1xuICAgIGlmICghdmVyc2lvbikge1xuICAgICAgbG9nZ2VyLndhcm4oYFBhY2thZ2Ugbm90IGluc3RhbGxlZDogJHtKU09OLnN0cmluZ2lmeShucG1OYW1lKX0uIFNraXBwaW5nLmApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHRoYXQgcGVvcGxlIGhhdmUgYW4gYWN0dWFsIHZlcnNpb24gaW4gdGhlIHBhY2thZ2UuanNvbiwgb3RoZXJ3aXNlIChsYWJlbCBvciBVUkwgb3JcbiAgICAvLyBnaXN0IG9yIC4uLikgd2UgZG9uJ3QgdXBkYXRlIGl0LlxuICAgIGlmIChcbiAgICAgIHZlcnNpb24uc3RhcnRzV2l0aCgnaHR0cDonKSAgLy8gSFRUUFxuICAgICAgfHwgdmVyc2lvbi5zdGFydHNXaXRoKCdmaWxlOicpICAvLyBMb2NhbCBmb2xkZXJcbiAgICAgIHx8IHZlcnNpb24uc3RhcnRzV2l0aCgnZ2l0OicpICAvLyBHSVQgdXJsXG4gICAgICB8fCB2ZXJzaW9uLm1hdGNoKC9eXFx3ezEsMTAwfVxcL1xcd3sxLDEwMH0vKSAgLy8gR2l0SHViJ3MgXCJ1c2VyL3JlcG9cIlxuICAgICAgfHwgdmVyc2lvbi5tYXRjaCgvXig/OlxcLnswLDJ9XFwvKVxcd3sxLDEwMH0vKSAgLy8gTG9jYWwgZm9sZGVyLCBtYXliZSByZWxhdGl2ZS5cbiAgICApIHtcbiAgICAgIC8vIFdlIG9ubHkgZG8gdGhhdCBmb3IgLS1hbGwuIE90aGVyd2lzZSB3ZSBoYXZlIHRoZSBpbnN0YWxsZWQgdmVyc2lvbiBhbmQgdGhlIHVzZXIgc3BlY2lmaWVkXG4gICAgICAvLyBpdCBvbiB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAgaWYgKG9wdGlvbnMuYWxsKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICAgIGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobnBtTmFtZSl9IGhhcyBhIGN1c3RvbSB2ZXJzaW9uOiBgXG4gICAgICAgICAgKyBgJHtKU09OLnN0cmluZ2lmeSh2ZXJzaW9uKX0uIFNraXBwaW5nLmAsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhY2thZ2VzLnNldChucG1OYW1lLCAobWF5YmVWZXJzaW9uIHx8IChvcHRpb25zLm5leHQgPyAnbmV4dCcgOiAnbGF0ZXN0JykpIGFzIFZlcnNpb25SYW5nZSk7XG4gIH1cblxuICByZXR1cm4gcGFja2FnZXM7XG59XG5cblxuZnVuY3Rpb24gX2FkZFBhY2thZ2VHcm91cChcbiAgcGFja2FnZXM6IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4sXG4gIGFsbERlcGVuZGVuY2llczogUmVhZG9ubHlNYXA8c3RyaW5nLCBzdHJpbmc+LFxuICBucG1QYWNrYWdlSnNvbjogTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogdm9pZCB7XG4gIGNvbnN0IG1heWJlUGFja2FnZSA9IHBhY2thZ2VzLmdldChucG1QYWNrYWdlSnNvbi5uYW1lKTtcbiAgaWYgKCFtYXliZVBhY2thZ2UpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB2ZXJzaW9uID0gbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW21heWJlUGFja2FnZV0gfHwgbWF5YmVQYWNrYWdlO1xuICBpZiAoIW5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3ZlcnNpb25dKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG5nVXBkYXRlTWV0YWRhdGEgPSBucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t2ZXJzaW9uXVsnbmctdXBkYXRlJ107XG4gIGlmICghbmdVcGRhdGVNZXRhZGF0YSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VHcm91cCA9IG5nVXBkYXRlTWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddO1xuICBpZiAoIXBhY2thZ2VHcm91cCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFja2FnZUdyb3VwKSB8fCBwYWNrYWdlR3JvdXAuc29tZSh4ID0+IHR5cGVvZiB4ICE9ICdzdHJpbmcnKSkge1xuICAgIGxvZ2dlci53YXJuKGBwYWNrYWdlR3JvdXAgbWV0YWRhdGEgb2YgcGFja2FnZSAke25wbVBhY2thZ2VKc29uLm5hbWV9IGlzIG1hbGZvcm1lZC5gKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIHBhY2thZ2VHcm91cFxuICAgIC5maWx0ZXIobmFtZSA9PiAhcGFja2FnZXMuaGFzKG5hbWUpKSAgLy8gRG9uJ3Qgb3ZlcnJpZGUgbmFtZXMgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgIC5maWx0ZXIobmFtZSA9PiBhbGxEZXBlbmRlbmNpZXMuaGFzKG5hbWUpKSAgLy8gUmVtb3ZlIHBhY2thZ2VzIHRoYXQgYXJlbid0IGluc3RhbGxlZC5cbiAgICAuZm9yRWFjaChuYW1lID0+IHtcbiAgICBwYWNrYWdlcy5zZXQobmFtZSwgbWF5YmVQYWNrYWdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQWRkIHBlZXIgZGVwZW5kZW5jaWVzIG9mIHBhY2thZ2VzIG9uIHRoZSBjb21tYW5kIGxpbmUgdG8gdGhlIGxpc3Qgb2YgcGFja2FnZXMgdG8gdXBkYXRlLlxuICogV2UgZG9uJ3QgZG8gdmVyaWZpY2F0aW9uIG9mIHRoZSB2ZXJzaW9ucyBoZXJlIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IGEgbGF0ZXIgc3RlcCAoYW5kIGNhblxuICogYmUgaWdub3JlZCBieSB0aGUgLS1mb3JjZSBmbGFnKS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9hZGRQZWVyRGVwZW5kZW5jaWVzKFxuICBwYWNrYWdlczogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgX2FsbERlcGVuZGVuY2llczogUmVhZG9ubHlNYXA8c3RyaW5nLCBzdHJpbmc+LFxuICBucG1QYWNrYWdlSnNvbjogTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uLFxuICBfbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IHZvaWQge1xuICBjb25zdCBtYXliZVBhY2thZ2UgPSBwYWNrYWdlcy5nZXQobnBtUGFja2FnZUpzb24ubmFtZSk7XG4gIGlmICghbWF5YmVQYWNrYWdlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdmVyc2lvbiA9IG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVttYXliZVBhY2thZ2VdIHx8IG1heWJlUGFja2FnZTtcbiAgaWYgKCFucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t2ZXJzaW9uXSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VKc29uID0gbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdmVyc2lvbl07XG4gIGNvbnN0IGVycm9yID0gZmFsc2U7XG5cbiAgZm9yIChjb25zdCBbcGVlciwgcmFuZ2VdIG9mIE9iamVjdC5lbnRyaWVzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pKSB7XG4gICAgaWYgKCFwYWNrYWdlcy5oYXMocGVlcikpIHtcbiAgICAgIHBhY2thZ2VzLnNldChwZWVyLCByYW5nZSBhcyBWZXJzaW9uUmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdBbiBlcnJvciBvY2N1cmVkLCBzZWUgYWJvdmUuJyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0QWxsRGVwZW5kZW5jaWVzKHRyZWU6IFRyZWUpOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+IHtcbiAgY29uc3QgcGFja2FnZUpzb25Db250ZW50ID0gdHJlZS5yZWFkKCcvcGFja2FnZS5qc29uJyk7XG4gIGlmICghcGFja2FnZUpzb25Db250ZW50KSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIGEgcGFja2FnZS5qc29uLiBBcmUgeW91IGluIGEgTm9kZSBwcm9qZWN0PycpO1xuICB9XG5cbiAgbGV0IHBhY2thZ2VKc29uOiBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgdHJ5IHtcbiAgICBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UocGFja2FnZUpzb25Db250ZW50LnRvU3RyaW5nKCkpIGFzIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ3BhY2thZ2UuanNvbiBjb3VsZCBub3QgYmUgcGFyc2VkOiAnICsgZS5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPihbXG4gICAgLi4uT2JqZWN0LmVudHJpZXMocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgLi4uT2JqZWN0LmVudHJpZXMocGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICAuLi5PYmplY3QuZW50cmllcyhwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMgfHwge30pLFxuICBdIGFzIFtzdHJpbmcsIFZlcnNpb25SYW5nZV1bXSk7XG59XG5cbmZ1bmN0aW9uIF9mb3JtYXRWZXJzaW9uKHZlcnNpb246IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICBpZiAodmVyc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICghdmVyc2lvbi5tYXRjaCgvXlxcZHsxLDMwfVxcLlxcZHsxLDMwfVxcLlxcZHsxLDMwfS8pKSB7XG4gICAgdmVyc2lvbiArPSAnLjAnO1xuICB9XG4gIGlmICghdmVyc2lvbi5tYXRjaCgvXlxcZHsxLDMwfVxcLlxcZHsxLDMwfVxcLlxcZHsxLDMwfS8pKSB7XG4gICAgdmVyc2lvbiArPSAnLjAnO1xuICB9XG4gIGlmICghc2VtdmVyLnZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEludmFsaWQgbWlncmF0aW9uIHZlcnNpb246ICR7SlNPTi5zdHJpbmdpZnkodmVyc2lvbil9YCk7XG4gIH1cblxuICByZXR1cm4gdmVyc2lvbjtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zOiBVcGRhdGVTY2hlbWEpOiBSdWxlIHtcbiAgaWYgKCFvcHRpb25zLnBhY2thZ2VzKSB7XG4gICAgLy8gV2UgY2Fubm90IGp1c3QgcmV0dXJuIHRoaXMgYmVjYXVzZSB3ZSBuZWVkIHRvIGZldGNoIHRoZSBwYWNrYWdlcyBmcm9tIE5QTSBzdGlsbCBmb3IgdGhlXG4gICAgLy8gaGVscC9ndWlkZSB0byBzaG93LlxuICAgIG9wdGlvbnMucGFja2FnZXMgPSBbXTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5wYWNrYWdlcyA9PSAnc3RyaW5nJykge1xuICAgIC8vIElmIGEgc3RyaW5nLCB0aGVuIHdlIHNob3VsZCBzcGxpdCBpdCBhbmQgbWFrZSBpdCBhbiBhcnJheS5cbiAgICBvcHRpb25zLnBhY2thZ2VzID0gb3B0aW9ucy5wYWNrYWdlcy5zcGxpdCgvLC9nKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLm1pZ3JhdGVPbmx5ICYmIG9wdGlvbnMuZnJvbSkge1xuICAgIGlmIChvcHRpb25zLnBhY2thZ2VzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJy0tZnJvbSByZXF1aXJlcyB0aGF0IG9ubHkgYSBzaW5nbGUgcGFja2FnZSBiZSBwYXNzZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgb3B0aW9ucy5mcm9tID0gX2Zvcm1hdFZlcnNpb24ob3B0aW9ucy5mcm9tKTtcbiAgb3B0aW9ucy50byA9IF9mb3JtYXRWZXJzaW9uKG9wdGlvbnMudG8pO1xuXG4gIHJldHVybiAodHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IGxvZ2dlciA9IGNvbnRleHQubG9nZ2VyO1xuICAgIGNvbnN0IGFsbERlcGVuZGVuY2llcyA9IF9nZXRBbGxEZXBlbmRlbmNpZXModHJlZSk7XG4gICAgY29uc3QgcGFja2FnZXMgPSBfYnVpbGRQYWNrYWdlTGlzdChvcHRpb25zLCBhbGxEZXBlbmRlbmNpZXMsIGxvZ2dlcik7XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZUZyb20oWy4uLmFsbERlcGVuZGVuY2llcy5rZXlzKCldKS5waXBlKFxuICAgICAgLy8gR3JhYiBhbGwgcGFja2FnZS5qc29uIGZyb20gdGhlIG5wbSByZXBvc2l0b3J5LiBUaGlzIHJlcXVpcmVzIGEgbG90IG9mIEhUVFAgY2FsbHMgc28gd2VcbiAgICAgIC8vIHRyeSB0byBwYXJhbGxlbGl6ZSBhcyBtYW55IGFzIHBvc3NpYmxlLlxuICAgICAgbWVyZ2VNYXAoZGVwTmFtZSA9PiBnZXROcG1QYWNrYWdlSnNvbihkZXBOYW1lLCBvcHRpb25zLnJlZ2lzdHJ5LCBsb2dnZXIpKSxcblxuICAgICAgLy8gQnVpbGQgYSBtYXAgb2YgYWxsIGRlcGVuZGVuY2llcyBhbmQgdGhlaXIgcGFja2FnZUpzb24uXG4gICAgICByZWR1Y2U8TnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uLCBNYXA8c3RyaW5nLCBOcG1SZXBvc2l0b3J5UGFja2FnZUpzb24+PihcbiAgICAgICAgKGFjYywgbnBtUGFja2FnZUpzb24pID0+IHtcbiAgICAgICAgICAvLyBJZiB0aGUgcGFja2FnZSB3YXMgbm90IGZvdW5kIG9uIHRoZSByZWdpc3RyeS4gSXQgY291bGQgYmUgcHJpdmF0ZSwgc28gd2Ugd2lsbCBqdXN0XG4gICAgICAgICAgLy8gaWdub3JlLiBJZiB0aGUgcGFja2FnZSB3YXMgcGFydCBvZiB0aGUgbGlzdCwgd2Ugd2lsbCBlcnJvciBvdXQsIGJ1dCB3aWxsIHNpbXBseSBpZ25vcmVcbiAgICAgICAgICAvLyBpZiBpdCdzIGVpdGhlciBub3QgcmVxdWVzdGVkIChzbyBqdXN0IHBhcnQgb2YgcGFja2FnZS5qc29uLiBzaWxlbnRseSkgb3IgaWYgaXQncyBhXG4gICAgICAgICAgLy8gYC0tYWxsYCBzaXR1YXRpb24uIFRoZXJlIGlzIGFuIGVkZ2UgY2FzZSBoZXJlIHdoZXJlIGEgcHVibGljIHBhY2thZ2UgcGVlciBkZXBlbmRzIG9uIGFcbiAgICAgICAgICAvLyBwcml2YXRlIG9uZSwgYnV0IGl0J3MgcmFyZSBlbm91Z2guXG4gICAgICAgICAgaWYgKCFucG1QYWNrYWdlSnNvbi5uYW1lKSB7XG4gICAgICAgICAgICBpZiAocGFja2FnZXMuaGFzKG5wbVBhY2thZ2VKc29uLnJlcXVlc3RlZE5hbWUpKSB7XG4gICAgICAgICAgICAgIGlmIChvcHRpb25zLmFsbCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobnBtUGFja2FnZUpzb24ucmVxdWVzdGVkTmFtZSl9IHdhcyBub3QgYFxuICAgICAgICAgICAgICAgICAgKyAnZm91bmQgb24gdGhlIHJlZ2lzdHJ5LiBTa2lwcGluZy4nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICAgIGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobnBtUGFja2FnZUpzb24ucmVxdWVzdGVkTmFtZSl9IHdhcyBub3QgZm91bmQgb24gdGhlIGBcbiAgICAgICAgICAgICAgICAgICsgJ3JlZ2lzdHJ5LiBDYW5ub3QgY29udGludWUgYXMgdGhpcyBtYXkgYmUgYW4gZXJyb3IuJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNjLnNldChucG1QYWNrYWdlSnNvbi5uYW1lLCBucG1QYWNrYWdlSnNvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSxcbiAgICAgICAgbmV3IE1hcDxzdHJpbmcsIE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbj4oKSxcbiAgICAgICksXG5cbiAgICAgIG1hcChucG1QYWNrYWdlSnNvbk1hcCA9PiB7XG4gICAgICAgIC8vIEF1Z21lbnQgdGhlIGNvbW1hbmQgbGluZSBwYWNrYWdlIGxpc3Qgd2l0aCBwYWNrYWdlR3JvdXBzIGFuZCBmb3J3YXJkIHBlZXIgZGVwZW5kZW5jaWVzLlxuICAgICAgICAvLyBFYWNoIGFkZGVkIHBhY2thZ2UgbWF5IHVuY292ZXIgbmV3IHBhY2thZ2UgZ3JvdXBzIGFuZCBwZWVyIGRlcGVuZGVuY2llcywgc28gd2UgbXVzdFxuICAgICAgICAvLyByZXBlYXQgdGhpcyBwcm9jZXNzIHVudGlsIHRoZSBwYWNrYWdlIGxpc3Qgc3RhYmlsaXplcy5cbiAgICAgICAgbGV0IGxhc3RQYWNrYWdlc1NpemU7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBsYXN0UGFja2FnZXNTaXplID0gcGFja2FnZXMuc2l6ZTtcbiAgICAgICAgICBucG1QYWNrYWdlSnNvbk1hcC5mb3JFYWNoKChucG1QYWNrYWdlSnNvbikgPT4ge1xuICAgICAgICAgICAgX2FkZFBhY2thZ2VHcm91cChwYWNrYWdlcywgYWxsRGVwZW5kZW5jaWVzLCBucG1QYWNrYWdlSnNvbiwgbG9nZ2VyKTtcbiAgICAgICAgICAgIF9hZGRQZWVyRGVwZW5kZW5jaWVzKHBhY2thZ2VzLCBhbGxEZXBlbmRlbmNpZXMsIG5wbVBhY2thZ2VKc29uLCBsb2dnZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IHdoaWxlIChwYWNrYWdlcy5zaXplID4gbGFzdFBhY2thZ2VzU2l6ZSk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIFBhY2thZ2VJbmZvIGZvciBlYWNoIG1vZHVsZS5cbiAgICAgICAgY29uc3QgcGFja2FnZUluZm9NYXAgPSBuZXcgTWFwPHN0cmluZywgUGFja2FnZUluZm8+KCk7XG4gICAgICAgIG5wbVBhY2thZ2VKc29uTWFwLmZvckVhY2goKG5wbVBhY2thZ2VKc29uKSA9PiB7XG4gICAgICAgICAgcGFja2FnZUluZm9NYXAuc2V0KFxuICAgICAgICAgICAgbnBtUGFja2FnZUpzb24ubmFtZSxcbiAgICAgICAgICAgIF9idWlsZFBhY2thZ2VJbmZvKHRyZWUsIHBhY2thZ2VzLCBhbGxEZXBlbmRlbmNpZXMsIG5wbVBhY2thZ2VKc29uLCBsb2dnZXIpLFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwYWNrYWdlSW5mb01hcDtcbiAgICAgIH0pLFxuXG4gICAgICBzd2l0Y2hNYXAoaW5mb01hcCA9PiB7XG4gICAgICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgYWxsIHRoZSBpbmZvcm1hdGlvbiwgY2hlY2sgdGhlIGZsYWdzLlxuICAgICAgICBpZiAocGFja2FnZXMuc2l6ZSA+IDApIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5taWdyYXRlT25seSAmJiBvcHRpb25zLmZyb20gJiYgb3B0aW9ucy5wYWNrYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIF9taWdyYXRlT25seShcbiAgICAgICAgICAgICAgaW5mb01hcC5nZXQob3B0aW9ucy5wYWNrYWdlc1swXSksXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgIG9wdGlvbnMuZnJvbSxcbiAgICAgICAgICAgICAgb3B0aW9ucy50byxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc3VibG9nID0gbmV3IGxvZ2dpbmcuTGV2ZWxDYXBMb2dnZXIoXG4gICAgICAgICAgICAndmFsaWRhdGlvbicsXG4gICAgICAgICAgICBsb2dnZXIuY3JlYXRlQ2hpbGQoJycpLFxuICAgICAgICAgICAgJ3dhcm4nLFxuICAgICAgICAgICk7XG4gICAgICAgICAgX3ZhbGlkYXRlVXBkYXRlUGFja2FnZXMoaW5mb01hcCwgb3B0aW9ucy5mb3JjZSwgc3VibG9nKTtcblxuICAgICAgICAgIHJldHVybiBfcGVyZm9ybVVwZGF0ZSh0cmVlLCBjb250ZXh0LCBpbmZvTWFwLCBsb2dnZXIsIG9wdGlvbnMubWlncmF0ZU9ubHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfdXNhZ2VNZXNzYWdlKG9wdGlvbnMsIGluZm9NYXAsIGxvZ2dlcik7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2YodHJlZSkpLFxuICAgICk7XG4gIH07XG59XG4iXX0=