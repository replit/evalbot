import crypto from 'crypto'

export default (replitApiKey) => {
  const hmac = crypto.createHmac(
    'sha256',
    replitApiKey
  )

  const timeCreated = Date.now()
  hmac.update(timeCreated.toString())
  const msgMac = hmac.digest('base64')

  return {
    time_created: timeCreated,
    msg_mac: msgMac,
  }
}
