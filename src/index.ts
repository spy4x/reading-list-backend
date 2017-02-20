import { App } from './app';
import { config } from './config/environment/index';
import { Logger } from './services/logger.service';

const app = new App();

app
  .run()
  .then(() => {
    Logger.warn('Server started', {
      port: config.port
    });
  })
  .catch((error: Error) => {
    Logger.fatal(
      'Terminating app due to MongoDB initial connection fail',
      {error});
    return setTimeout(() => process.exit(-1), 1000);
  });
