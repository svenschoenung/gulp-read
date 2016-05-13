[![npm Version](https://img.shields.io/npm/v/gulp-read.svg)](https://www.npmjs.com/package/gulp-read)
[![Build Status](https://travis-ci.org/svenschoenung/gulp-read.svg?branch=master)](https://travis-ci.org/svenschoenung/gulp-read)
[![Coverage Status](https://coveralls.io/repos/github/svenschoenung/gulp-read/badge.svg?branch=master)](https://coveralls.io/github/svenschoenung/gulp-read?branch=master)
[![Dependency Status](https://david-dm.org/svenschoenung/gulp-read.svg)](https://david-dm.org/svenschoenung/gulp-read)
[![devDependency Status](https://david-dm.org/svenschoenung/gulp-read/dev-status.svg)](https://david-dm.org/svenschoenung/gulp-read#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/svenschoenung/gulp-read/badges/gpa.svg)](https://codeclimate.com/github/svenschoenung/gulp-read)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/)](https://www.codacy.com/app/svenschoenung/gulp-read)

# gulp-read

Gulp plugin to read vinyl file contents.

## Installation

    npm install --save-dev gulp-read

## Usage

Basically whenever you can get away with using `read:false` at the beginning of your stream, but you still need to the file contents at a later stage you should consider using `gulp-read`. Here's what a typical example might look like:

```js
var gulp = require('gulp');
var changed = require('gulp-changed');
var read = require('gulp-read');
var imagemin = require('gulp-imagemin');
var remember = require('gulp-remember');

gulp.task('image', function() {
  return gulp.src('images/**', {read:false})
    .pipe(changed('dist/images'))
    .pipe(read())
    .pipe(imagemin())
    .pipe(remember())
    .pipe(gulp.dest('dist/images'));
});
```

In the above we don't have to read file contents initially since all [`gulp-changed`](https://www.npmjs.com/package/gulp-changed) cares about is the last modification date of each file.

After the unchanged files have been removed from the stream the contents of the remaining files are then read by `gulp-read` so they can be processed by [`gulp-imagemin`](https://www.npmjs.com/package/gulp-imagemin). 

In effect we never have to read the contents of files that haven't changed which saves time and speeds up the build.

## Compatibiliy

Since this plugin is basically identical to the [`get-contents` module](https://github.com/gulpjs/vinyl-fs/blob/5cf7de1df6fc47886aaa72c1737490069e50ab3b/lib/src/get-contents/index.js) of `[vinyl-fs`](https://www.npmjs.com/package/vinyl-fs) it shouldn't make difference whether file contents are read by `gulp.src()` or `gulp-read`.

## License

[MIT](LICENSE)
