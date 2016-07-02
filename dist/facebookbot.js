'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.facebookMessageEvents = undefined;

var _botkit = require('botkit');

var _botkit2 = _interopRequireDefault(_botkit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {
  return _botkit2.default.facebookbot(config);
};

var messageEvents = 'message_received';

exports.facebookMessageEvents = messageEvents;