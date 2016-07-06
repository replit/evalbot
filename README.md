# evalbot
## Installation
```
npm install --save evalbot
```

## Getting started
You need a repl.it API to use this bot, you can [get a free trial here](https://repl.it/site/api).

For usage with facebook, [create a facebook app](https://developers.facebook.com/apps),
then [follow these steps configure it](https://developers.facebook.com/docs/messenger-platform/product-overview)

For usage with slack, simply [create a slack app](https://api.slack.com/apps/new), and 
add a bot user to your app. Then [create a firebase app](https://console.firebase.google.com/).

You also need a google API for googl URL shortener.

### Facebook
```javascript
const evalbot = require('evalbot')

evalbot.start('facebook', {
  access_token: FB_ACCESS_TOKEN,
  verify_token: FB_VERIFY TOKEN,
}, {
  port: PORT,
  replitApiKey: REPLIT_API_KEY,
  googleApiKey: GOOGLE_API_KEY,
})
```

### Slack
```javascript
const evalbot = require('evalbot')

evalbot.start('slack', {
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET,
  redirectUri: SLACK_OAUTH_REDIRECT_URI,
  scopes: ['bot'],
}, {
  port: PORT,
  replitApiKey: REPLIT_API_KEY,
  googleApiKey: GOOGLE_API_KEY,
}, {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_API_KEY,
  databaseURL: FIREBASE_DATABASE_URL,
  storageBucket: FIREBASE_STORAGE_BUCKET,
})

```

Questions, suggestions, issues, and any form of contribution welcome.
