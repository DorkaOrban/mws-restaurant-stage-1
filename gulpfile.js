'use strict';

var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

// Set the browser that you want to support
const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // Clean output directory
gulp.task('clean', () => del(['dist2']));

// Gulp task to minify all files
gulp.task('default', ['clean'], function () {
  runSequence(
    'styles',
    'scripts',
    'pages'
  );
});

// Gulp task to minify CSS files
gulp.task('styles', function () {
    return gulp.src('./css/*.css')
      // Auto-prefix css styles for cross browser compatibility
      .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      // Minify the file
      .pipe(csso())
      // Output
      .pipe(gulp.dest('./dist2/css'))
});

gulp.task('es6', () => {
  gulp.src('./js/*.js')
      .pipe(babel({
          ignore: 'gulpfile.js'
      }))
      .pipe(gulp.dest('./dist2/es5-js'));
});

// Gulp task to minify JavaScript files
gulp.task('scripts', function() {
    return gulp.src('./dist2/es5-js/*.js')
      // Minify the file
      .pipe(uglify())
      // Output
      .pipe(gulp.dest('./dist2/js'))
});


// Gulp task to minify HTML files
gulp.task('pages', function() {
    return gulp.src(['*.html'])
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(gulp.dest('./dist2'));
});