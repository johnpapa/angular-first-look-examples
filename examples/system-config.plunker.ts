/**
 * PLUNKER VERSION (based on system-config.ts in angular.io)
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */


/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
let ngVer = '@2.0.0-rc.4'; // lock in the angular package version; do not let it float to current!

/** Map relative paths to URLs. */
const map: any = {
  'app' : 'app',

  'main': 'main.js',
  '@angular' : 'node_modules/@angular',
  '@angular': 'https://npmcdn.com/@angular',
  'angular2-in-memory-web-api' : 'https://npmcdn.com/angular2-in-memory-web-api',
  'rxjs': 'https://npmcdn.com/rxjs@5.0.0-beta.6',
  'ts': 'https://npmcdn.com/plugin-typescript@4.0.10/lib/plugin.js',
  'typescript': 'https://npmcdn.com/typescript@1.8.10/lib/typescript.js',
};

// packages tells the System loader how to load when no filename and/or no
// extension
const packages: any = {
  'app' : {main : 'main.js', defaultExtension : 'js'},
  'api' : {defaultExtension : 'js'},
  'rxjs' : {defaultExtension : 'js'},
  'angular2-in-memory-web-api' : {defaultExtension : 'js'},
};

const barrels: any = [
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

barrels.forEach((barrelName: string) => {
  packages[barrelName] = { main: 'index' };
});

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/

const ngPackageNames: string[] = [
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
    main : 'index.js',
    defaultExtension : 'js'
  };
}

// Bundled (~40 requests):
function packUmd(pkgName) {
  packages['@angular/' + pkgName] = {
    main : '/bundles/' + pkgName + '.umd.js',
    defaultExtension : 'js'
  };
}

declare var System: any;

// Most environments should use UMD; some (Karma) need the individual index
// files
var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

// Add map entries for each angular package
// only because we're pinning the version with `ngVer`.
ngPackageNames.forEach(function(pkgName) {
  map['@angular/'+pkgName] = 'https://npmcdn.com/@angular/' + pkgName + ngVer;
});

// Add package entries for angular packages
ngPackageNames.forEach(setPackageConfig);

// No umd for router yet
packages['@angular/router'] = {
  main : 'index.js',
  defaultExtension : 'js'
};

var config = {
  // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
  transpiler: 'ts',
  typescriptOptions: {
    tsconfig: true
  },
  meta: {
    'typescript': {
      "exports": "ts"
    }
  },
  map: map,
  packages: packages
}

System.config(config);

// // Add package entries for angular packages
// ngPackageNames.forEach(function(pkgName) {

//   // Bundled (~40 requests):
//   packages['@angular/'+pkgName] = { main: pkgName + '.umd.js', defaultExtension: 'js' };

//   // Individual files (~300 requests):
//   //packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
// });
