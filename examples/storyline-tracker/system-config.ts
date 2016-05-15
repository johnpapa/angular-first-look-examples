/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map: any = {
  'app': 'app', // 'dist',
  'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api'
};

const packages: any = {
  // Add your custom SystemJS packages here.
  'angular2-in-memory-web-api': { defaultExtension: 'js' },
  'api': { defaultExtension: 'js' },
  'app': { defaultExtension: 'js' },
  // 'rxjs': { defaultExtension: 'js' }
};

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels = [
  // Angular specific barrels.
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/http',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router',
  // '@angular/testing',
  // '@angular/upgrade',

  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'app',
  'app/+characters',
  'app/+characters/character',
  'app/+characters/character-list',
  'app/+characters/shared',
  'app/+dashboard',
  'app/+vehicles',
  'app/+vehicles/vehicle',
  'app/+vehicles/vehicle-list',
  'app/+vehicles/shared',
  'app/shared',
  'app/shared/character-services',
  'app/shared/filter-text',
  'app/shared/modal',
  'app/shared/spinner',
  'app/shared/toast',
  /** @cli-barrel */
];

const _cliSystemConfig = {};
barrels.forEach((barrelName: string) => {
  _cliSystemConfig[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    // '@angular': 'vendor/@angular',
    // 'rxjs': 'vendor/rxjs',
    '@angular': 'node_modules/@angular',
    'rxjs': 'node_modules/rxjs',
    'main': 'main.js'
  },
  packages: _cliSystemConfig
});

// Apply the user's configuration.
System.config({ map, packages });
