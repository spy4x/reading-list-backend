import { Request, Response, Router } from 'express';
import * as passport from 'passport';
import { User, UserModel } from '../../api/user/user.model';
import { config } from '../../config/environment/index';
import { Logger } from '../../services/logger.service';
import { AuthService, Strategy as AuthServiceStrategy } from '../auth.service';
/* tslint:disable:max-line-length */
import { DefaultDataForNewUser } from '../../api/user/defaultDataForNewUser.service';
/* tslint:enable:max-line-length */
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export class AuthGoogleStrategy implements AuthServiceStrategy {
  readonly router = Router();

  constructor () {
    this.initStrategy();
    this.initRouter();
  }

  private initStrategy (): void {
    /* tslint:disable:only-arrow-functions */
    const params = {
      clientID: config.auth.google.clientID,
      clientSecret: config.auth.google.clientSecret,
      callbackURL: config.auth.google.callbackURL
    };
    const googleStrategy = new GoogleStrategy(params, callback);

    passport.use(googleStrategy);

    function callback (accessToken: any,
                       refreshToken: any,
                       profile: any,
                       done: Function) {
      const avatarURL = profile.photos.length
        ? profile.photos[0].value
        : undefined;
      const email = profile.emails.length
        ? profile.emails[0].value
        : undefined;
      const newDate = new Date();
      UserModel
        .findOne({'googleId': profile.id})
        .then(user => {
          if (!user) {
            const newUser: User = {
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              avatarURL,
              createdAt: newDate,
              lastLoggedIn: newDate
            };
            return new UserModel(newUser)
              .save()
              .then(savedUser => {
                DefaultDataForNewUser.create(savedUser);
                done(undefined, savedUser);
              })
              .catch(error => {
                const message = 'GooglePassport::callback - create user error';
                Logger.error(message, {error});
                done(error);
              });
          }

          if (user.isBlocked) {
            return done(undefined, false, {message: 'User is blocked'});
          }
          user.lastLoggedIn = newDate;
          user.avatarURL = avatarURL;
          user.name = profile.displayName;
          user
            .save()
            .then(savedUser => done(undefined, savedUser))
            .catch(error => {
              const message = 'GooglePassport::callback - update user error';
              Logger.error(message, {error});
              done(error);
            });
        })
        .catch((error: Error) => {
          Logger.error('GooglePassport.callback() - findOne failed', {error});
          done(
            undefined,
            false,
            {message: 'Problems on server side, try again later'});
        });
    }

    /* tslint:enable:only-arrow-functions */
  }

  private initRouter (): void {
    this.router
      .get('/', passport.authenticate('google', {
        failureRedirect: '/signup',
        scope: [
          'profile',
          'email'
        ],
        session: false
      }))

      .get(
        '/callback',
        passport.authenticate('google', {
          failureRedirect: '/signup',
          session: false
        }),
        (req: Request, res: Response) => {
          const token = AuthService.genToken(req.user.getPublic());
          res.redirect(`${config.urls.frontend}/auth/token/${token}`);
        }
      );
  }

}
