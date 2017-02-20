/* tslint:disable:no-invalid-this */
import { AuthService } from '../../auth/auth.service';
import { UserModel } from './user.model';

const newDate = new Date();

export class SeedUsers {

  static init () {
    for (const key in SeedUsers.pureData) {
      if (SeedUsers.pureData.hasOwnProperty(key)) {
        SeedUsers.pureDataArray.push((SeedUsers.pureData as any)[key]);
      }
    }
  }

  public static pureDataArray: any[] = [];
  private static pureData = {
    normal: {
      _id: '58998a7cc0788fb80f6b88f1',
      email: 'antoxas12@gmail.com',
      name: 'Anton Shubin',
      googleId: '1',
      avatarURL: 'http://some.url',
      createdAt: newDate
    },
    blocked: {
      _id: '58998a7cc0788fb80f6b88b2',
      email: 'antoxas12+blocked@gmail.com',
      name: 'Blocked User',
      googleId: '2',
      avatarURL: 'http://some.url',
      isBlocked: true,
      blockedLastTimeAt: new Date(),
      blockedComment: 'Test blocked user',
      createdAt: newDate
    }
  };
  static users = {
    normal: new UserModel(SeedUsers.pureData.normal),
    blocked: new UserModel(SeedUsers.pureData.blocked)
  };
  static tokens = {
    normal: AuthService.genToken(SeedUsers.users.normal.getPublic()),
    blocked: AuthService.genToken(SeedUsers.users.blocked.getPublic())
  };

  static clear (done: any): void {
    UserModel.remove({}).then(() => done()).catch(done);
  };

  static fill (done: any): void {
    UserModel
      .insertMany(SeedUsers.pureDataArray)
      .then(() => done())
      .catch(done);
  };

  static clearAndFill (done: any): void {
    SeedUsers.clear((error: Error) => {
      if (error) {
        done(error);
      }
      SeedUsers.fill(done);
    });
  };
}
