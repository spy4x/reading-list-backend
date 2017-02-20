/* tslint:disable:no-invalid-this */
import { SeedUsers } from '../user/user.seed';
import { TagModel } from './tag.model';

const newDate = new Date();

export class SeedTags {

  static init () {
    for (const key in SeedTags.pureData) {
      if (SeedTags.pureData.hasOwnProperty(key)) {
        SeedTags.pureDataArray.push((SeedTags.pureData as any)[key]);
      }
    }
  }

  public static pureDataArray: any[] = [];
  private static pureData = {
    normalCode: {
      _id: '58aa6220e4e73c3b44d11d68',
      name: 'code',
      owner: SeedUsers.users.normal._id.toString(),
      createdAt: newDate
    },
    normalArchery: {
      _id: '58aa6220e4e73c3b44d11d69',
      name: 'archery',
      owner: SeedUsers.users.normal._id.toString(),
      createdAt: newDate
    },
    normalNotInAnItem: {
      _id: '58aa6220e4e73c3b44d11d70',
      name: 'not-in-an-item',
      owner: SeedUsers.users.normal._id.toString(),
      createdAt: newDate
    },
    blockedProductivity: {
      _id: '58aa6220e4e73c3b44d11d71',
      name: 'productivity',
      owner: SeedUsers.users.blocked._id.toString(),
      createdAt: newDate
    }
  };
  static tags = {
    normalCode: new TagModel(SeedTags.pureData.normalCode),
    normalArchery: new TagModel(SeedTags.pureData.normalArchery),
    normalNotInAnItem: new TagModel(SeedTags.pureData.normalNotInAnItem),
    blockedProductivity: new TagModel(SeedTags.pureData.blockedProductivity)
  };

  static clear (done: any): void {
    TagModel
      .remove({})
      .then(() => done())
      .catch(error => {
        console.log('SeedTags.clear() error:', error);
        done(error);
      });
  };

  static fill (done: any): void {
    TagModel
      .insertMany(SeedTags.pureDataArray)
      .then(() => done())
      .catch(error => {
        console.log('SeedTags.fill() error:', error);
        done(error);
      });
  };

  static clearAndFill (done: any): void {
    SeedTags.clear((error: Error) => {
      if (error) {
        done(error);
      }
      SeedTags.fill(done);
    });
  };
}
