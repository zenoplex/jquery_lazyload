gulp        = require 'gulp'
browsersync = require 'browser-sync'
config      = require './config'

gulp.task 'serve', ->
  browsersync
    server:
      baseDir: config.dist
