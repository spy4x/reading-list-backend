/* tslint:disable:only-arrow-functions no-invalid-this */
import { expect } from 'chai';
import * as _ from 'lodash';
import { ErrorHelper } from '../../services/errors.helper';
import { User, UserModel } from './user.model';
import { SeedUsers } from './user.seed';

describe('user.model', () => {
  before('Clear collection', done => {
    SeedUsers.clear(done);
  });

  it('should save normal user with all possible fields', function (done) {
    const clone = _.cloneDeep(SeedUsers.users.normal.toJSON()) as User;
    clone.email = ` ${(clone.email as any).toUpperCase()} `;
    clone.name = ` ${clone.name} `;
    clone.isBlocked = true;
    clone.blockedLastTimeAt = new Date();
    clone.blockedComment = 'Test block';
    new UserModel(clone)
      .save()
      .then(user => {
        expect(user.email).to.be.eq(
          SeedUsers.users.normal.email,
          'email to be trimmed and lowercased');
        expect(user.name).to.be.eq(
          SeedUsers.users.normal.name,
          'name to be trimmed');
        expect(user.googleId).to.be.eq(
          SeedUsers.users.normal.googleId, 'googleId to be equal');
        expect(user.avatarURL).to.be.eq(
          SeedUsers.users.normal.avatarURL, 'avatarURL to be equal');
        expect(user.createdAt).to.exist;
        expect(user.lastLoggedIn).to.not.exist;
        expect(user.isBlocked).to.be.eq(true);
        expect(user.blockedLastTimeAt).to.exist;
        expect(user.blockedComment).to.be.eq('Test block');
        done();
      })
      .catch(done);
  });

  it('shouldn\'t save user due to validation errors', function (done) {
    const badUser: User = {
      email: SeedUsers.users.normal.email,
      name: 'Name',
      googleId: SeedUsers.users.normal.googleId,
      createdAt: new Date()
    };
    new UserModel(badUser)
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.email.kind).to.be.eq('unique', 'email unique');
          expect(error.errors.googleId.kind).to.be.eq(
            'unique', 'googleId enum');
          done();
        } else {
          done(error);
        }
      });
  });

  it('shouldn\'t save user cause required fields are missing', function (done) {
    new UserModel({})
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.googleId.kind).to.be.eq('required', 'email');
          expect(error.errors.name.kind).to.be.eq('required', 'name');
          done();
        } else {
          done(error);
        }
      });
  });

  it('.getPublic() should return only public data', function () {
    this.timeout(50);
    const publicData = SeedUsers.users.normal.getPublic();
    expect(publicData._id).to.exist;
    expect(publicData.email).to.exist;
    expect(publicData.name).to.exist;
    expect(publicData.googleId).to.exist;
    expect(publicData.avatarURL).to.exist;
    expect(publicData.lastLoggedIn).to.not.exist;
    expect(publicData.isBlocked).to.not.exist;
    expect(publicData.blockedLastTimeAt).to.not.exist;
    expect(publicData.blockedComment).to.not.exist;
  });
});
