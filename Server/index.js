require('babel-register')({
  plugins: ['transform-async-to-generator']
});
require("babel-core/register");
require("babel-polyfill");
require('./src/app.js');