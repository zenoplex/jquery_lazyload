dist = './dist'

module.exports =
  dist: dist
  js:
    src: './src/js/**/*.js'
    dest: dist
  html:
    data: '../src/jade/data'
    all: './src/jade/**/*.jade'
    src: './src/jade/pages/*.jade'
    dest: './demo'
