gulp   = require 'gulp'
jshint = require 'gulp-jshint'
config = require './config'

gulp.task 'lint', ->
  gulp
  .src config.js.src
  .pipe jshint()
  .pipe jshint.reporter 'jshint-stylish'

