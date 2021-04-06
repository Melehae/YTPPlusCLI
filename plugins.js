const fs = require('fs');
fs.readdirSync(__dirname + '/plugins/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
      exports[file] = require('./plugins/' + file);
  }
});
