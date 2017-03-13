import { App } from './app';
import { config, Environments } from './config/environment/index';
import { Logger } from './services/logger.service';
const http = require('http');

const app = new App();

app
  .run()
  .then(() => {
    Logger.warn('Server started', {
      port: config.port
    });
    if (config.env === Environments.Production) {
      setInterval(() => {
        Logger.log(
          'Send request to self to prevent Heroku free dyno from sleep', {});
        http.get('http://reading-list-backend.herokuapp.com');
      }, 25 * 60);
    }
  })
  .catch((error: Error) => {
    Logger.fatal(
      'Terminating app due to MongoDB initial connection fail',
      {error});
    return setTimeout(() => process.exit(-1), 1000);
  });
