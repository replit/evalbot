import { handleEval, handleLanguages } from './messageHandlers'
import getSlackContainer, { slackMessageEvents } from './slackbot'
import getFacebookContainer, { facebookMessageEvents } from './facebookbot'

export function start(platform, platformConfig, serverOptions, firebaseOptions) {
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
    if (platform === 'slack') {
      controller.createWebhookEndpoints(controller.webserver)
      // Oauth redirect uri for slack
      controller.createOauthEndpoints(controller.webserver, (err, req, res) => {
        if (err) {
          res.status(500).send('ERROR: ' + err)
          return;
        }

        res.send('Success!')
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
        () => console.log('fb bot started')
      )
    }
  })

  controller.hears(
    'hello',
    messageEvents,
    (bot,message) => bot.reply(message, 'Hello!')
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
}
