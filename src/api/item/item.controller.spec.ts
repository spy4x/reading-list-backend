/* tslint:disable:only-arrow-functions no-invalid-this max-file-line-count */
import { expect } from 'chai';
// import * as Q from 'q';
import { TestApplication } from '../../app.spec';
import { ErrorHelper } from '../../services/errors.helper';
import { TestsHelper } from '../../services/tests.helper';
import { SeedTags } from '../tag/tag.seed';
import { SeedUsers } from '../user/user.seed';
import { ItemModel } from './item.model';
import { SeedItems } from './item.seed';
const request = require('supertest');

describe('/items', () => {

  describe('GET /', () => {

    before('Clear collection', done => {
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

    it('should return 200 and user\'s items',
      function (done) {
        request(TestApplication.app)
          .get(`/items`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            const userItems = SeedItems.pureDataArray
              .filter(Item => {
                return SeedUsers.users.normal._id === Item.owner;
              });
            const userItemsAmount = userItems.length;
            expect(res.body.length).to.be.eq(userItemsAmount);

            const twoTagsItem = userItems[2];
            expect(res.body[2]._id).to.be.eq(twoTagsItem._id.toString());
            expect(res.body[2].url).to.be.eq(twoTagsItem.url);
            expect(res.body[2].title).to.be.eq(twoTagsItem.title);
            expect(res.body[2].priority).to.be.eq(twoTagsItem.priority);
            expect(res.body[2].tags.length).to.be.eq(2, 'tags length to be 2');
            expect(res.body[2].tags[0].toString()).to.be.eq(
              twoTagsItem.tags[0].toString(), 'first tag to be equal');
            expect(res.body[2].tags[1].toString()).to.be.eq(
              twoTagsItem.tags[1].toString(), 'second tag to be equal');
            expect(res.body[2].owner).to.be.eq(
              SeedUsers.users.normal._id.toString());
            expect(res.body[2].createdAt).to.exist;
            done();
          });
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .get(`/items`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'get',
          `/items`);
      });

  });

  describe('POST /', () => {

    const newItem = {
      url: 'http://some-url.com',
      title: 'Some url',
      priority: 2,
      tags: [
        SeedTags.tags.normalCode._id.toString(),
        SeedTags.tags.normalArchery._id.toString()
      ]
    };

    before('Clear collection', done => {
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

    it('should return 201 and created item',
      function (done) {
        request(TestApplication.app)
          .post(`/items`)
          .send(newItem)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(201)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body._id).to.exist;
            expect(res.body.url).to.be.eq(newItem.url);
            expect(res.body.title).to.be.eq(newItem.title);
            expect(res.body.priority).to.be.eq(newItem.priority);
            expect(res.body.tags.length).to.be.eq(2, 'tags length to be 2');
            expect(res.body.tags[0].toString()).to.be.eq(
              newItem.tags[0], 'first tag to be equal');
            expect(res.body.tags[1].toString()).to.be.eq(
              newItem.tags[1], 'second tag to be equal');
            expect(res.body.owner).to.be.eq(
              SeedUsers.users.normal._id.toString());

            ItemModel
              .findOne({_id: res.body._id})
              .then(item => {
                if (!item) {
                  return done(new Error('No item found'));
                }
                expect(item.url).to.be.eq(newItem.url);
                expect(item.title).to.be.eq(newItem.title);
                expect(item.priority).to.be.eq(newItem.priority);
                expect(item.tags.length).to.be.eq(2, 'tags length to be 2');
                expect(item.tags[0].toString()).to.be.eq(
                  newItem.tags[0], 'first tag to be equal');
                expect(item.tags[1].toString()).to.be.eq(
                  newItem.tags[1], 'second tag to be equal');
                expect(item.owner.toString()).to.be.eq(
                  SeedUsers.users.normal._id.toString());
                done();
              })
              .catch(done);
          });
      });

    it('should return 400 and error for duplicating Item',
      function (done) {
        request(TestApplication.app)
          .post(`/items`)
          .send(newItem)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.url.kind).to.be.eq(
              'unique', 'url unique');
            expect(res.body.errors.owner.kind).to.be.eq(
              'unique', 'owner unique');

            done();
          });
      });

    it('should return 400 and error for missing fields',
      function (done) {
        request(TestApplication.app)
          .post(`/items`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.url.kind).to.be.eq(
              'required', 'url required');
            expect(res.body.errors.title.kind).to.be.eq(
              'required', 'title required');

            done();
          });
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .post(`/items`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'post',
          `/items`);
      });

  });

  describe('PUT /:id', () => {

    before('Clear collection', done => {
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

    it('should return 200 and updated item',
      function (done) {
        const newUrl = SeedItems.items.oneTag.url + '/123';
        const newTitle = 'New title';
        const newPriority = 3;
        const newTags = [
          SeedTags.tags.normalArchery._id.toString(),
          SeedTags.tags.normalNotInAnItem._id.toString()
        ];
        const newDate = new Date().toISOString();
        request(TestApplication.app)
          .put(`/items/${SeedItems.items.oneTag._id.toString()}`)
          .send({
            url: newUrl,
            title: newTitle,
            priority: newPriority,
            tags: newTags,
            viewedAt: newDate
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(200)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body._id).to.be.eq(
              SeedItems.items.oneTag._id.toString());
            expect(res.body.url).to.be.eq(newUrl);
            expect(res.body.title).to.be.eq(newTitle);
            expect(res.body.priority).to.be.eq(newPriority);
            expect(res.body.viewedAt).to.be.eq(newDate);
            expect(res.body.tags.length).to.be.deep.eq(newTags.length);
            expect(res.body.tags[0]).to.be.eq(
              newTags[0], 'first tag to be equal');
            expect(res.body.tags[1]).to.be.eq(
              newTags[1], 'second tag to be equal');
            expect(res.body.owner).to.be.eq(
              SeedUsers.users.normal._id.toString());

            ItemModel
              .findOne({_id: res.body._id})
              .then(item => {
                if (!item) {
                  return done(new Error('No item found'));
                }
                expect(item.url).to.be.eq(newUrl);
                expect(item.title).to.be.eq(newTitle);
                expect(item.priority).to.be.eq(newPriority);
                expect(item.tags.length).to.be.deep.eq(newTags.length);
                expect(item.tags[0].toString()).to.be.eq(
                  newTags[0], 'first tag to be equal');
                expect(item.tags[1].toString()).to.be.eq(
                  newTags[1], 'second tag to be equal');
                expect(item.owner.toString()).to.be.eq(
                  SeedUsers.users.normal._id.toString());
                done();
              })
              .catch(done);
          });
      });

    it('should return 400 and error for duplicating Item',
      function (done) {
        request(TestApplication.app)
          .put(`/items/${SeedItems.items.noTags._id.toString()}`)
          .send({
            url: SeedItems.items.oneTag.url + '/123'
          })
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.url.kind).to.be.eq(
              'unique', 'url unique');
            expect(res.body.errors.owner.kind).to.be.eq(
              'unique', 'owner unique');

            done();
          });
      });

    it('should return 400 if fields are missing',
      function (done) {
        request(TestApplication.app)
          .put(`/items/${SeedItems.items.twoTags._id.toString()}`)
          .send({})
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(400)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            expect(res.body.name).to.be.eq(ErrorHelper.Type.Validation);
            expect(res.body.errors.url.kind).to.be.eq(
              'required', 'url required');
            expect(res.body.errors.title.kind).to.be.eq(
              'required', 'title required');
            expect(res.body.errors.priority.kind).to.be.eq(
              'required', 'priority required');
            expect(res.body.errors.tags).to.not.exist;
            expect(res.body.errors.owner).to.not.exist;

            done();
          });
      });

    it('should return 404 if user tries to change somebody else\'s Item',
      function (done) {
        request(TestApplication.app)
          .put(`/items/${SeedItems.items.ofBlockedUser._id.toString()}`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(404)
          .end(done);
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .put(`/items/${SeedItems.items.ofBlockedUser._id.toString()}`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'put',
          `/items/${SeedItems.items.ofBlockedUser._id.toString()}`);
      });

  });

  describe('DELETE /:id', () => {

    before('Clear collection', done => {
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

    it('should return 204 and remove item',
      function (done) {
        const itemId = SeedItems.items.twoTags._id.toString();
        request(TestApplication.app)
          .delete(`/items/${itemId}`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(204)
          .end((error: Error, res: any) => {
            expect(error).to.not.exist;

            ItemModel
              .findOne({_id: itemId})
              .then(Item => {
                if (Item) {
                  return done(new Error('Item wasn\'t removed'));
                }
                done();
              })
              .catch(done);
          });
      });

    it('should return 404 if user tries to remove somebody else\'s Item',
      function (done) {
        const id = SeedItems.items.ofBlockedUser._id.toString();
        request(TestApplication.app)
          .delete(`/items/${id}`)
          .set('Authorization', 'Bearer ' + SeedUsers.tokens.normal)
          .expect(404)
          .end(done);
      });

    it('returns 401 without token',
      function (done) {
        request(TestApplication.app)
          .delete(`/items/${SeedItems.items.ofBlockedUser._id.toString()}`)
          .expect(401)
          .end(done);
      });

    it('should return 403 for blocked user',
      function (done) {
        TestsHelper.getCheckBlockedUserTestBody(
          done,
          'delete',
          `/items/${SeedItems.items.ofBlockedUser._id.toString()}`);
      });

  });

});
