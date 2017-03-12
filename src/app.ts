import * as express from 'express';
import * as http from 'http';
import * as Mongoose from 'mongoose';
import * as Q from 'q';
import { ItemRouter } from './api/item/item.router';
import { TagRouter } from './api/tag/tag.router';
import { UserRouter } from './api/user/user.router';
import { AuthRouter } from './auth/auth.router';
import { config, Environments } from './config/environment';
import { ErrorHelper } from './services/errors.helper';
import { Logger } from './services/logger.service';
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const errorHandler = require('errorhandler');
const methodOverride = require('method-override');
const morgan = require('morgan');
const passport = require('passport');

export class App {
  public app: express.Application;

  constructor () {
    Logger.init();
    Logger.warn('Start server with config:', {config});
    ErrorHelper.init();
    this.app = express();
    this.initMongoose();
    this.initExpress();
    this.initRoutes();
    this.initErrorHandler();
  }

  public run (): Q.Promise<{}> {
    const defer = Q.defer();

    Mongoose.connect(config.mongo.uri, config.mongo.options, (error: Error) => {
      if (error) {
        return defer.reject(error);
      }

      const server: http.Server = http.createServer(this.app);
      server.listen(config.port, config.ip, () => {
        defer.resolve();
      });
    });

    return defer.promise;
  }

  private initExpress () {
    this.app.use(Logger.requestHandler); // Have to be first middleware
    this.app.use(compression());
    this.app.use(bodyParser.json({limit: '5mb'}));
    this.app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
    this.app.use(methodOverride());
    this.app.use(passport.initialize());
    this.app.use(cors());

    if (config.env !== Environments.Test) {
      this.app.use(morgan('dev'));
      this.app.use(App.requestLogger);
    }
  }

  private initErrorHandler () {
    // Have to be last middleware, but before any other error handlers
    this.app.use(Logger.errorHandler);
    this.app.use(errorHandler({log: App.errorNotification}));
  }

  private initRoutes () {
    this.app
      .use('/auth', AuthRouter)
      .use('/users', UserRouter)
      .use('/tags', TagRouter)
      .use('/items', ItemRouter);
  }

  private initMongoose () {
    (Mongoose as any).Promise = Q.Promise;
    Mongoose.set('debug', config.mongo.debug);

    Mongoose.connection.on('reconnected', () => {
      Logger.warn('MongoDB reconnected!');
    });
    Mongoose.connection.on('disconnected', () => {
      Logger.error('MongoDB disconnected!');
    });
  }

  private static errorNotification (error: Error,
                                    message: string,
                                    req: express.Request) {
    Logger.error(`Error in ${req.method} ${req.url}`, {error, message}, req);
  }

  private static requestLogger (req: express.Request,
                                res: express.Response,
                                next: Function) {
    Logger.debug('Request', {}, req);
    next();
  }
}
