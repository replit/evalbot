'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (replitApiKey) {
  var hmac = _crypto2.default.createHmac('sha256', replitApiKey);

  var timeCreated = Date.now();
  hmac.update(timeCreated.toString());
  var msgMac = hmac.digest('base64');

  return {
    time_created: timeCreated,
    msg_mac: msgMac
  };
};