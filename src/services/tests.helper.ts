import { expect } from 'chai';
import { SeedUsers } from '../api/user/user.seed';
import { TestApplication } from '../app.spec';
import { ErrorHelper } from './errors.helper';
const request = require('supertest');

export class TestsHelper {

  static getCheckBlockedUserTestBody (done: Function,
                                      httpMethod:
                                        'get' | 'post' | 'put' | 'delete',
                                      endpoint: string) {
    const userToken = SeedUsers.tokens.blocked;

    let req = request(TestApplication.app);
    switch (httpMethod) {
      case 'get':
        req = req.get(endpoint);
        break;
      case 'post':
        req = req.post(endpoint);
        break;
      case 'put':
        req = req.put(endpoint);
        break;
      case 'delete':
        req = req.delete(endpoint);
        break;
      default:
        throw new Error('Not supported httpMethod');
    }

    req
      .set('Authorization', 'Bearer ' + userToken)
      .expect(403)
      .end((error: Error, res: any) => {
        expect(error).to.not.exist;
        expect(res.body.name).to.be.eq(ErrorHelper.Type.BlockedUser);
        expect(res.body.message).to.be.eq('User is blocked');
        done();
      });
  }
}
