const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const readdir = require('fs-readdir-promise');
const readFilePromise = require('fs-readfile-promise');
const Promise = require('bluebird');
const pfs = Promise.promisifyAll(fs);


var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, data) => {
    fs.writeFile(path.join(exports.dataDir, `${data}.txt`), text, (err) => {
      if (err) {
        callback(new Error('No item with id'));
      } else {
        callback(null, {
          id: data,
          text: text
        });
      }
    });
  });
};

exports.readAll = (callback) => {
  return pfs.readdirAsync(exports.dataDir)
    .then((files) => {
      var todos = files.map((file) => {
        var id = file.slice(0, 5);
        return pfs.readFileAsync(path.join(exports.dataDir, file), 'utf8')
          .then((text) => {
            return {id, text};
          });
      });
      Promise.all(todos).then((todos) => {
        callback(null, todos);
      });
    })
    .catch((err) => {
      callback(err);
    });
  // readdir(exports.dataDir)
  //   .then((files) => {
  //     var todos = files.map((file) => {
  //       console.log(file)
  //       var id = file.toString().slice(0, 5);
  //       console.log(id);
  //       (async () => {
  //         await readFilePromise(path.join(exports.dataDir, file), 'utf8')
  //         .then((text) => {
  //           return {
  //             id: id,
  //             text: text
  //           };
  //         });
  //       })()
  //     });
  //     Promise.all(todos).then((todos) => {
  //       callback(null, todos);
  //     });
  //   })
  //   .catch((err) => {
  //     callback(err);
  //   });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: data});
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, {
            id: id,
            text: text
          });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
        if (err) {
          throw err;
        } else {
          fs.readFile(path.join(__dirname, 'counter.txt'), (err, data) => {
            if (err) {
              throw err;
            } else {
              fs.writeFile(path.join(__dirname, 'counter.txt'), data - 1, (err) => {
                if (err) {
                  throw err;
                }
              });
            }
          });
          callback();
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};