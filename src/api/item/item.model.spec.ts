/* tslint:disable:only-arrow-functions no-invalid-this */
import { expect } from 'chai';
import * as _ from 'lodash';
import { ErrorHelper } from '../../services/errors.helper';
import { Item, ItemModel } from './item.model';
import { SeedItems } from './item.seed';

describe('Item.model', () => {
  before('Clear collection', done => {
    SeedItems.clear(done);
  });

  it('should save item with all possible fields', function (done) {
    const clone = _.cloneDeep(SeedItems.items.twoTags.toJSON()) as Item;
    new ItemModel(clone)
      .save()
      .then(item => {
        expect(item.url).to.be.eq(
          SeedItems.items.twoTags.url, 'url to be equal');
        expect(item.title).to.be.eq(
          SeedItems.items.twoTags.title, 'title to be equal');
        expect(item.priority).to.be.eq(
          SeedItems.items.twoTags.priority, 'priority to be equal');
        expect(item.owner.toString()).to.be.eq(
          SeedItems.items.twoTags.owner.toString(), 'owner to be equal');
        expect(item.tags.length).to.be.eq(2, 'tags length to be 2');
        expect(item.tags[0].toString()).to.be.eq(
          SeedItems.items.twoTags.tags[0].toString(), 'first tag to be equal');
        expect(item.tags[1].toString()).to.be.eq(
          SeedItems.items.twoTags.tags[1].toString(), 'second tag to be equal');
        done();
      })
      .catch(done);
  });

  it('should save item with the same url for another user with all possible' +
    ' fields', function (done) {
      const clone = _.cloneDeep(SeedItems.items.twoTags.toJSON()) as Item;
      clone.owner = SeedItems.items.ofBlockedUser.owner;
      delete(clone._id);
      new ItemModel(clone)
        .save()
        .then(item => {
          expect(item.url).to.be.eq(
            SeedItems.items.twoTags.url, 'url to be equal');
          expect(item.title).to.be.eq(
            SeedItems.items.twoTags.title, 'title to be equal');
          expect(item.priority).to.be.eq(
            SeedItems.items.twoTags.priority, 'priority to be equal');
          expect(item.owner.toString()).to.be.eq(
            SeedItems.items.ofBlockedUser.owner.toString(),
            'owner to be equal');
          expect(item.tags.length).to.be.eq(2, 'tags length to be 2');
          expect(item.tags[0].toString()).to.be.eq(
            SeedItems.items.twoTags.tags[0].toString(),
            'first tag to be equal');
          expect(item.tags[1].toString()).to.be.eq(
            SeedItems.items.twoTags.tags[1].toString(),
            'second tag to be equal');
          done();
        })
        .catch(done);
    });

  it('shouldn\'t save item with the same url for same user', function (done) {
    const clone = _.cloneDeep(SeedItems.items.twoTags.toJSON()) as Item;
    delete(clone._id);
    new ItemModel(clone)
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.url.kind).to.be.eq('unique', 'url unique');
          expect(error.errors.owner.kind).to.be.eq('unique', 'owner unique');
          done();
        } else {
          done(error);
        }
      });
  });

  it('shouldn\'t save tag due to validation errors', function (done) {
    const clone = _.cloneDeep(SeedItems.items.noTags.toJSON()) as Item;
    delete(clone._id);
    clone.url = 'bad url';
    new ItemModel(clone)
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.url.kind).to.be.eq('user defined', 'url invalid');
          done();
        } else {
          done(error);
        }
      });
  });

  it('shouldn\'t save Item cause required fields are missing', function (done) {
    new ItemModel({})
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.url.kind).to.be.eq('required', 'url');
          expect(error.errors.title.kind).to.be.eq('required', 'title');
          expect(error.errors.owner.kind).to.be.eq('required', 'owner');
          done();
        } else {
          done(error);
        }
      });
  });
});
