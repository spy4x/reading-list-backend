const gulp = require('gulp');
const nodemon = require('nodemon');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const mocha = require('gulp-mocha');
const spawnMocha = require('gulp-spawn-mocha');
const tslint = require('gulp-tslint');

const tsSrcPath = 'src/**/*.ts';
const compiledTestsPath = 'build/**/*.spec.js';


gulp.task('default', ['scripts'], runNodemonAndWatch);
gulp.task('compile-typescript', runTSCompiler);
gulp.task('scripts', ['compile-typescript']);

gulp.task('test', ['scripts'], getTestsTaskBodyForWatch);
gulp.task('test:validate', ['scripts'], getTestsTaskBodyForValidation);

gulp.task('build-and-validate', ['lint:validate', 'test:validate']);

gulp.task('lint', getTsLintTaskBody(false));
gulp.task('lint:validate', getTsLintTaskBody(true));

gulp.task('watch', ['lint', 'test'], () => {
  watch(tsSrcPath, () => {
    gulp.start('lint', 'test');
  });
});

gulp.task('pre-commit', ['build-and-validate']);

/// Implementation below ///

function runTSCompiler () {
  const tsProject = ts.createProject('tsconfig.json');
  const tsResult = gulp
    .src(tsSrcPath)
    .pipe(sourcemaps.init())
    .pipe(tsProject(ts.reporter.longReporter()));
  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
}

function runNodemonAndWatch () {
  return nodemon({
    script: 'build/index.js',
    ext: 'js',
    env: {
      PORT: process.env.PORT || 9000,
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    watch: 'build'
  });
}

function getTsLintTaskBody (emitError) {
  return () => {
    gulp
      .src(tsSrcPath)
      .pipe(tslint({
        formatter: 'codeFrame'
      }))
      .pipe(tslint.report({
        summarizeFailureOutput: true,
        emitError: emitError
      }));
  };
}

function getTestsTaskBodyForWatch () {
  return gulp
    .src(compiledTestsPath, {read: false})
    .pipe(spawnMocha({
      timeout: 200,
      R: 'progress',
      env: {'NODE_ENV': 'test'}
    }));
}


function getTestsTaskBodyForValidation () {
  process.env.NODE_ENV = 'test';
  return gulp
    .src(compiledTestsPath, {read: false})
    .pipe(mocha({
      reporter: 'spec',
      ui: 'bdd',
      timeout: 200
    }))
    .once('error', () => {
      process.exit(-1);
    })
    .once('end', () => {
      process.exit();
    });
}
