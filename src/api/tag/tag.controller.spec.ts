/* tslint:disable:only-arrow-functions no-invalid-this max-file-line-count */
import { expect } from 'chai';
import * as Q from 'q';
import { TestApplication } from '../../app.spec';
import { ErrorHelper } from '../../services/errors.helper';
import { TestsHelper } from '../../services/tests.helper';
import { ItemModel } from '../item/item.model';
import { SeedItems } from '../item/item.seed';
import { SeedUsers } from '../user/user.seed';
import { TagModel } from './tag.model';
import { SeedTags } from './tag.seed';
const request = require('supertest');

describe('/tags', () => {

  describe('GET /', () => {

    before('Clear collection', done => {
      SeedUsers.clearAndFill((error: Error) => {
        if (error) {
          return done(error);
        }
        SeedTags.clearAndFill(done);
      });
    });

    it('should return 200 and user\'s tags',
      function (done) {
        request(TestApplication.app)
          .get(`/tags`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            const userTags = SeedTags.pureDataArray
              .filter(tag => {
                return SeedUsers.users.normal._id.equals(tag.owner);
              });
            const userTagsAmount = userTags.length;
            expect(res.body.length).to.be.eq(userTagsAmount);

            const firstTag = userTags[0];
            expect(res.body[0]._id).to.be.eq(firstTag._id.toString());
            expect(res.body[0].name).to.be.eq(firstTag.name);
            expect(res.body[0].owner).to.be.eq(
              SeedUsers.users.normal._id.toString());
            expect(res.body[0].createdAt).to.exist;
            done();
          });
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .get(`/tags`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'get',
          `/tags`);
      });

  });

  describe('POST /', () => {

    before('Clear collection', done => {
      SeedUsers.clearAndFill((error: Error) => {
        if (error) {
          return done(error);
        }
        SeedTags.clearAndFill(done);
      });
    });

    it('should return 201 and created tag',
      function (done) {
        const newTagName = 'productivity';
        request(TestApplication.app)
          .post(`/tags`)
          .send({
            name: newTagName
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(201)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body._id).to.exist;
            expect(res.body.name).to.be.eq(newTagName);
            expect(res.body.owner).to.be.eq(
              SeedUsers.users.normal._id.toString());

            TagModel
              .findOne({_id: res.body._id})
              .then(tag => {
                if (!tag) {
                  return done(new Error('No tag found'));
                }
                expect(tag.name).to.be.eq(newTagName);
                expect(tag.owner.toString()).to.be.eq(
                  SeedUsers.users.normal._id.toString());
                done();
              })
              .catch(done);
          });
      });

    it('should return 400 and error for duplicating tag',
      function (done) {
        const newTagName = 'productivity';
        request(TestApplication.app)
          .post(`/tags`)
          .send({
            name: newTagName
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.name.kind).to.be.eq(
              'unique', 'name unique');
            expect(res.body.errors.owner.kind).to.be.eq(
              'unique', 'owner unique');

            done();
          });
      });

    it('should return 400 and error for missing "name" field',
      function (done) {
        request(TestApplication.app)
          .post(`/tags`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.name.kind).to.be.eq(
              'required', 'name required');

            done();
          });
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .post(`/tags`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'post',
          `/tags`);
      });

  });

  describe('PUT /:id', () => {

    before('Clear collection', done => {
      SeedUsers.clearAndFill((error: Error) => {
        if (error) {
          return done(error);
        }
        SeedTags.clearAndFill(done);
      });
    });

    it('should return 200 and updated tag',
      function (done) {
        const newName = SeedTags.tags.normalCode.name + '1';
        request(TestApplication.app)
          .put(`/tags/${SeedTags.tags.normalCode._id.toString()}`)
          .send({
            name: newName
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body._id).to.be.eq(
              SeedTags.tags.normalCode._id.toString());
            expect(res.body.name).to.be.eq(newName);
            expect(res.body.owner).to.be.eq(
              SeedUsers.users.normal._id.toString());

            TagModel
              .findOne({_id: res.body._id})
              .then(tag => {
                if (!tag) {
                  return done(new Error('No tag found'));
                }
                expect(tag.name).to.be.eq(newName);
                expect(tag.owner.toString()).to.be.eq(
                  SeedUsers.users.normal._id.toString());
                done();
              })
              .catch(done);
          });
      });

    it('should return 400 and error for duplicating tag',
      function (done) {
        request(TestApplication.app)
          .put(`/tags/${SeedTags.tags.normalArchery._id.toString()}`)
          .send({
            name: SeedTags.tags.normalCode.name + '1'
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.name.kind).to.be.eq(
              'unique', 'name unique');
            expect(res.body.errors.owner.kind).to.be.eq(
              'unique', 'owner unique');

            done();
          });
      });

    it('should return 200 and even with missing "name" field',
      function (done) {
        request(TestApplication.app)
          .put(`/tags/${SeedTags.tags.normalArchery._id.toString()}`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body._id).to.be.eq(
              SeedTags.tags.normalArchery._id.toString());
            expect(res.body.name).to.be.eq(SeedTags.tags.normalArchery.name);
            expect(res.body.owner).to.be.eq(
              SeedUsers.users.normal._id.toString());

            TagModel
              .findOne({_id: res.body._id})
              .then(tag => {
                if (!tag) {
                  return done(new Error('No tag found'));
                }
                expect(tag.name).to.be.eq(SeedTags.tags.normalArchery.name);
                expect(tag.owner.toString()).to.be.eq(
                  SeedUsers.users.normal._id.toString());
                done();
              })
              .catch(done);
          });
      });

    it('should return 404 if user tries to change somebody else\'s tag',
      function (done) {
        request(TestApplication.app)
          .put(`/tags/${SeedTags.tags.blockedProductivity._id.toString()}`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(404)
          .end(done);
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .put(`/tags/${SeedTags.tags.normalCode._id.toString()}`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'put',
          `/tags/${SeedTags.tags.normalCode._id.toString()}`);
      });

  });

  describe('DELETE /:id', () => {

    describe('main section', () => {

      beforeEach('Clear collection', done => {
        SeedUsers.clearAndFill((error: Error) => {
          if (error) {
            return done(error);
          }
          SeedTags.clearAndFill((seedTagsError: Error) => {
            if (seedTagsError) {
              return done(seedTagsError);
            }
            SeedItems.clearAndFill(done);
          });
        });
      });

      it('should return 204 and remove tag and clear it\'s usage in items',
        function (done) {
          const tagId = SeedTags.tags.normalCode._id.toString();
          request(TestApplication.app)
            .delete(`/tags/${tagId}`)
            .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
            .expect(204)
            .end((error: Error, res: any) => {
              expect(error).to.not.exist;


              const checkTagRemovedPromise = TagModel
                .findOne({_id: tagId})
                .then(tag => {
                  if (tag) {
                    return done(new Error('Tag wasn\'t removed'));
                  }
                  return true;
                })
                .catch(done);

              const checkTagRemovedFromItemWithOneTagPromise = ItemModel
                .findOne({_id: SeedItems.items.oneTag._id})
                .then(item => {
                  if (!item) {
                    return done(new Error('No item found'));
                  }
                  expect(item.tags.length).to.be.eq(0);
                  return true;
                })
                .catch(done);

              const checkTagRemovedFromItemWithTwoTagsPromise = ItemModel
                .findOne({_id: SeedItems.items.twoTags._id})
                .then(item => {
                  if (!item) {
                    return done(new Error('No item found'));
                  }
                  expect(item.tags.length).to.be.eq(1);
                  expect(item.tags[0]).to.be.not.eq(res.body._id);
                  return true;
                })
                .catch(done);

              Q
                .all([
                  checkTagRemovedPromise,
                  checkTagRemovedFromItemWithOneTagPromise,
                  checkTagRemovedFromItemWithTwoTagsPromise
                ])
                .then(() => done())
                .catch(done);
            });
        });

      it('should return 204 and remove tag that is not even used in items',
        function (done) {
          const tagId = SeedTags.tags.normalNotInAnItem._id.toString();
          request(TestApplication.app)
            .delete(`/tags/${tagId}`)
            .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
            .expect(204)
            .end((error: Error, res: any) => {
              expect(error).to.not.exist;

              const checkTagRemovedPromise = TagModel
                .findOne({_id: tagId})
                .then(tag => {
                  if (tag) {
                    return done(new Error('Tag wasn\'t removed'));
                  }
                  return true;
                })
                .catch(done);

              const checkTagRemovedFromItemWithWhoTagsPromise = ItemModel
                .findOne({_id: SeedItems.items.twoTags._id})
                .then(item => {
                  if (!item) {
                    return done(new Error('No item found'));
                  }
                  expect(item.tags.length).to.be.eq(2);
                  return true;
                })
                .catch(done);

              Q
                .all([
                  checkTagRemovedPromise,
                  checkTagRemovedFromItemWithWhoTagsPromise
                ])
                .then(() => done())
                .catch(done);
            });
        });
    });

    describe('error handling', () => {

      it('should return 404 if user tries to remove somebody else\'s tag',
        function (done) {
          request(TestApplication.app)
            .delete(`/tags/${SeedTags.tags.blockedProductivity._id.toString()}`)
            .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
            .expect(404)
            .end(done);
        });

      it('returns 401 without token',
        function (done) {
          request(TestApplication.app)
            .delete(`/tags/${SeedTags.tags.normalCode._id.toString()}`)
            .expect(401)
            .end(done);
        });

      it('should return 403 for blocked user',
        function (done) {
          TestsHelper.getCheckBlockedUserTestBody(
            done,
            'delete',
            `/tags/${SeedTags.tags.normalCode._id.toString()}`);
        });

    });

  });

});
