'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slackMessageEvents = undefined;

exports.default = function (config, firebaseOptions) {
  return _botkit2.default.slackbot({
    storage: (0, _storage2.default)(firebaseOptions),
    debug: process.env.NODE_ENV !== 'production'
  }).configureSlackApp(config);
};

var _botkit = require('botkit');

var _botkit2 = _interopRequireDefault(_botkit);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messageEvents = 'direct_message,direct_mention,mention';

exports.slackMessageEvents = messageEvents;