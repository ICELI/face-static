define("anima-yocto/1.1.0/index-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug", "anima-yocto-ajax/1.0.1/index-debug", "anima-yocto-touch/1.0.1/index-debug"], function(require, exports, module) {
  // Thanks to zepto.js core: https://github.com/madrobby/zepto/blob/master/src/zepto.js
  // Zepto.js
  // (c) 2010-2014 Thomas Fuchs
  // Zepto.js may be freely distributed under the MIT license.
  var $ = require("anima-yocto-core/1.1.0/index-debug");
  require("anima-yocto-event/1.0.1/index-debug");
  require("anima-yocto-ajax/1.0.1/index-debug");
  require("anima-yocto-touch/1.0.1/index-debug");
  module.exports = $;
});