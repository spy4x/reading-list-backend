/* tslint:disable:only-arrow-functions no-invalid-this max-file-line-count */
import { expect } from 'chai';
import { TestApplication } from '../../app.spec';
import { TestsHelper } from '../../services/tests.helper';
import { SeedUsers } from './user.seed';
const request = require('supertest');

describe('/users', () => {

  describe('GET /me', () => {

    before('Clear collection', done => {
      SeedUsers.clearAndFill(done);
    });

    it('returns normal user public data',
      function (done) {
        request(TestApplication.app)
          .get('/users/me')
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;
            const userPublic = SeedUsers.users.normal.getPublic();
            expect(res.body.email).to.be.eq(userPublic.email);
            expect(res.body.name).to.be.eq(userPublic.name);
            expect(res.body.googleId).to.be.eq(userPublic.googleId);
            expect(res.body.avatarURL).to.be.eq(userPublic.avatarURL);
            expect(res.body.lastLoggedIn).to.exist;
            expect(res.body.isBlocked).to.not.exist;
            expect(res.body.blockedLastTimeAt).to.not.exist;
            expect(res.body.blockedComment).to.not.exist;
            done();
          });
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .get('/users/me')
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'get',
          '/users/me');
      });

  });

});
