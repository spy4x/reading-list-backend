/* tslint:disable:only-arrow-functions no-invalid-this */
import { expect } from 'chai';
import * as _ from 'lodash';
import { ErrorHelper } from '../../services/errors.helper';
import { Tag, TagModel } from './tag.model';
import { SeedTags } from './tag.seed';

describe('Tag.model', () => {
  before('Clear collection', done => {
    SeedTags.clear(done);
  });

  it('should save code tag with all possible fields', function (done) {
    const clone = _.cloneDeep(SeedTags.tags.normalCode.toJSON()) as Tag;
    new TagModel(clone)
      .save()
      .then(tag => {
        expect(tag.name).to.be.eq(
          SeedTags.tags.normalCode.name, 'name to be equal');
        expect(tag.owner.toString()).to.be.eq(
          SeedTags.tags.normalCode.owner.toString(), 'owner to be equal');
        expect(tag.createdAt).to.exist;
        done();
      })
      .catch(done);
  });

  it('should save archery tag with all possible fields', function (done) {
    const clone = _.cloneDeep(SeedTags.tags.normalArchery.toJSON()) as Tag;
    new TagModel(clone)
      .save()
      .then(tag => {
        expect(tag.name).to.be.eq(
          SeedTags.tags.normalArchery.name, 'name to be equal');
        expect(tag.owner.toString()).to.be.eq(
          SeedTags.tags.normalArchery.owner.toString(), 'owner to be equal');
        expect(tag.createdAt).to.exist;
        done();
      })
      .catch(done);
  });

  it('should save archery tag for another user with all possible fields',
    function (done) {
      const clone = _.cloneDeep(SeedTags.tags.normalArchery.toJSON()) as Tag;
      clone.owner = SeedTags.tags.blockedProductivity.owner;
      delete(clone._id);
      new TagModel(clone)
        .save()
        .then(tag => {
          expect(tag.name).to.be.eq(
            SeedTags.tags.normalArchery.name, 'name to be equal');
          expect(tag.owner.toString()).to.be.eq(
            SeedTags.tags.blockedProductivity.owner.toString(),
            'owner to be equal');
          expect(tag.createdAt).to.exist;
          done();
        })
        .catch(done);
    });

  it('shouldn\'t save tag due to validation errors', function (done) {
    const clone = _.cloneDeep(SeedTags.tags.normalCode.toJSON()) as Tag;
    new TagModel(clone)
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.name.kind).to.be.eq('unique', 'name unique');
          expect(error.errors.owner.kind).to.be.eq(
            'unique', 'owner unique');
          done();
        } else {
          done(error);
        }
      });
  });

  it('shouldn\'t save Tag cause required fields are missing', function (done) {
    new TagModel({})
      .save()
      .then(done)
      .catch(error => {
        if (error && error.name === ErrorHelper.Type.Validation) {
          expect(error.errors.name.kind).to.be.eq('required', 'name');
          expect(error.errors.owner.kind).to.be.eq('required', 'owner');
          done();
        } else {
          done(error);
        }
      });
  });
});
