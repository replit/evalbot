import Botkit from 'botkit'
import storage from './storage'

export default function(config, firebaseOptions) {
  return Botkit.slackbot({
    storage: storage(firebaseOptions),
    debug: process.env.NODE_ENV !== 'production',
  }).configureSlackApp(config)
}
const messageEvents = 'direct_message,direct_mention,mention'

export { messageEvents as slackMessageEvents }
