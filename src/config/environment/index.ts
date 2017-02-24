import path = require('path');
import * as _ from 'lodash';
import { Logger } from '../../services/logger.service';
import { developmentConfig } from './development.config';
import { productionConfig } from './production.config';
import { testConfig } from './test.config';
const secrets = require('../secrets');


export type EnvironmentString = 'development' | 'test' | 'production';

export const Environments = {
  Development: 'development' as EnvironmentString,
  Test: 'test' as EnvironmentString,
  Production: 'production' as EnvironmentString
};

let nodeEnv: EnvironmentString;
const env = process.env;
switch (env.NODE_ENV) {
  case Environments.Development:
    nodeEnv = Environments.Development;
    break;
  case Environments.Test:
    nodeEnv = Environments.Test;
    break;
  case Environments.Production:
    nodeEnv = Environments.Production;
    break;
  default:
    Logger.fatal(`NODE_ENV should be "development" OR "test" OR "production".
    It is "${env.NODE_ENV}".
    Terminating app.`);
    process.exit(-1);
    nodeEnv = Environments.Development; // TypeSafety hack
}

const configVar: any = {
  env: nodeEnv,
  root: path.normalize(__dirname + '/../../..'), // Root path of server
  port: env.PORT || 9000,
  ip: env.IP || 'localhost',
  mongo: {
    options: {
      db: {
        safe: true
      },
      server: {reconnectTries: Number.MAX_VALUE}
    },
    debug: false
  },
  auth: {
    google: {
      clientID: '<placeholder>',
      clientSecret: '<placeholder>',
      callbackURL: '/auth/google/callback'
    },
    secret: '<placeholder>'
  },
  urls: {
    frontend: 'http://localhost:4200'
  }
};

let envConfig: any;
switch (configVar.env) {
  case 'development':
    envConfig = developmentConfig;
    break;
  case 'test':
    envConfig = testConfig;
    break;
  case 'production':
    envConfig = productionConfig;
    break;
  default:
    throw new Error(`Environment ${configVar.env} is not supported`);
}

const mergedConfig = _.merge({}, configVar, envConfig);

switch (nodeEnv) {
  case Environments.Development:
    break;
  case Environments.Production:
    mergedConfig.mongo.uri =
      env.RL_MONGO_URI_PRODUCTION ||
      secrets.mongo.uri.production ||
      mergedConfig.mongo.uri;
    break;
  case Environments.Test:
    mergedConfig.mongo.uri =
      env.RL_MONGO_URI_TEST ||
      secrets.mongo.uri.test ||
      mergedConfig.mongo.uri;
    break;
  default:
    break;
}

mergedConfig.auth.google.clientID =
  env.RL_GOOGLE_OAUTH_CLIENTID ||
  secrets.auth.google.clientID ||
  mergedConfig.auth.google.clientID;

mergedConfig.auth.google.clientSecret =
  env.RL_GOOGLE_OAUTH_CLIENTSECRET ||
  secrets.auth.google.clientSecret ||
  mergedConfig.auth.google.clientSecret;

mergedConfig.auth.secret =
  env.RL_AUTH_SECRET ||
  secrets.auth.secret ||
  mergedConfig.auth.secret;

mergedConfig.sentryDSN =
  env.RL_SENTRY_DSN ||
  secrets.sentryDSN ||
  mergedConfig.sentryDSN;

mergedConfig.urls.frontend =
  env.RL_URLS_FRONTEND ||
  secrets.urls.frontend ||
  mergedConfig.urls.frontend;


export const config = mergedConfig;
