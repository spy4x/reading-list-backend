import { Request, Response } from 'express';
import * as _ from 'lodash';
import { ErrorHelper } from './errors.helper';
import { Logger } from './logger.service';

export class HTTPHelper {
  static clearError (error: any): any {
    const errorClone = _.cloneDeep(error);
    delete(errorClone.stack);
    if (ErrorHelper.Type.Validation === errorClone.name) {
      for (const key in errorClone.errors) {
        if (errorClone.errors.hasOwnProperty(key)) {
          delete(errorClone.errors[key].stack);
        }
      }
    }
    return errorClone;
  }

  static handleError (error: Error,
                      errorTitle: string,
                      req: Request,
                      res: Response) {
    switch (error.name) {
      case ErrorHelper.Type.Validation:
      case ErrorHelper.Type.Cast:
        return res.status(400).json(this.clearError(error));
      default:
        Logger.error(
          errorTitle,
          {error},
          req);
        return res.sendStatus(500);
    }
  }

  static handle404 (req: Request, res: Response, message: string): void {
    res.status(404).json({
      name: ErrorHelper.Type.NotFound,
      message
    });
  }
}

