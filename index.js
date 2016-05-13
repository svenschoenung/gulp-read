var through = require('through2').obj;
var fs = require('graceful-fs');
var lazystream = require('lazystream');
var stripBomFromBuffer = require('strip-bom');
var stripBomFromStream = require('strip-bom-stream');
var assign = require('object-assign');

function readSymlink(file, cb) {
  fs.readlink(file.path, function(err, target) {
    if (err) {
      return cb(err);
    }

    file.symlink = target;
    return cb(null, file);
  });
}

function readBuffer(file, options, cb) {
  fs.readFile(file.path, function(err, data) {
    if (err) {
      return cb(err);
    }

    if (options.stripBOM) {
      file.contents = stripBomFromBuffer(data);
    } else {
      file.contents = data;
    }

    cb(null, file);
  }); 
}

function readStream(file, options, cb) {
  var filePath = file.path;

  file.contents = new lazystream.Readable(function() {
    return fs.createReadStream(filePath);
  });

  if (options.stripBOM) {
    file.contents = file.contents.pipe(stripBomFromStream());
  }

  cb(null, file);
}

module.exports = function(opts) {
  var options = assign({
    force:false,
    buffer:true,
    stripBOM:true
  }, opts);

  return through(function(file, enc, cb) {
    if (!options.force && !file.isNull()) {
      return cb(null, file);
    }
  
    if (file.isDirectory()) {
      return cb(null, file);
    }
  
    if (file.stat && file.stat.isSymbolicLink()) {
      return readSymlink(file, cb);
    }

    if (options.buffer !== false) {
      return readBuffer(file, options, cb);
    }

    return readStream(file, options, cb);
  });
};
