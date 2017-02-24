const fs = require('fs');


const env = process.env;
const secrets = {
  mongo: {
    uri: {
      production: env.RL_MONGO_URI_PRODUCTION,
      test: env.RL_MONGO_URI_TEST
    }
  },
  auth: {
    google: {
      clientID: env.RL_GOOGLE_OAUTH_CLIENTID,
      clientSecret: env.RL_GOOGLE_OAUTH_CLIENTSECRET
    },
    secret: env.RL_AUTH_SECRET
  },
  sentryDSN: env.RL_SENTRY_DSN,
  urls: {
    frontend: env.RL_URLS_FRONTEND
  }
};

const filename = './build/config/secrets.json';
fs.writeFileSync(
  filename,
  JSON.stringify(secrets, undefined, 2)
);

console.log(`Secrets generated to ${filename} 
from exported environment variables`);
