var gulp = require('gulp');
var gutil = require('gulp-util');
var taskListing = require('gulp-task-listing');
var path = require('canonical-path');
var del = require('del');
var _ = require('lodash');
var argv = require('yargs').argv;
var env = require('gulp-env');
var Q = require("q");
var Minimatch = require("minimatch").Minimatch;
var Dgeni = require('dgeni');
var Package = require('dgeni').Package;
var fsExtra = require('fs-extra');
var fs = fsExtra;
var exec = require('child_process').exec;
var execPromise = Q.denodeify(exec);
// cross platform version of spawn that also works on windows.
var xSpawn = require('cross-spawn');
var prompt = require('prompt');
var globby = require("globby");
// Ugh... replacement needed to kill processes on any OS
// - because childProcess.kill does not work properly on windows
var treeKill = require("tree-kill");
var blc = require("broken-link-checker");
var less = require('gulp-less');
var tslint = require('gulp-tslint');

// var exampleFolderPath = 'public/docs/_examples';
var exampleFolderPathPart = '_examples';

// TODO:
//  1. Think about using runSequence
//  2. Think about using spawn instead of exec in case of long error messages.

var TOOLS_PATH = './tools';
var ANGULAR_IO_PROJECT_PATH = path.resolve('.');
var ANGULAR_PROJECT_PATH = '../angular';
// var PUBLIC_PATH = './public';
var PUBLIC_PATH = './';
var TEMP_PATH = './_temp';
// var DOCS_PATH = path.join(PUBLIC_PATH, 'docs');
var DOCS_PATH = path.join('');

// var EXAMPLES_PATH = path.join(DOCS_PATH, 'examples');
var EXAMPLES_PATH = path.join(PUBLIC_PATH, '_examples');
var EXAMPLES_PROTRACTOR_PATH = path.join(EXAMPLES_PATH, '_protractor');
var NOT_API_DOCS_GLOB = path.join(PUBLIC_PATH, './{docs/*/latest/!(api),!(docs)}/**/*.*');
var RESOURCES_PATH = path.join(PUBLIC_PATH, 'resources');
var LIVE_EXAMPLES_PATH = path.join(RESOURCES_PATH, 'live-examples');
var STYLES_SOURCE_PATH = path.join(TOOLS_PATH, 'styles-builder/less');

var docShredder = require(path.resolve(TOOLS_PATH, 'doc-shredder/doc-shredder'));
var exampleZipper = require(path.resolve(TOOLS_PATH, '_example-zipper/exampleZipper'));
var regularPlunker = require(path.resolve(TOOLS_PATH, 'plunker-builder/regularPlunker'));
var embeddedPlunker = require(path.resolve(TOOLS_PATH, 'plunker-builder/embeddedPlunker'));
var fsUtils = require(path.resolve(TOOLS_PATH, 'fs-utils/fsUtils'));

const isSilent = !!argv.silent;
if (isSilent) gutil.log = gutil.noop;
const _dgeniLogLevel = argv.dgeniLog || (isSilent ? 'error' : 'info');

var _devguideShredOptions =  {
  examplesDir: path.join(DOCS_PATH, '_examples'),
  fragmentsDir: path.join(DOCS_PATH, '_fragments'),
  zipDir: path.join(RESOURCES_PATH, 'zips'),
  logLevel: _dgeniLogLevel
};

var _devguideShredJadeOptions =  {
  jadeDir: DOCS_PATH,
  logLevel: _dgeniLogLevel
};

var _apiShredOptions =  {
  lang: 'ts',
  examplesDir: path.join(ANGULAR_PROJECT_PATH, 'modules/@angular/examples'),
  fragmentsDir: path.join(DOCS_PATH, '_fragments/_api'),
  zipDir: path.join(RESOURCES_PATH, 'zips/api'),
  logLevel: _dgeniLogLevel
};

var _excludePatterns = ['**/node_modules/**', '**/typings/**', '**/packages/**'];

var _excludeMatchers = _excludePatterns.map(function(excludePattern){
  return new Minimatch(excludePattern)
});

var _exampleBoilerplateFiles = [
  '.editorconfig',
  // 'a2docs.css',
  'karma.conf.js',
  'karma-test-shim.js',
  'package.json',
  'styles.css',
  'systemjs.config.js',
  'tsconfig.json',
  'tslint.json',
  'typings.json',
  'wallaby.js'
 ];

var _exampleProtractorBoilerplateFiles = [
  'tsconfig.json'
];

var _exampleConfigFilename = 'example-config.json';

var _styleLessName = 'a2docs.less';

// Gulp flags:
//
//   --lang=[all | ts | js | dart | 'ts|js' | 'ts|js|dart' | ...]
//
//    This affects which language API docs and E2E tests are run. Can be 'all',
//    or a regex pattern to match any one of 'ts', 'js', or 'dart'.
//    Default: 'ts|js' except for the "full site build" tasks (see below),
//    for which it is 'all'.
//
var lang, langs = false;
function configLangs(langOption) {
  const fullSiteBuildTasks = ['build-compile', 'check-serve', 'check-deploy'];
  const buildAllDocs = argv['_'] &&
    fullSiteBuildTasks.some((task) => argv['_'].indexOf(task) >= 0);
  const langDefault = buildAllDocs ? 'all' : 'ts|js';
  lang = (langOption || langDefault).toLowerCase();
  if (lang === 'all') lang = 'ts|js';
  langs = lang.match(/\w+/g); // the languages in `lang` as an array
  gutil.log('Building docs for: ' + lang);
}
configLangs(argv.lang);

/**
 * Run Protractor End-to-End Specs for Doc Samples
 * Alias for 'run-e2e-tests'
 */
gulp.task('e2e', runE2e);

gulp.task('run-e2e-tests', runE2e);

/**
 * Run Protractor End-to-End Tests for Doc Samples
 *
 * Flags
 *   --filter to filter/select _example app subdir names
 *    e.g. gulp e2e --filter=foo  // all example apps with 'foo' in their folder names.
 *
 *    --fast by-passes the npm install and webdriver update
 *    Use it for repeated test runs (but not the FIRST run)
 *    e.g. gulp e2e --fast
 *
 *   --lang to filter by code language (see above for details)
 *     e.g. gulp e2e --lang=ts  // only TypeScript apps
 */
function runE2e() {
  var promise;
  if (argv.fast) {
    // fast; skip all setup
    promise = Promise.resolve(true);
  } else  {
    /*
       // Not 'fast'; do full setup
    var spawnInfo = spawnExt('npm', ['install'], { cwd: EXAMPLES_PATH});
    promise = spawnInfo.promise.then(function() {
      copyExampleBoilerplate();
      spawnInfo = spawnExt('npm', ['run', 'webdriver:update'], {cwd: EXAMPLES_PATH});
      return spawnInfo.promise;
    });
    */
    // Not 'fast'; do full setup
    gutil.log('runE2e: install _protractor stuff');
    var spawnInfo = spawnExt('npm', ['install'], { cwd: EXAMPLES_PROTRACTOR_PATH});
    promise = spawnInfo.promise
      .then(function() {
        gutil.log('runE2e: install _examples stuff');
        spawnInfo = spawnExt('npm', ['install'], { cwd: EXAMPLES_PATH})
        return spawnInfo.promise;
      })
      .then(function() {
        buildStyles(copyExampleBoilerplate, _.noop);
        gutil.log('runE2e: update webdriver');
        spawnInfo = spawnExt('npm', ['run', 'webdriver:update'], {cwd: EXAMPLES_PROTRACTOR_PATH});
        return spawnInfo.promise;
      });
  };

  var outputFile = path.join(process.cwd(), 'protractor-results.txt');

  promise.then(function() {
    return findAndRunE2eTests(argv.filter, outputFile);
  }).then(function(status) {
    reportStatus(status, outputFile);
    if (status.failed.length > 0){
      return Promise.reject('Some test suites failed');
    }
  }).catch(function(e) {
    gutil.log(e);
    process.exitCode = 1;
  });
  return promise;
}

// finds all of the *e2e-spec.tests under the _examples folder along
// with the corresponding apps that they should run under. Then run
// each app/spec collection sequentially.
function findAndRunE2eTests(filter, outputFile) {
  // create an output file with header.
  var startTime = new Date().getTime();
  var header = `Doc Sample Protractor Results for ${lang} on ${new Date().toLocaleString()}\n`;
  header += argv.fast ?
    '  Fast Mode (--fast): no npm install, webdriver update, or boilerplate copy\n' :
    '  Slow Mode: npm install, webdriver update, and boilerplate copy\n';
  header += `  Filter: ${filter ? filter : 'All tests'}\n\n`;
  fs.writeFileSync(outputFile, header);

  // create an array of combos where each
  // combo consists of { examplePath: ... , protractorConfigFilename:  ... }
  var examplePaths = [];
  var e2eSpecPaths = getE2eSpecPaths(EXAMPLES_PATH);
   e2eSpecPaths.forEach(function(specPath) {
    var destConfig = path.join(specPath, 'protractor.config.js');
    // get all of the examples under each dir where a pcFilename is found
    localExamplePaths = getExamplePaths(specPath, true);
    // Filter by language
    localExamplePaths = localExamplePaths.filter(function (fn) {
      return fn.match('/'+lang+'$') != null;
    });
    if (filter) {
      localExamplePaths = localExamplePaths.filter(function (fn) {
        return fn.match(filter) != null;
      })
    }
    localExamplePaths.forEach(function(examplePath) {
      examplePaths.push(examplePath);
    })
  });

  // run the tests sequentially
  var status = { passed: [], failed: [] };
  return examplePaths.reduce(function (promise, examplePath) {
    return promise.then(function () {
      var runTests = runE2eTsTests;
      return runTests(examplePath, outputFile).then(function(ok) {
        var arr = ok ? status.passed : status.failed;
        arr.push(examplePath);
      })
    });
  }, Q.resolve()).then(function() {
    var stopTime = new Date().getTime();
    status.elapsedTime = (stopTime - startTime)/1000;
    return status;
  });
}

// start the example in appDir; then run protractor with the specified
// fileName; then shut down the example.  All protractor output is appended
// to the outputFile.
function runE2eTsTests(appDir, outputFile) {
  // Grab protractor configuration or defaults to systemjs config.
  try {
    var exampleConfig = fs.readJsonSync(`${appDir}/${_exampleConfigFilename}`);
  } catch (e) {
    exampleConfig = {
      build: 'tsc',
      run: 'http-server:e2e'
    };
  }

  var appBuildSpawnInfo = spawnExt('npm', ['run', exampleConfig.build], { cwd: appDir });
  var appRunSpawnInfo = spawnExt('npm', ['run', exampleConfig.run, '--', '-s'], { cwd: appDir });

  return runProtractor(appBuildSpawnInfo.promise, appDir, appRunSpawnInfo, outputFile);
}

function runProtractor(prepPromise, appDir, appRunSpawnInfo, outputFile) {
  var specFilename = path.resolve(`${appDir}/../e2e-spec.ts`);
  return prepPromise
    .catch(function(){
      var emsg = `Application at ${appDir} failed to transpile.\n\n`;
      gutil.log(emsg);
      fs.appendFileSync(outputFile, emsg);
      return Promise.reject(emsg);
    })
    .then(function (data) {
      var transpileError = false;

      // start protractor

      var spawnInfo = spawnExt('npm', [ 'run', 'protractor', '--', 'protractor.config.js',
        `--specs=${specFilename}`, '--params.appDir=' + appDir, '--params.outputFile=' + outputFile], { cwd: EXAMPLES_PROTRACTOR_PATH });

      spawnInfo.proc.stderr.on('data', function (data) {
        transpileError = transpileError || /npm ERR! Exit status 100/.test(data.toString());
      });
      return spawnInfo.promise.catch(function(err) {
        if (transpileError) {
        var emsg = `${specFilename} failed to transpile.\n\n`;
        gutil.log(emsg);
        fs.appendFileSync(outputFile, emsg);
        }
        return Promise.reject(emsg);
      });
    })
    .then(
       function() { return finish(true);},
       function() { return finish(false);}
    )

    function finish(ok){
      // Ugh... proc.kill does not work properly on windows with child processes.
      // appRun.proc.kill();
      treeKill(appRunSpawnInfo.proc.pid);
      return ok;
    }
}

function reportStatus(status, outputFile) {
  var log = [''];
  log.push('Suites passed:');
  status.passed.forEach(function(val) {
    log.push('  ' + val);
  });

  if (status.failed.length == 0) {
    log.push('All tests passed');
  } else {
    log.push('Suites failed:');
    status.failed.forEach(function (val) {
      log.push('  ' + val);
    });
  }
  log.push('\nElapsed time: ' +  status.elapsedTime + ' seconds');
  var log = log.join('\n');
  gutil.log(log);
  fs.appendFileSync(outputFile, log);
}

// returns both a promise and the spawned process so that it can be killed if needed.
function spawnExt(command, args, options) {
  var deferred = Q.defer();
  var descr = command + " " + args.join(' ');
  var proc;
  gutil.log('running: ' + descr);
  try {
    proc = xSpawn.spawn(command, args, options);
  } catch(e) {
    gutil.log(e);
    deferred.reject(e);
    return { proc: null, promise: deferred.promise };
  }
  proc.stdout.on('data', function (data) {
    gutil.log(data.toString());
  });
  proc.stderr.on('data', function (data) {
    gutil.log(data.toString());
  });
  proc.on('close', function (returnCode) {
    gutil.log('completed: ' + descr);
    // Many tasks (e.g., tsc) complete but are actually errors;
    // Confirm return code is zero.
    returnCode === 0 ? deferred.resolve(0) : deferred.reject(returnCode);
  });
  proc.on('error', function (data) {
    gutil.log('completed with error:' + descr);
    gutil.log(data.toString());
    deferred.reject(data);
  });
  return { proc: proc, promise: deferred.promise };
}

// Public tasks

gulp.task('default', ['help']);

gulp.task('help', taskListing.withFilters(function(taskName) {
  var isSubTask = taskName.substr(0,1) == "_";
  return isSubTask;
}, function(taskName) {
  var shouldRemove = taskName === 'default';
  return shouldRemove;
}));

// requires admin access because it adds symlinks
gulp.task('add-example-boilerplate', function(done) {
  var realPath = path.join(EXAMPLES_PATH, '/node_modules');
  var nodeModulesPaths = getNodeModulesPaths(EXAMPLES_PATH);

  nodeModulesPaths.forEach(function(linkPath) {
    gutil.log("symlinking " + linkPath + ' -> ' + realPath)
    fsUtils.addSymlink(realPath, linkPath);
  });

  realPath = path.join(EXAMPLES_PATH, '/typings');
  var typingsPaths = getTypingsPaths(EXAMPLES_PATH);
  typingsPaths.forEach(function(linkPath) {
    gutil.log("symlinking " + linkPath + ' -> ' + realPath)
    fsUtils.addSymlink(realPath, linkPath);
  });

  return buildStyles(copyExampleBoilerplate, done);
});


// copies boilerplate files to locations
// where an example app is found
gulp.task('_copy-example-boilerplate', function (done) {
  return argv.fast ? done() : buildStyles(copyExampleBoilerplate, done);
});

//Builds Angular 2 Docs CSS file from Bootstrap npm LESS source
//and copies the result to the _examples folder to be included as
//part of the example boilerplate.
function buildStyles(cb, done){
  gulp.src(path.join(STYLES_SOURCE_PATH, _styleLessName))
    .pipe(less())
    .pipe(gulp.dest(EXAMPLES_PATH)).on('end', function(){
      cb().then(function() { done(); });
    });
}

// copies boilerplate files to locations
// where an example app is found
// also copies certain web files (e.g., styles.css) to ~/_examples/**/dart/**/web
function copyExampleBoilerplate() {
  gutil.log('Copying example boilerplate files');
  var sourceFiles = _exampleBoilerplateFiles.map(function(fn) {
    return path.join(EXAMPLES_PATH, fn);
  });
  console.log(`sourceFiles=${sourceFiles.toString()}`)
  var examplePaths = getExamplePaths(EXAMPLES_PATH);
  console.log(`examplePaths=${examplePaths}`)

  // Make boilerplate files read-only to avoid that they be edited by mistake.
  var destFileMode = '444';
  return copyFiles(sourceFiles, examplePaths, destFileMode)
}

gulp.task('remove-example-boilerplate', function() {
  var nodeModulesPaths = getNodeModulesPaths(EXAMPLES_PATH);
  nodeModulesPaths.forEach(function(linkPath) {
    fsUtils.removeSymlink(linkPath);
  });

  var typingsPaths = getTypingsPaths(EXAMPLES_PATH);
  typingsPaths.forEach(function(linkPath) {
    fsUtils.removeSymlink(linkPath);
  });

  deleteExampleBoilerPlate();
});

// Npm install Angular libraries into examples/node_modules,
// either release or current build packages
// Examples:
//   gulp install-example-angular --build  // use current build packages
//   gulp install-example-angular          // restore release packages
gulp.task('install-example-angular', installExampleAngular);

function installExampleAngular() {
  var sources;
  var template;
  var libs = [
    'core', 'common', 'compiler', 'compiler-cli',
    'platform-browser', 'platform-browser-dynamic',
    'forms', 'http', 'router', 'upgrade'];

  // Like: "angular/core-builds" or "@angular/core"
  sources = libs.map( lib => argv.build ? `angular/${lib}-builds` : `@angular/${lib}`);

  if (argv.build) { sources.push('@angular/tsc-wrapped');} // tsc-wrapped needed for builds

  sources.push('@angular/router-deprecated');

  gutil.log(`Installing Angular npm packages from ${argv.build ? 'BUILD' : 'RELEASE'}`);

  var spawnInfo = spawnExt('rm', ['-rf', 'node_modules/@angular'], { cwd: EXAMPLES_PATH});
  return spawnInfo.promise
    .then(() =>  {
      spawnInfo = spawnExt('npm', ['install', ...sources], {cwd: EXAMPLES_PATH});
      return spawnInfo.promise
    });
}

// deletes boilerplate files that were added by copyExampleBoilerplate
// from locations where an example app is found
gulp.task('_delete-example-boilerplate', deleteExampleBoilerPlate);

function deleteExampleBoilerPlate() {
  gutil.log('Deleting example boilerplate files');
  var examplePaths = getExamplePaths(EXAMPLES_PATH);

  return deleteFiles(_exampleBoilerplateFiles, examplePaths)
    .then(function() {
      var protractorFiles = _exampleProtractorBoilerplateFiles;
      var e2eSpecPaths = getE2eSpecPaths(EXAMPLES_PATH);
      return deleteFiles(protractorFiles, e2eSpecPaths);
    });
}

gulp.task('build-plunkers', ['_copy-example-boilerplate'], function() {
  regularPlunker.buildPlunkers(EXAMPLES_PATH, LIVE_EXAMPLES_PATH, { errFn: gutil.log, build: argv.build });
  return embeddedPlunker.buildPlunkers(EXAMPLES_PATH, LIVE_EXAMPLES_PATH, { errFn: gutil.log, build: argv.build });
});

// Usage:
//   angular.io:  gulp link-checker
//   local site:  gulp link-checker --url=http://localhost:3000
gulp.task('link-checker', function(done) {
  var method = 'get'; // the default 'head' fails for some sites
  var exclude = [
    // Somehow the link checker sees ng1 {{...}} in the resource page; ignore it
    'resources/%7B%7Bresource.url%7D%7D',
    // API docs have links directly into GitHub repo sources; these can
    // quickly become invalid, so ignore them for now:
    '*/angular/tree/*'
  ];
  var blcOptions = { requestMethod: method, excludedKeywords: exclude};
  return linkChecker({ blcOptions: blcOptions });
});



gulp.task('_shred-devguide-examples', ['_shred-clean-devguide', '_copy-example-boilerplate'], function() {
  // Split big shredding task into partials 2016-06-14
  var examplePaths = globby.sync(EXAMPLES_PATH+'/*/', {ignore: ['/node_modules', 'typings/', '_protractor/']});
  var promise = Promise.resolve(true);
  examplePaths.forEach(function (examplePath) {
    promise = promise.then(() => docShredder.shredSingleExampleDir(_devguideShredOptions, examplePath));
  });
  return promise;
});

gulp.task('_zip-examples', function() {
  exampleZipper.zipExamples(_devguideShredOptions.examplesDir, _devguideShredOptions.zipDir);
  exampleZipper.zipExamples(_apiShredOptions.examplesDir, _apiShredOptions.zipDir);
});

// Linting

gulp.task('lint', function () {
  return gulp.src([
      './' + exampleFolderPathPart + '/**/*.ts',
      '!./' + exampleFolderPathPart + '/**/ts-snippets/*.ts',
      '!./' + exampleFolderPathPart + '/style-guide/ts/**/*.avoid.ts',
      '!./' + exampleFolderPathPart + '/**/node_modules/**/*',
      '!./' + exampleFolderPathPart + '/_protractor/**/*',
      '!./' + exampleFolderPathPart + '/**/typings/**/*',
      '!./' + exampleFolderPathPart + '/**/typings-ng1/**/*',
      '!./' + exampleFolderPathPart + '/**/build/**/*',
      // temporary until codelyzer is fixed mgechev/codelyzer#60
      '!./' + exampleFolderPathPart + '/animations/ts/app/hero.service.ts'
    ])
    .pipe(tslint({
      rulesDirectory: ['node_modules/codelyzer'],
      configuration: require('./tslint.json')
    }))
    .pipe(tslint.report('prose', {
      summarizeFailureOutput: true
    }));
});


// Helper functions

function linkChecker(options) {
  var deferred = Q.defer();
  var options = options || {};

  var blcOptions = options.blcOptions || {};
  var customData = options.customData || {};

  // don't bother reporting bad links matching this RegExp
  var excludeBad = argv.excludeBad ? new RegExp(argv.excludeBad) : (options.excludeBad || '');

  var previousPage;
  var siteUrl = argv.url || options.url || 'https://angular.io/';

  // See https://github.com/stevenvachon/broken-link-checker#blcsitecheckeroptions-handlers
  var handlers = {
    robots: function(robots, customData){},
    html: function(tree, robots, response, pageUrl, customData){
      // gutil.log('Scanning ' + pageUrl);
    },
    junk: function(result, customData){},

    // Analyze links
    link: function(result, customData){
      if (!result.broken) { return; }
      if (excludeBad && excludeBad.test(result.url.resolved)) { return; }

      var currentPage = result.base.resolved
      if (previousPage !== currentPage) {
        previousPage = currentPage;
        fs.appendFileSync(outputFile, '\n' + currentPage);
        gutil.log('broken: ' + currentPage);
      }
      var msg = '\n  [' + result.html.location.line + ', ' + result.brokenReason + '] ' + result.url.resolved;
      fs.appendFileSync(outputFile, msg);
      // gutil.log(msg);
      // gutil.log(result);
    },

    page: function(error, pageUrl, customData){},
    site: function(error, siteUrl, customData){},

    end: function(){
      var stopTime = new Date().getTime();
      var elapsed = 'Elapsed link-checking time: ' + ((stopTime - startTime)/1000) + ' seconds';
      gutil.log(elapsed);
      fs.appendFileSync(outputFile, '\n'+elapsed);
      gutil.log('Output in file: ' + outputFile);
      deferred.resolve(true);
    }
  };

  // create an output file with header.
  var outputFile = path.join(process.cwd(), 'link-checker-results.txt');
  var header = 'Link checker results for: ' + siteUrl +
               '\nStarted: ' + (new Date()).toLocaleString() +
               '\nExcluded links (blc file globs): ' + blcOptions.excludedKeywords +
               '\nExcluded links (custom --exclude-bad regex): ' + excludeBad.toString() + '\n\n';
  gutil.log(header);
  fs.writeFileSync(outputFile, header);

  var siteChecker = new blc.SiteChecker(blcOptions, handlers);
  var startTime = new Date().getTime();

  try {
    gutil.log('link checker started');
    siteChecker.enqueue(siteUrl, customData);
  } catch (err) {
    gutil.log('link checker died');
    console.error('link checker died', err);
    deferred.reject(err);
  }
  return deferred.promise;
}

// harp has issues with node_modules under the public dir
// but we need them there for example testing and development
// this method allows the node modules folder under '_examples'
// to be temporarily moved out from under 'public' while harp
// compilation is occurring.
function showHideExampleNodeModules(showOrHide) {
  var nmPath = path.join(EXAMPLES_PATH, "/node_modules");
  var nmHiddenPath = path.join(TEMP_PATH, "/node_modules");
  if (showOrHide == 'hide' && fs.existsSync(nmPath)) {
    if (!fs.existsSync(TEMP_PATH)) {
      fs.mkdirSync(TEMP_PATH);
    }
    fs.renameSync(nmPath, nmHiddenPath);
  } else if (showOrHide == 'show' && fs.existsSync(nmHiddenPath)) {
    fs.renameSync(nmHiddenPath, nmPath);
    fs.rmdirSync(TEMP_PATH);
  }
}

// Copies fileNames into destPaths, setting the mode of the
// files at the destination as optional_destFileMode if given.
// returns a promise
function copyFiles(fileNames, destPaths, optional_destFileMode) {
  var copy = Q.denodeify(fsExtra.copy);
  var chmod = Q.denodeify(fsExtra.chmod);
  var copyPromises = [];
  destPaths.forEach(function(destPath) {
    fileNames.forEach(function(fileName) {
      var baseName = path.basename(fileName);
      var destName = path.join(destPath, baseName);
      var p = copy(fileName, destName, { clobber: true});
      if(optional_destFileMode !== undefined) {
        p = p.then(function () {
          return chmod(destName, optional_destFileMode);
        });
      }
      copyPromises.push(p);
    });
  });
  return Q.all(copyPromises);
}

function deleteFiles(baseFileNames, destPaths) {
  var remove = Q.denodeify(fsExtra.remove);
  var delPromises = [];
  destPaths.forEach(function(destPath) {
    baseFileNames.forEach(function(baseFileName) {
      var destFileName = path.join(destPath, baseFileName);
      var p = remove(destFileName);
      delPromises.push(p);
    });
  });
  return Q.all(delPromises);
}

// TODO: filter out all paths that are subdirs of another
// path in the result.
function getE2eSpecPaths(basePath) {
  var paths = getPaths(basePath, '*e2e-spec.+(js|ts)', true);
  return _.uniq(paths);
}

function getNodeModulesPaths(basePath) {
  var paths = getExamplePaths(basePath).map(function(examplePath) {
    return path.join(examplePath, "/node_modules");
  });
  return paths;
}

function getTypingsPaths(basePath) {
  var paths = getExamplePaths(basePath).map(function(examplePath) {
    return path.join(examplePath, "/typings");
  });
  return paths;
}

function getExamplePaths(basePath, includeBase) {
  // includeBase defaults to false
  return getPaths(basePath, _exampleConfigFilename, includeBase)
}

function getPaths(basePath, filename, includeBase) {
  var filenames = getFilenames(basePath, filename, includeBase);
  var paths = filenames.map(function(fileName) {
    return path.dirname(fileName);
  });
  return paths;
}

function getFilenames(basePath, filename, includeBase) {
  // includeBase defaults to false
  var includePatterns = [path.join(basePath, "**/" + filename)];
  if (!includeBase) {
    // ignore (skip) the top level version.
    includePatterns.push("!" + path.join(basePath, "/" + filename));
  }
  var nmPattern = path.join(basePath, "**/node_modules/**");
  var filenames = globby.sync(includePatterns, {ignore: [nmPattern]});
  return filenames;
}

// returns a promise;
function askDeploy() {

  prompt.start();
  var schema = {
    name: 'shouldDeploy',
    description: 'Deploy to Firebase? (y/n): ',
    type: 'string',
    pattern: /Y|N|y|n/,
    message: "Respond with either a 'y' or 'n'",
    required: true
  }
  var getPromise = Q.denodeify(prompt.get);
  return getPromise([schema]).then(function(result) {
    return result.shouldDeploy.toLowerCase() === 'y';
  });
}


function filterOutExcludedPatterns(fileNames, excludeMatchers) {
  return fileNames.filter(function(fileName) {
    return !excludeMatchers.some(function(excludeMatcher) {
      return excludeMatcher.match(fileName);
    });
  });
}

function devGuideExamplesWatch(shredOptions, postShredAction) {
  var includePattern = path.join(shredOptions.examplesDir, '**/*.*');
  // removed this version because gulp.watch has the same glob issue that dgeni has.
  // var excludePattern = '!' + path.join(shredOptions.examplesDir, '**/node_modules/**/*.*');
  // gulp.watch([includePattern, excludePattern], {readDelay: 500}, function (event, done) {
  var ignoreThese = [ '**/node_modules/**', '**/_fragments/**', '**/dist/**', '**/typings/**'];
  ignoreThese = ignoreThese.concat(_exampleBoilerplateFiles.map((file) => `${exampleFolderPathPart}/*/*/${file}`));
  var files = globby.sync( [includePattern], { ignore: ignoreThese });
  gulp.watch([files], {readDelay: 500}, function (event, done) {
    gutil.log('Dev Guide example changed')
    gutil.log('Event type: ' + event.type); // added, changed, or deleted
    gutil.log('Event path: ' + event.path); // The path of the modified file
    return docShredder.shredSingleDir(shredOptions, event.path).then(postShredAction);
  });
}

function buildShredMaps(shouldWrite) {
  var options = {
    devguideExamplesDir: _devguideShredOptions.examplesDir,
    apiExamplesDir: _apiShredOptions.examplesDir,
    fragmentsDir: _devguideShredOptions.fragmentsDir,
    jadeDir: './public/docs',
    outputDir: './public/docs',
    writeFilesEnabled: shouldWrite,
    logLevel: _dgeniLogLevel
  };
  return docShredder.buildShredMap(options).then(function(docs) {
    return docs;
  });
}

function jadeShredMapToJadeExampleMap(jadeShredMap, examplePaths) {
  // remove dups in examplePaths
  var exampleSet = {};
  examplePaths.forEach(function(examplePath) {
    exampleSet[examplePath] = examplePath;
  });
  var basePath = path.resolve(".");
  var jadeToFragMap = jadeShredMap.jadeToFragMap;
  var jadeExampleMap = {};
  for (var jadePath in jadeToFragMap) {
    var relativeJadePath = path.relative(basePath, jadePath);
    var vals = jadeToFragMap[jadePath];
    vals.forEach(function(val) {
      var relativeExamplePath = path.relative(basePath, val.examplePath);
      if (exampleSet[relativeExamplePath] != null) {
        addKeyValue(jadeExampleMap, relativeJadePath, relativeExamplePath);
      }
    });
  }
  return jadeExampleMap;
}

function jadeShredMapToExampleJadeMap(jadeShredMap) {

  var jadeToFragMap = jadeShredMap.jadeToFragMap;
  var exampleJadeMap = {};
  for (var jadePath in jadeToFragMap) {
    var vals = jadeToFragMap[jadePath];
    vals.forEach(function(val) {
      var examplePath = val.examplePath;
      addKeyValue(exampleJadeMap, examplePath, jadePath);
    });
  }
  return exampleJadeMap;
}

function addKeyValue(map, key, value) {
  var vals = map[key];
  if (vals) {
    if (vals.indexOf(value) == -1) {
      vals.push(value);
    }
  } else {
    map[key] = [value];
  }
}


// Synchronously execute a chain of commands.
// cmds: an array of commands
// options: { shouldLog: true,  shouldThrow: true }
// cb: function(err, stdout, stderr)
function execCommands(cmds, options, cb) {
  options = options || {};
  options.shouldThrow = options.shouldThrow == null ? true : options.shouldThrow;
  options.shouldLog = options.shouldLog == null ? true : options.shouldLog;
  if (!cmds || cmds.length == 0) cb(null, null, null);
  var exec = require('child_process').exec;  // just to make it more portable.
  gutil.log("NODE_ENV: " + process.env.NODE_ENV);

  exec(cmds[0], options, function(err, stdout, stderr) {
    if (err == null) {
      if (options.shouldLog) {
        gutil.log('cmd: ' + cmds[0]);
        gutil.log('stdout: ' + stdout);
      }
      if (cmds.length == 1) {
        cb(err, stdout, stderr);
      } else {
        execCommands(cmds.slice(1), options, cb);
      }
    } else {
      if (options.shouldLog) {
        gutil.log('exec error on cmd: ' + cmds[0]);
        gutil.log('exec error: ' + err);
        if (stdout) gutil.log('stdout: ' + stdout);
        if (stderr) gutil.log('stderr: ' + stderr);
      }
      if (err && options.shouldThrow) throw err;
      cb(err, stdout, stderr);
    }
  });
}

function ngPathFor(lang) {
  return ANGULAR_PROJECT_PATH + '';
}

function checkAngularProjectPath(_ngPath) {
  var ngPath = path.resolve(_ngPath || ngPathFor('ts'));
  if (fs.existsSync(ngPath)) return;
  throw new Error('API related tasks require the angular2 repo to be at ' + ngPath);
}

function renameIfExistsSync(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
  } else {
    gutil.log(`renameIfExistsSync cannot find file to rename: ${oldPath}`);
  }
}
