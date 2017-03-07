import * as Mongoose from 'mongoose';
import { generate } from 'shortid';
import isURL = require('validator/lib/isURL');
const uniqueValidator = require('mongoose-unique-validator');


export interface Item {
  _id?: string;
  url: string;
  title: string;
  imageUrl: string;
  description: string;
  priority: number;
  tags: string[];
  owner: string;
  viewedAt?: Date;
  createdAt: Date;
}

export interface ItemDBO extends Item, Mongoose.Document {
  _id: string;
}

const ItemSchema = new Mongoose.Schema({
  _id: {
    type: String,
    'default': generate,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true,
    validate: [isURL, 'Invalid url']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  priority: {
    type: Number,
    required: true,
    'default': 1
  },
  tags: [{
    type: String,
    ref: 'Tag'
  }],
  owner: {
    type: String,
    ref: 'User',
    required: true
  },
  viewedAt: Date,
  createdAt: Date
});
ItemSchema.index({url: 1, owner: 1}, {unique: true});
ItemSchema.plugin(uniqueValidator);

export const ItemModel = Mongoose.model<ItemDBO>('Item', ItemSchema);
