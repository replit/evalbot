import ReplitClient from 'replit-client'
import { XMLHttpRequest } from 'xmlhttprequest'
global.XMLHttpRequest = XMLHttpRequest // used for replit-client
import { getLanguageKey, getSupportedLanguages } from './languages'
import genToken from './gentoken'
import googl from 'goo.gl'
import entities from 'entities'

const maxMsgChunkLength = 300

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
      const code = formatCode(response.text)
      replitEval(replitApiKey, langKey, code).then(
        result => {
          handleSendResult(
            langKey,
            code,
            result,
            convo.say.bind(convo),
            convo.next.bind(convo)
          )
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
    const langKey = getLanguageKey(message.match[1])
    const code = formatCode(message.text)
    replitEval(replitApiKey, langKey, code).then(
      result => handleSendResult(
                  langKey,
                  code,
                  result,
                  bot.reply.bind(bot, message)
                )
    )
  } else {
    let [, language, version] = message.text.split(' ')
    if (!Number.isFinite(+version)) {
      // versions can only be finite numbers (python3/c++11)
      version = ''
    }
    const langKey = getLanguageKey(language + version)
    const code = formatCode(message.text.substring(
      message.text.indexOf('```'),
      message.text.lastIndexOf('```') + 3
    ))
    if (!langKey || !code) {
      bot.reply(
        message,
        'The language you asked for or the format is not correct.\n' +
        'Your message should look like: \n' +
        '```@evalbot run language `\u200b``code`\u200b`````\n' +
        'You can type `@evalbot languages` to get a list of supported languages'
      )
      return
    }

    replitEval(replitApiKey, langKey, code).then(
      result => handleSendResult(
                  langKey,
                  code,
                  result,
                  bot.reply.bind(bot, message)
                )
    )
  }
}

export function handleLanguages(bot, message) {
  bot.reply(message, getSupportedLanguages())
}

function formatCode(code) {
  // replace fences and language
  let formatted = code.replace(/(^```(\w+)?)|(```$)/g, '')

  // decode xml entities
  formatted = entities.decodeXML(formatted)
  return formatted
}

function replitEval(apiKey, language, code) {
  const repl = new ReplitClient(
    'api.repl.it',
    '80',
    language,
    genToken(apiKey)
  )

  let messages = ''
  return repl.evaluateOnce(code, {
      stdout: (msg) => { messages += ' ' + msg },
    }).then(
      ({error, data}) => messages + '\n' + (error || '=> ' + data)
    )
}

function getSessionShortUrl(language, code) {
  return googl.shorten(
    `https://repl.it/languages/${language}?code=${encodeURIComponent(code)}`
  )
}

function handleSendResult(language, code, codeResult, sayCommand, done) {
  getSessionShortUrl(language, code).then(
    (url) => {
      const urlMsg = 'Follow this link to run and edit the ' +
                     'code  in an interactive environment: ' +
                      url.replace('https://', '') // Avoid slack preview

      if ((codeResult + urlMsg).length < maxMsgChunkLength) {
        sayCommand('```\n' + codeResult + '\n```\n' + urlMsg)
        done && done()
        return
      }

      handleSayLongResult(codeResult, sayCommand)
      sayCommand(urlMsg)
      done && done()
    }
  )
}

function handleSayLongResult(message, sayCommand) {
  if (!message || message === '\n') {
    return
  }

  let partLength = message.lastIndexOf('\n', maxMsgChunkLength)
  if (message.length <= maxMsgChunkLength ||
      partLength === -1 ||
      partLength === 0) {
    partLength = maxMsgChunkLength
  }
  const messagePart = message.substr(0, partLength)
  sayCommand('```\n' + messagePart + '\n```\n')

  handleSayLongResult(message.substr(partLength), sayCommand)
}
