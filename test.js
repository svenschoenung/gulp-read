'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;

var read = require('./index.js');
var fs = require('graceful-fs');
var vinylFs = require('vinyl-fs');
var through = require('through2').obj;
var isStream = require('isstream');
var concat = require('concat-stream');

describe('read()', function() {
  before(function() {
    fs.appendFileSync('test.txt', '\uFEFFabc123');
    fs.symlinkSync('test.txt', 'test.link');
  });
  after(function() {
    fs.unlink('test.link');
    fs.unlink('test.txt');
  });
  it('should not reread file contents', function(done) {
    var originalContents;
    vinylFs.src('test.txt')
      .pipe(through(function(file, enc, cb) {
        originalContents = file.contents;
        cb(null, file);
      }))
      .pipe(read())
      .pipe(through(function(file) {
        expect(file.contents).to.be.instanceOf(Buffer);
        expect(file.contents === originalContents).to.equal(true);
	done();
      }));
  });
  it('should reread file contents if force option is true', function(done) {
    var originalContents;
    vinylFs.src('test.txt')
      .pipe(through(function(file, enc, cb) {
        originalContents = file.contents;
        cb(null, file);
      }))
      .pipe(read({force:true}))
      .pipe(through(function(file) {
        expect(file.contents).to.be.instanceOf(Buffer);
        expect(file.contents.toString()).to.equal(originalContents.toString());
        expect(file.contents === originalContents).to.equal(false);
	done();
      }));
  });
  it('should not read file contents if file is directory', function(done) {
    vinylFs.src('.', { read:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read())
      .pipe(through(function(file) {
        expect(file.contents).to.equal(null);
	done();
      }));
  });
  it('should not read file contents if file is symlink', function(done) {
    vinylFs.src('test.link', { read:false, followSymlinks:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read())
      .pipe(through(function(file) {
        expect(file.contents).to.equal(null);
        expect(file.symlink).to.equal('test.txt');
	done();
      }));
  });
  it('should not read file contents if file is followed symlink', function(done) {
    vinylFs.src('test.link', { read:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read())
      .pipe(through(function(file) {
        expect(file.contents.toString()).to.equal('abc123');
	done();
      }));
  });
  it('should read file contents as buffer', function(done) {
    vinylFs.src('test.txt', { read:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read())
      .pipe(through(function(file) {
        expect(file.contents).to.be.instanceOf(Buffer);
        expect(file.contents.toString()).to.equal('abc123');
	done();
      }));
  });
  it('should support stripBOM option for buffers', function(done) {
    vinylFs.src('test.txt', { read:false})
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read({ stripBOM:false }))
      .pipe(through(function(file) {
        expect(file.contents).to.be.instanceOf(Buffer);
        expect(file.contents.toString()).to.equal('\uFEFFabc123');
	done();
      }));
  });
  it('should read file contents as stream', function(done) {
    vinylFs.src('test.txt', { read:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read({ buffer:false }))
      .pipe(through(function(file) {
        expect(isStream(file.contents)).to.equal(true);
	file.contents.pipe(concat(function(contents) {
          expect(contents.toString()).to.equal('abc123');
	  done();
	}));
      }));
  });
  it('should support stripBOM option for streams', function(done) {
    vinylFs.src('test.txt', { read:false })
      .pipe(through(function(file, enc, cb) {
        expect(file.contents).to.equal(null);
	cb(null, file);
      }))
      .pipe(read({ buffer:false, stripBOM:false }))
      .pipe(through(function(file) {
        expect(isStream(file.contents)).to.equal(true);
	file.contents.pipe(concat(function(contents) {
          expect(contents.toString()).to.equal('\uFEFFabc123');
	  done();
	}));
      }));
  });
});
