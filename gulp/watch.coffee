gulp   = require 'gulp'
config = require './config'

gulp.task 'watch', ['jade', 'js', 'serve'], ->
  gulp.watch config.html.all, ['jade']
  gulp.watch config.js.src, ['js']

