/* tslint:disable:only-arrow-functions no-invalid-this max-file-line-count */
import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { SeedUsers } from '../api/user/user.seed';
import { TestApplication } from '../app.spec';
import { config } from '../config/environment/index';
import { ErrorHelper } from '../services/errors.helper';
import { AuthService } from './auth.service';
const request = require('supertest');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {

  before('Clear collection', done => {
    SeedUsers.clearAndFill(done);
  });

  function get200Route () {
    const router = Router();
    router.get('/', (req: Request, res: Response) => {
      res.sendStatus(200);
    });
    return router;
  }

  describe('No middleware routes', () => {

    const routeNoMiddleware = '/tests-auth-service-no-middleware';

    before('Create route with no middleware', () => {
      TestApplication.app.use(routeNoMiddleware, get200Route());
    });

    it('should return 200 for routeNoMiddleware and without token',
      function (done) {
        request(TestApplication.app)
          .get(routeNoMiddleware)
          .expect(200)
          .end(done);
      });

    it('should return 200 for routeNoMiddleware and with token',
      function (done) {
        request(TestApplication.app)
          .get(routeNoMiddleware)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end(done);
      });

    it('should return 200 for routeNoMiddleware for blocked user',
      function (done) {
        request(TestApplication.app)
          .get(routeNoMiddleware)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.blocked)
          .expect(200)
          .end(done);
      });

  });

  describe('genToken()', () => {
    const payload = {name: 'Anton Shubin'};

    it('should generate valid token', function (done) {
      this.timeout(50);
      const token = AuthService.genToken(payload);
      jwt.verify(
        token,
        config.auth.secret,
        (error: Error, decodedPayload: any) => {
          if (error) {
            return done(error);
          }
          delete(decodedPayload.exp);
          delete(decodedPayload.iat);
          expect(decodedPayload).to.be.deep.eq(payload);
          done();
        });
    });

  });

  describe('isTokenValid()', () => {
    const payload = {name: 'Anton Shubin'};

    it('should return false for invalid token', function (done) {
      this.timeout(50);
      AuthService.isTokenValid(
        '123',
        (error: Error) => {
          expect(error.name).to.be.eq(ErrorHelper.Type.JsonWebToken);
          done();
        });
    });

    it('should return false for outdated token', function (done) {
      this.timeout(2200);
      const token = jwt.sign(
        payload,
        config.auth.secret,
        {expiresIn: 1});
      setTimeout(function () {
        AuthService.isTokenValid(
          token,
          (error: Error) => {
            expect(error.name).to.be.eq(ErrorHelper.Type.TokenExpired);
            done();
          });
      }, 2000);
    });

    it('should return true for valid token', function (done) {
      this.timeout(50);
      const token = AuthService.genToken(payload);
      AuthService.isTokenValid(
        token,
        (error: Error, decodedPayload: any) => {
          if (error) {
            return done(error);
          }
          delete(decodedPayload.exp);
          delete(decodedPayload.iat);
          expect(decodedPayload).to.be.deep.eq(payload);
          done();
        });
    });

  });

  describe('isAuthenticated()', () => {
    const routeIsAuthenticated = '/tests-is-authenticated';

    before('Create routes with isAuthenticated() middleware', () => {
      TestApplication.app.use(
        routeIsAuthenticated,
        AuthService.isAuthenticated(),
        get200Route());
    });

    it('should return 200 for routeIsAuthenticated and with token',
      function (done) {
        request(TestApplication.app)
          .get(routeIsAuthenticated)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end(done);
      });

    it('should return 401 for routeIsAuthenticated and without token',
      function (done) {
        request(TestApplication.app)
          .get(routeIsAuthenticated)
          .expect(401)
          .end(done);
      });

    it('should return 403 for routeIsAuthenticated for blocked user',
      function (done) {
        request(TestApplication.app)
          .get(routeIsAuthenticated)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.blocked)
          .expect(403)
          .end(done);
      });

  });

});
