var gulp = require('gulp')
var babel = require('babel-register')

let $ = require('gulp-load-plugins')()
let path = require('path')

const plugins = {
  babel: $.babel,
  mocha: $.mocha,
  sourcemaps: $.sourcemaps,
  eslint: $.eslint,
}

const paths = {
  src: ['src/**/*.js'],
  dist: 'dist',
  sourceRoot: path.join(__dirname, 'dist'),
}

gulp.task('clean', function () {
  return gulp.src(['.tmp', 'dist'], {read: false}).pipe($.clean())
})

gulp.task('test', function () {
  return gulp.src(['test/*.js'])
  .pipe(plugins.mocha({
    compilers: plugins.babel
  }))
})

gulp.task('dev', function () {
  return gulp.src(paths.src)
  .pipe(plugins.babel())
  .pipe(gulp.dest(paths.dist))
})

gulp.task('build', function () {
  gulp.start('lint')
  return gulp.src(paths.src)
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.babel())
  .pipe(plugins.sourcemaps.write('.', {sourceRoot: paths.sourceRoot}))
  .pipe(gulp.dest(paths.dist))
})

gulp.task('tdd', function () {
  return gulp.watch('test/*.js', ['test'])
})

gulp.task('watch', function () {
  gulp.start('clean')
  gulp.start('lint')
  gulp.start('build')
  gulp.watch(paths.src, ['lint', 'build'])
})

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', '!node_modules/**'])
  .pipe(plugins.eslint())
  .pipe(plugins.eslint.format())
  .pipe(plugins.eslint.failAfterError())
})

gulp.task('default', ['clean'], function () {
  gulp.start('build')
})

