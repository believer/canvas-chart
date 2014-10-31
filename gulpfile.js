var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var jshint  = require('gulp-jshint');
var mocha   = require('gulp-mocha');

gulp.task('test', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(plumber())
    .pipe(mocha({
      reporter:'spec'
    }));
});

gulp.task('jshint', function() {
  gulp.src(['index.js', 'test/**/*.js'])
    .pipe(jshint());
});

gulp.task('watch', function () {
  gulp.watch(['index.js','test/**/*.js'], ['jshint','test']);
});

gulp.task('default', ['jshint', 'test', 'watch']);