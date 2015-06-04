gulp    = require 'gulp'
jshint  = require 'gulp-jshint'
plumber = require 'gulp-plumber'
config  = require './config'

gulp.task 'lint', ->
  gulp
  .src config.js.src
  .pipe plumber()
  .pipe jshint()
  .pipe jshint.reporter 'jshint-stylish'

