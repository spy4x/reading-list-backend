/* tslint:disable:only-arrow-functions no-invalid-this */
import { SeedItems } from './api/item/item.seed';
import { SeedTags } from './api/tag/tag.seed';
import { SeedUsers } from './api/user/user.seed';
import { App } from './app';
const request = require('supertest');

export let TestApplication: App;

describe('App', () => {

  before('Init app', () => {
    TestApplication = new App();
    SeedUsers.init();
    SeedTags.init();
    SeedItems.init();
  });

  it('starts successfully', function (done) {
    TestApplication.run().then(done).catch(done);
  });

  it('responds to requests', function (done) {
    request(TestApplication.app)
      .get('/users/me')
      .expect(401)
      .end(done);
  });
});
