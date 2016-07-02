import ReplitClient from 'replit-client'
import { XMLHttpRequest } from 'xmlhttprequest'
global.XMLHttpRequest = XMLHttpRequest // used for replit-client
import { getLanguageKey, getSupportedLanguages } from './languages'
import genToken from './gentoken'

export function handleEval(bot, message, replitApiKey) {
  let langKey
  const askLanguage = (response, convo) => {
    convo.ask('What language should I use?', (response, convo) => {
      if (response.text === 'stop') {
        convo.say('Ok, sorry ')
        convo.stop()
      }

      if (response.text === 'languages') {
        convo.say(getSupportedLanguages())
        askLanguage(response, convo)
        convo.next()
        return
      }

      langKey = getLanguageKey(response.text)
      if (!langKey) {
        convo.say('I\'m sorry, looks like you mistyped the language ' +
                  'or it\'s not supported, please try again. \n' +
                  'If you want to see a list of supported languages, ' +
                  'say `languages`')
        askLanguage(response, convo)
        convo.next()
        return
      }

      askCode(response, convo)
      convo.next()
    })
  }
  const askCode = (response, convo) => {
    convo.ask('Type in code to eval', (response, convo) => {
      replitEval(replitApiKey, langKey, removeCodeblocks(response.text)).then(
        out => {
          convo.say(out)
          convo.next()
        }
      )
    })
  }

  const heardCommand = message.match[0]
  if (heardCommand === message.text) {
    /**
    * The heard value is equal to sent text, we can
    * safetly assume that the message doesn't contain
    * language or code info. Initiate conversation
    **/
    bot.startConversation(message, askLanguage)
  } else if (getLanguageKey(message.match[1])) {
    const langKey = getLanguageKey(message.match[1]);
    const code = removeCodeblocks(message.text).slice(message.match[1].length + 1)
    console.log('code', code)
    replitEval(replitApiKey, langKey, code).then(
      out => bot.reply(message, out)
    )
  } else {
    let [, language, version] = message.text.split(' ')
    if (!Number.isFinite(+version)) {
      // versions can only be finite numbers (python3/c++11)
      version = ''
    }
    const langKey = getLanguageKey(language + version)
    if (!langKey) {
      bot.reply(
        message,
        'The language you asked for or the format is not right.\n' +
        'Your message should look like: ```@evalbot run language ```code``````\n' +
        'You can type `@evalbot languages` to get a list of supported languages'
      )
      return
    }

    const code = message.text.substring(
      message.text.indexOf('```') + 3,
      message.text.lastIndexOf('```')
    )
    replitEval(replitApiKey, langKey, removeCodeblocks(code)).then(
      out => bot.reply(message, out)
    )
  }
}

export function handleLanguages(bot, message) {
  bot.reply(message, getSupportedLanguages())
}

function removeCodeblocks(code) {
  return code.replace(/(^```)|(```$)/g, '')
}

function replitEval(apiKey, language, code) {
  const repl = new ReplitClient(
    'api.repl.it',
    '80',
    language,
    genToken(apiKey)
  );

  let messages = ''
  return repl.evaluateOnce(removeCodeblocks(code), {
      stdout: (msg) => messages += ' ' + msg,
    }).then(
      ({error, data}) => '```\n' + messages + '\n' + (error || '=>' + data) + '\n```'
    ) 
}