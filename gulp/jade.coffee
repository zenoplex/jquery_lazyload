gulp        = require 'gulp'
jade        = require 'gulp-jade'
browsersync = require 'browser-sync'
data        = require 'gulp-data'
path        = require 'path'
plumber     = require 'gulp-plumber'
config      = require './config'
jsonData    = require config.html.data

gulp.task '_jade', ->
  gulp
  .src config.html.src
  .pipe plumber()
  .pipe data (file) ->
    parsed = path.parse file.relative

    #階層を . シンタックスに変換
    str = parsed.dir.split('/').join('.')
    str = if str then (str + '.' + parsed.name) else parsed.name;

    #a.b.c みたいな文字列でオブジェクトにアクセスして該当データを取得
    d = str.split('.').reduce(index, jsonData)

    return { data: d ? d : {} }

  .pipe jade
    compileDebug: true
  .pipe gulp.dest config.html.dest


gulp.task 'jade', ['_jade'], ->
  browsersync.reload()


index = (obj, i) ->
  obj[i]
