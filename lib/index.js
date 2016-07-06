import { handleEval, handleLanguages } from './messageHandlers'
import getSlackContainer, { slackMessageEvents } from './slackbot'
import getFacebookContainer, { facebookMessageEvents } from './facebookbot'
import googl from 'goo.gl'

export function start(platform, platformConfig, serverOptions, firebaseOptions) {
  // Google Api Key for shortening urls (see messagneHandlers.js)
  googl.setKey(serverOptions.googleApiKey)

  let controller
  let messageEvents
  if (platform === 'slack') {
    controller = getSlackContainer(platformConfig, firebaseOptions)
    messageEvents = slackMessageEvents
  } else if (platform === 'facebook') {
    controller = getFacebookContainer(platformConfig)
    messageEvents = facebookMessageEvents
  } else {
    throw new Error(`platform ${platform} not supported`)
  }

  controller.setupWebserver(serverOptions.port, (err, webserver) => {
    if (err) {
      console.error('Failed to start server')
      console.error(err.message)
      console.error(err.stack)
      process.exit()
    }
    if (platform === 'slack') {
      controller.createWebhookEndpoints(controller.webserver)
      // Oauth redirect uri for slack
      controller.createOauthEndpoints(controller.webserver, (err, req, res) => {
        if (err) {
          res.status(500).send('ERROR: ' + err)
          return
        }

        res.redirect('https://repl.it/site/evalbot')
      })
      // Slack creates a bot for each team.
      // Make sure we connect only once for each team
      const bots = {}
      function trackBot(bot) {
        bots[bot.config.token] = bot
      }

      // Respawns bots incase of server restart
      controller.storage.teams.all((err, teams) => {
        if (err) {
          throw err
        }

        teams.map(({ token }) => {
          controller.spawn({ token }).startRTM()
        })
      })

      controller.on('create_bot', (bot, config) => {
        if (bots[bot.config.token]) {
          // already online
          return
        }

        bot.startRTM((err) => {
          if (!err) {
            trackBot(bot)
          }

          // Send a message to person who added the bot
          bot.startPrivateConversation(
            {user: config.createdBy},
            (err, convo) => {
              if (err) {
                console.log(err)
                return
              }
              convo.say('I am a bot that has just joined your team')
              convo.say('You must now /invite me to a channel so that I can be of use!')
            }
          )
        })
      })
    } else if (platform === 'facebook') {
      const bot = controller.spawn({})
      controller.createWebhookEndpoints(
        controller.webserver,
        bot,
        () => {
          if (process.env.NODE_ENV !== 'production') {
            const localtunnel = require('localtunnel')
            const tunnel = localtunnel(serverOptions.port, (err, tunnel) => {
              if (err) {
                  console.log(err)
                  process.exit()
              }
              console.log('Your bot is available on the web at the following URL: ' + tunnel.url + '/facebook/receive')
            })
            tunnel.on('close', function() {
              console.log('Your bot is no longer available on the web at the localtunnnel.me URL.')
              process.exit()
            })
          }
          console.log('fb bot started')
        }
      )
    }
  })

  controller.hears(
    'hello',
    messageEvents,
    (bot, message) => bot.reply(message, 'Hello!')
  )

  controller.hears(
    ['evaluate', 'eval', 'run', 'compile', '^```(.+)'],
    messageEvents,
    (bot, message) => handleEval(bot, message, serverOptions.replitApiKey)
  )

  controller.hears(
    ['langs', 'languages', 'supported languages'],
    messageEvents,
    handleLanguages
  )

  controller.hears(
    'help',
    messageEvents,
    (bot, message) => bot.reply(message, 'Help page: https://repl.it/site/evalbot')
  )
}
