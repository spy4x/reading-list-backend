/* tslint:disable:max-line-length */
import { UserDBO } from './user.model';
import { Logger } from '../../services/logger.service';
import { generate } from 'shortid';
import { TagModel } from '../tag/tag.model';
import { ItemModel } from '../item/item.model';

export class DefaultDataForNewUser {
  static create (user: UserDBO) {

    const userId = user._id.toString();
    const tagIdStartup = generate();
    const tagIdProductivity = generate();
    const tagIdVideo = generate();
    TagModel
      .insertMany(DefaultDataForNewUser.getTags(tagIdStartup, userId, tagIdProductivity, tagIdVideo))
      .then(() => {
        ItemModel
          .insertMany(DefaultDataForNewUser.getItems(tagIdStartup, tagIdProductivity, userId, tagIdVideo))
          .catch(error => {
            Logger.debug('CreateDefaultItems for new' +
              ' users error:', error);
          });
      })
      .catch(error => {
        Logger.debug('CreateDefaultTags for new' +
          ' users error:', error);
      });
  }

  private static getTags (userId: string,
                          tagIdStartup: string,
                          tagIdProductivity: string,
                          tagIdVideo: string) {
    const newDate = new Date();
    return [
      {
        _id: tagIdStartup,
        name: 'startup',
        owner: userId,
        createdAt: newDate
      },
      {
        _id: tagIdProductivity,
        name: 'productivity',
        owner: userId,
        createdAt: newDate
      },
      {
        _id: tagIdVideo,
        name: 'video',
        owner: userId,
        createdAt: newDate
      }
    ];
  }

  private static getItems (userId: string,
                           tagIdStartup: string,
                           tagIdProductivity: string,
                           tagIdVideo: string) {
    const newDate = new Date();
    return [
      {
        url: 'https://hackernoon.com/think-big-start-small-act-fast-6fdab1f771ea#.e5uic2my4',
        title: 'Think big, start small, act fast',
        imageUrl: 'https://cdn-images-1.medium.com/max/1200/1*cNLOPlz0qXbCWSXT1spVNQ.jpeg',
        description: 'How do you build something that matters?',
        priority: 1,
        tags: [tagIdStartup, tagIdProductivity],
        owner: userId,
        createdAt: newDate
      },
      {
        url: 'https://medium.com/the-mission/8-things-every-person-should-do-before-8-a-m-cc0233e15c8d#.52v7yyvbe',
        title: '8 Things Every Person Should Do Before 8 A.M. – The Mission',
        imageUrl: 'https://cdn-images-1.medium.com/max/1200/1*6RasdM21jcApKkiztyQtUQ.jpeg',
        description: 'Here is the Italian and French translations.',
        priority: 1,
        tags: [tagIdProductivity],
        owner: userId,
        createdAt: newDate
      },
      {
        url: 'https://medium.com/swlh/how-quitting-my-corporate-job-for-my-startup-dream-f-cked-my-life-up-3b6b3e29b318#.uib4q0g1w',
        title: 'How quitting my corporate job for my startup dream f*cked my life up – The Startup',
        imageUrl: 'https://cdn-images-1.medium.com/max/1200/1*V3R9dHv93qmUyGRGQWZ1oA.jpeg',
        description: '',
        priority: 2,
        tags: [tagIdStartup],
        owner: userId,
        createdAt: newDate
      },
      {
        url: 'https://www.youtube.com/watch?v=1VuMdLm0ccU',
        title: '2 Hamsters 1 Wheel',
        imageUrl: 'https://i.ytimg.com/vi/1VuMdLm0ccU/hqdefault.jpg',
        description: 'Some funny video',
        priority: 3,
        tags: [tagIdVideo],
        owner: userId,
        createdAt: newDate
      },
      {
        url: 'https://github.com/spy4x/reading-list-frontend',
        title: 'GitHub: Reading List repository',
        imageUrl: 'https://avatars0.githubusercontent.com/u/4995814?v=3&s=100',
        description: 'Angular 2 application by Anton Shubin',
        priority: 3,
        tags: [],
        owner: userId,
        createdAt: newDate
      }
    ];
  }
}
