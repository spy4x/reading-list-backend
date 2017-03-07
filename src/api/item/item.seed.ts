/* tslint:disable:no-invalid-this */
import { Logger } from '../../services/logger.service';
import { SeedTags } from '../tag/tag.seed';
import { SeedUsers } from '../user/user.seed';
import { ItemModel } from './item.model';

const newDate = new Date();

export class SeedItems {

  static init () {
    for (const key in SeedItems.pureData) {
      if (SeedItems.pureData.hasOwnProperty(key)) {
        SeedItems.pureDataArray.push((SeedItems.pureData as any)[key]);
      }
    }
  }

  public static pureDataArray: any[] = [];
  private static pureData = {
    noTags: {
      _id: '58aa7ece8d6ad3b0af3bf487',
      url: 'http://item-no-tags.com',
      title: 'Item no tags',
      imageUrl: 'http://image.com/image.jpeg',
      description: 'some description here',
      priority: 1,
      owner: SeedUsers.users.normal._id.toString(),
      tags: [],
      createdAt: newDate
    },
    oneTag: {
      _id: '58aa7ece8d6ad3b0af3bf488',
      url: 'http://item-one-tag.com',
      title: 'Item one tag',
      imageUrl: 'http://image.com/image.jpeg',
      description: 'some description here',
      priority: 1,
      owner: SeedUsers.users.normal._id.toString(),
      tags: [
        SeedTags.tags.normalCode._id.toString()
      ],
      createdAt: newDate
    },
    twoTags: {
      _id: '58aa7ece8d6ad3b0af3bf489',
      url: 'http://item-two-tags.com',
      title: 'Item two tags',
      imageUrl: 'http://image.com/image.jpeg',
      description: 'some description here',
      priority: 1,
      owner: SeedUsers.users.normal._id.toString(),
      tags: [
        SeedTags.tags.normalCode._id.toString(),
        SeedTags.tags.normalArchery._id.toString()
      ],
      createdAt: newDate
    },
    ofBlockedUser: {
      _id: '58aa7ece8d6ad3b0af3bf490',
      url: 'http://item-of-blocked-user.com',
      title: 'Item of blocked user',
      imageUrl: 'http://image.com/image.jpeg',
      description: 'some description here',
      priority: 1,
      owner: SeedUsers.users.blocked._id.toString(),
      tags: [SeedTags.tags.blockedProductivity._id.toString()],
      createdAt: newDate
    }
  };
  static items = {
    noTags: new ItemModel(SeedItems.pureData.noTags),
    oneTag: new ItemModel(SeedItems.pureData.oneTag),
    twoTags: new ItemModel(SeedItems.pureData.twoTags),
    ofBlockedUser: new ItemModel(SeedItems.pureData.ofBlockedUser)
  };

  static clear (done: any): void {
    ItemModel
      .remove({})
      .then(() => done())
      .catch(error => {
        Logger.error('SeedItems.clear() error:', {error});
        done(error);
      });
  };

  static fill (done: any): void {
    ItemModel
      .insertMany(SeedItems.pureDataArray)
      .then(() => done())
      .catch(error => {
        Logger.error('SeedItems.fill() error:', {error});
        done(error);
      });
  };

  static clearAndFill (done: any): void {
    SeedItems.clear((error: Error) => {
      if (error) {
        done(error);
      }
      SeedItems.fill(done);
    });
  };
}
