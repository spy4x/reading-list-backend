import { Request } from 'express';
import * as _ from 'lodash';
import { User } from '../api/user/user.model';
import { config, Environments } from '../config/environment/index';
const Raven = require('raven');

export class Logger {

  static init () {
    Raven.config(config.sentryDSN).install();
  }

  static log (message: string, params?: any, req?: Request) {
    Logger.captureMessage('log', message, params, req);
  }

  static debug (message: string, params?: any, req?: Request) {
    Logger.captureMessage('debug', message, params, req);
  }

  static info (message: string, params?: any, req?: Request) {
    Logger.captureMessage('info', message, params, req);
  }

  static warn (message: string, params?: any, req?: Request) {
    Logger.captureMessage('warning', message, params, req);
  }

  static error (message: string, params?: any, req?: Request) {
    Logger.captureMessage('error', message, params, req);
  }

  static fatal (message: string, params?: any, req?: Request) {
    Logger.captureMessage('fatal', message, params, req);
  }

  static setUser (user?: User) {
    if (!user) {
      return Raven.setContext({user: undefined});
    }
    Raven.setContext({
      user: {
        id: user._id,
        username: user.name,
        email: user.email
      }
    });
  }

  /** Ensures asynchronous exceptions are routed to the errorHandler.
   * This should be the **first** item listed in middleware.
   */
  static requestHandler = Raven.requestHandler();
  /** Error handler. This should be the last item listed in middleware,
   * but before any other error handlers.
   */
  static errorHandler = Raven.errorHandler();

  private static captureMessage (level: string,
                                 message: string,
                                 params?: any,
                                 req?: Request) {
    params = _.cloneDeep(params) || {};
    params.env = process.env.NODE_ENV;
    if (req) {
      params.ip = req.connection && req.connection.remoteAddress;
      params.user = req.user && {
          _id: req.user._id,
          email: req.user.email
        };
      params.endpoint = `${req.method} ${req.originalUrl}`;
      params.params = req.params;
      params.body = req.body;
      Logger.setUser(req.user);
    }
    if (config.env === Environments.Production &&
      _.includes(['warning', 'error', 'fatal'], level)) {
      Raven.captureMessage(message, {
        extra: params,
        level: level
      });
    }

    params = _.omitBy(params, _.isUndefined);

    Logger.logToConsole(level, message, params);
  }

  private static logToConsole (level: string, message: string, params?: any) {
    const timestamp = new Date().toISOString();
    let logMessage = `\n[${timestamp}] ${_.capitalize(level)}: ${message}\n`;

    if (params) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          logMessage += `${key}: ${Logger.toString(params[key])}\n`;
        }
      }
    }

    switch (level) {
      case 'log':
        console.log(logMessage);
        break;
      case 'debug':
        console.log(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warning':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      case 'fatal':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
        break;
    }
  }

  private static toString (obj: any) {
    if (typeof obj !== 'string') {
      obj = JSON.stringify(obj, undefined, 2);
    }

    return obj;
  }
}
