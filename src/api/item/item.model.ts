import * as Mongoose from 'mongoose';
import isURL = require('validator/lib/isURL');
const uniqueValidator = require('mongoose-unique-validator');


export interface Item {
  _id?: any;
  url: string;
  title: string;
  priority: number;
  tags: string[];
  owner: string;
  viewedAt?: Date;
  createdAt: Date;
}

export interface ItemDBO extends Item, Mongoose.Document {
  _id: any;
}

const ItemSchema = new Mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      validate: [isURL, 'Invalid url']
    },
    title: {
      type: String,
      required: true
    },
    priority: {
      type: Number,
      required: true,
      'default': 1
    },
    tags: [{
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    owner: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    viewedAt: Date,
    createdAt: Date
  }
);
ItemSchema.index({url: 1, owner: 1}, {unique: true});
ItemSchema.plugin(uniqueValidator);

export const ItemModel = Mongoose.model<ItemDBO>('Item', ItemSchema);
