/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
var map = {
    'app': 'app',
    'main': 'main.js',
    '@angular': 'node_modules/@angular',
    'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
    'rxjs': 'node_modules/rxjs'
};
// packages tells the System loader how to load when no filename and/or no
// extension
var packages = {
    'app': { main: 'main.js', defaultExtension: 'js' },
    'api': { defaultExtension: 'js' },
    'rxjs': { defaultExtension: 'js' },
    'angular2-in-memory-web-api': { main: 'index.js', defaultExtension: 'js' },
};
var barrels = [
    // App specific barrels.
    'app',
    'app/characters',
    'app/characters/character',
    'app/characters/character-list',
    'app/characters/shared',
    'app/dashboard',
    'app/vehicles',
    'app/vehicles/vehicle',
    'app/vehicles/vehicle-list',
    'app/vehicles/shared',
    'app/shared',
    'app/shared/character-services',
    'app/shared/filter-text',
    'app/shared/modal',
    'app/shared/spinner',
    'app/shared/toast',
];
barrels.forEach(function (barrelName) {
    packages[barrelName] = { main: 'index' };
});
////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
];
// Individual files (~300 requests):
function packIndex(pkgName) {
    packages['@angular/' + pkgName] = {
        main: 'index.js',
        defaultExtension: 'js'
    };
}
// Bundled (~40 requests):
function packUmd(pkgName) {
    packages['@angular/' + pkgName] = {
        main: '/bundles/' + pkgName + '.umd.js',
        defaultExtension: 'js'
    };
}
// Most environments should use UMD; some (Karma) need the individual index
// files
var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
// Add package entries for angular packages
ngPackageNames.forEach(setPackageConfig);
// No umd for router yet
packages['@angular/router'] = {
    main: 'index.js',
    defaultExtension: 'js'
};
var config = { map: map, packages: packages };
System.config(config);
//# sourceMappingURL=system-config.js.map