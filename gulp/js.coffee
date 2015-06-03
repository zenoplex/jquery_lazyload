config = require './config'
gulp = require 'gulp'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
header = require 'gulp-header'
browsersync = require 'browser-sync'
pkg = require '../package'
banner = [
  '/*!'
  '<%= pkg.name %> - <%= pkg.version %>'
  '<%= pkg.license %>'
  'Copyright 2010-2013 <%= pkg.author %>'
  '*/'
].join ' '

gulp.task 'js', ->
  gulp.src config.js.src
  .pipe uglify()
  .pipe header banner, pkg : pkg
  .pipe rename
    extname: '.min.js'
  .pipe gulp.dest config.js.dest
  .pipe browsersync.reload
    stream: true