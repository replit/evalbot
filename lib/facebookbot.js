import Botkit from 'botkit'

export default (config) => Botkit.facebookbot(config)

const messageEvents = 'message_received'

export { messageEvents as facebookMessageEvents }
