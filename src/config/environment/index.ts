import path = require('path');
import * as _ from 'lodash';
import { Logger } from '../../services/logger.service';
import { developmentConfig } from './development.config';
import { productionConfig } from './production.config';
import { testConfig } from './test.config';

export type EnvironmentString = 'development' | 'test' | 'production';

export const Environments = {
  Development: 'development' as EnvironmentString,
  Test: 'test' as EnvironmentString,
  Production: 'production' as EnvironmentString
};
let env: EnvironmentString;
switch (process.env.NODE_ENV) {
  case Environments.Development:
    env = Environments.Development;
    break;
  case Environments.Test:
    env = Environments.Test;
    break;
  case Environments.Production:
    env = Environments.Production;
    break;
  default:
    Logger.fatal(`NODE_ENV should be "development" OR "test" OR "production".
    It is "${process.env.NODE_ENV}".
    Terminating app.`);
    process.exit(-1);
    env = Environments.Development; // TypeSafety hack
}
const configVar: any = {
  env: env,
  root: path.normalize(__dirname + '/../../..'), // Root path of server
  port: process.env.PORT || 9000,
  ip: process.env.IP || 'localhost',
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

export const config = _.merge(
  {}, configVar, envConfig, require('../secrets.config.js'));
