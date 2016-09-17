var gulp = require('gulp');
var gutil = require('gulp-util');
var taskListing = require('gulp-task-listing');
var path = require('canonical-path');

var TOOLS_PATH = './';
var EXAMPLES_PATH = path.join('./', '');
var PUBLIC_PATH = './plunker';
var RESOURCES_PATH = path.join(PUBLIC_PATH, 'resources');
var LIVE_EXAMPLES_PATH = path.join(RESOURCES_PATH, 'live-examples');

var plunkerBuilder = require(path.resolve(TOOLS_PATH, 'plunker-builder/plunkerBuilder'));

gulp.task('default', ['help']);

gulp.task('help', taskListing.withFilters(function (taskName) {
  var isSubTask = taskName.substr(0, 1) == "_";
  return isSubTask;
}, function (taskName) {
  var shouldRemove = taskName === 'default';
  return shouldRemove;
}));

gulp.task('build-plunkers', function () {
  return plunkerBuilder.buildPlunkers(EXAMPLES_PATH, LIVE_EXAMPLES_PATH, { errFn: gutil.log });
});
