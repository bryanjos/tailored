const gulp = require('gulp');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-rollup');
const rename = require("gulp-rename");
const del = require('del');

const testPath = './test/**/*.spec.js';
const libPath = './src/**/*.js';
const buildPath = './build/**/*.js';

const babelConfig = {
  "plugins": [
    "transform-es2015-classes",
    "transform-es2015-destructuring",
    "transform-es2015-modules-commonjs",
    "transform-es2015-object-super",
    "transform-es2015-parameters",
    "transform-es2015-shorthand-properties",
    "transform-es2015-spread",
    "transform-es2015-unicode-regex",
    "transform-flow-strip-types",
    "syntax-flow"
  ]
}

gulp.task('remove_flow', function() {
  return gulp.src([libPath])
      .pipe(babel({
        sourceMaps: false,
        presets: ["react"]
      }))
      .pipe(gulp.dest('./build'));
});

gulp.task('rollup', ['remove_flow'], function() {
  return gulp.src('./build/index.js', {read: false})
      .pipe(rollup())
      .pipe(gulp.dest('./lib'));
});

gulp.task('babel', ['rollup'], function() {
  return gulp.src('./lib/index.js')
      .pipe(sourcemaps.init())
      .pipe(babel(babelConfig))
      .pipe(sourcemaps.write())
      .pipe(rename("tailored.js"))
      .pipe(gulp.dest('./lib'));
});


gulp.task('build', ['babel'], function() {
  return del.sync(['./build', './lib/index.js']);
});

gulp.task('build_test', function() {
  return gulp.src([testPath])
      .pipe(sourcemaps.init())
      .pipe(babel(babelConfig))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./test_build'));
});

gulp.task('lint', function () {
  return gulp.src([libPath, testPath])
      .pipe(eslint())
      .pipe(eslint.format())
});

gulp.task('test', ['lint', 'build', 'build_test'], function () {
  return gulp.src('./test_build/**/*.spec.js')
    .pipe(mocha({reporter: 'nyan'}));
});
