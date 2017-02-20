import { IRouter, Request, Response } from 'express';
import { UserModel } from '../api/user/user.model';
import { config } from '../config/environment';
import { ErrorHelper } from '../services/errors.helper';
import { Logger } from '../services/logger.service';
const compose = require('composable-middleware');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

export interface Strategy {
  readonly router: IRouter<any>;
}

export class AuthService {
  /**
   * Attaches the user object to the request if authenticated
   * Otherwise returns 403
   */
  static isAuthenticated () {
    return compose()
      .use(this.validateJWT())
      .use(this.writeUserFromDBtoReq);
  }

  static isTokenValid (token: string, cb: Function) {
    jwt.verify(token, config.auth.secret, cb);
  }

  /**
   * Returns a jwt token signed by the app secret
   */
  static genToken (data: Object) {
    return this.signToken(data, config.auth.secret);
  }

  private static signToken (params: Object,
                            secret: string,
                            expiresIn?: number) {
    return jwt.sign(params, secret, {
      // 60sec*60min*24hours*7days = 604800 === 1 week
      expiresIn: expiresIn || 604800
    });
  }

  private static validateJWT () {
    return (req: Request, res: Response, next: Function) => {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('token')) {
        // tslint:disable-next-line:no-string-literal restrict-plus-operands
        req.headers['authorization'] = 'Bearer ' + req.query.token;
      }
      expressJwt({secret: config.auth.secret})(req, res, (error: Error) => {
        if (error) {
          // we have to send it by ourselves, without any extra error data
          return res.sendStatus(401);
        }
        next();
      });
    };
  }

  private static writeUserFromDBtoReq (req: Request,
                                       res: Response,
                                       next: Function) {
    if (!req.user) {
      return res.sendStatus(401);
    }

    UserModel.findById(req.user._id, (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.sendStatus(401);
      }

      if (user.isBlocked) {
        return res.status(403).json({
          name: ErrorHelper.Type.BlockedUser,
          message: 'User is blocked'
        });
      }

      user.lastLoggedIn = new Date();
      user
        .save()
        .catch((error: Error) => {
          if (error.name !== ErrorHelper.Type.Validation) {
            Logger.error('AuthService.writeUserFromDBtoReq() - user save' +
              ' failed', {error}, req);
          }
        });

      req.user = user;
      next();
    });
  }
}
