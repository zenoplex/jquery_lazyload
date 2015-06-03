gulp   = require 'gulp'
config = require './config'

gulp.task 'watch', ['lint', 'serve'], ->
  gulp.watch config.html.src, ['jade']
  gulp.watch config.js.src, ['js']

