'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.handleEval = handleEval;
exports.handleLanguages = handleLanguages;

var _replitClient = require('replit-client');

var _replitClient2 = _interopRequireDefault(_replitClient);

var _xmlhttprequest = require('xmlhttprequest');

var _languages = require('./languages');

var _gentoken = require('./gentoken');

var _gentoken2 = _interopRequireDefault(_gentoken);

var _goo = require('goo.gl');

var _goo2 = _interopRequireDefault(_goo);

var _entities = require('entities');

var _entities2 = _interopRequireDefault(_entities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.XMLHttpRequest = _xmlhttprequest.XMLHttpRequest; // used for replit-client


var maxMsgChunkLength = 300;

function handleEval(bot, message, replitApiKey) {
  var langKey = void 0;
  var askLanguage = function askLanguage(response, convo) {
    convo.ask('What language should I use?', function (response, convo) {
      if (response.text === 'stop') {
        convo.say('Ok, sorry ');
        convo.stop();
      }

      if (response.text === 'languages') {
        convo.say((0, _languages.getSupportedLanguages)());
        askLanguage(response, convo);
        convo.next();
        return;
      }

      langKey = (0, _languages.getLanguageKey)(response.text);
      if (!langKey) {
        convo.say('I\'m sorry, looks like you mistyped the language ' + 'or it\'s not supported, please try again. \n' + 'If you want to see a list of supported languages, ' + 'say `languages`');
        askLanguage(response, convo);
        convo.next();
        return;
      }

      askCode(response, convo);
      convo.next();
    });
  };
  var askCode = function askCode(response, convo) {
    convo.ask('Type in code to eval', function (response, convo) {
      var code = formatCode(response.text);
      replitEval(replitApiKey, langKey, code).then(function (result) {
        handleSendResult(langKey, code, result, convo.say.bind(convo), convo.next.bind(convo));
      });
    });
  };

  var heardCommand = message.match[0];
  if (heardCommand === message.text) {
    /**
    * The heard value is equal to sent text, we can
    * safetly assume that the message doesn't contain
    * language or code info. Initiate conversation
    **/
    bot.startConversation(message, askLanguage);
  } else if ((0, _languages.getLanguageKey)(message.match[1])) {
    (function () {
      var langKey = (0, _languages.getLanguageKey)(message.match[1]);
      var code = formatCode(message.text);
      replitEval(replitApiKey, langKey, code).then(function (result) {
        return handleSendResult(langKey, code, result, bot.reply.bind(bot, message));
      });
    })();
  } else {
    var _ret2 = function () {
      var _message$text$split = message.text.split(' ');

      var _message$text$split2 = _slicedToArray(_message$text$split, 3);

      var language = _message$text$split2[1];
      var version = _message$text$split2[2];

      if (!Number.isFinite(+version)) {
        // versions can only be finite numbers (python3/c++11)
        version = '';
      }
      var langKey = (0, _languages.getLanguageKey)(language + version);
      var code = formatCode(message.text.substring(message.text.indexOf('```'), message.text.lastIndexOf('```') + 3));
      if (!langKey || !code) {
        bot.reply(message, 'The language you asked for or the format is not correct.\n' + 'Your message should look like: \n' + '```@evalbot run language `​``code`​`````\n' + 'You can type `@evalbot languages` to get a list of supported languages');
        return {
          v: void 0
        };
      }

      replitEval(replitApiKey, langKey, code).then(function (result) {
        return handleSendResult(langKey, code, result, bot.reply.bind(bot, message));
      });
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
  }
}

function handleLanguages(bot, message) {
  bot.reply(message, (0, _languages.getSupportedLanguages)());
}

function formatCode(code) {
  // replace fences and language
  var formatted = code.replace(/(^```(\w+)?)|(```$)/g, '');

  // decode xml entities
  formatted = _entities2.default.decodeXML(formatted);
  return formatted;
}

function replitEval(apiKey, language, code) {
  var repl = new _replitClient2.default('api.repl.it', '80', language, (0, _gentoken2.default)(apiKey));

  var messages = '';
  return repl.evaluateOnce(code, {
    stdout: function stdout(msg) {
      messages += ' ' + msg;
    }
  }).then(function (_ref) {
    var error = _ref.error;
    var data = _ref.data;
    return messages + '\n' + (error || '=> ' + data);
  });
}

function getSessionShortUrl(language, code) {
  return _goo2.default.shorten('https://repl.it/languages/' + language + '?code=' + encodeURIComponent(code));
}

function handleSendResult(language, code, codeResult, sayCommand, done) {
  getSessionShortUrl(language, code).then(function (url) {
    var urlMsg = 'Follow this link to run and edit the ' + 'code  in an interactive environment: ' + url.replace('https://', ''); // Avoid slack preview

    if ((codeResult + urlMsg).length < maxMsgChunkLength) {
      sayCommand('```\n' + codeResult + '\n```\n' + urlMsg);
      done && done();
      return;
    }

    handleSayLongResult(codeResult, sayCommand);
    sayCommand(urlMsg);
    done && done();
  });
}

function handleSayLongResult(message, sayCommand) {
  if (!message || message === '\n') {
    return;
  }

  var partLength = message.lastIndexOf('\n', maxMsgChunkLength);
  if (message.length <= maxMsgChunkLength || partLength === -1 || partLength === 0) {
    partLength = maxMsgChunkLength;
  }
  var messagePart = message.substr(0, partLength);
  sayCommand('```\n' + messagePart + '\n```\n');

  handleSayLongResult(message.substr(partLength), sayCommand);
}