import * as Mongoose from 'mongoose';
import { generate } from 'shortid';
const uniqueValidator = require('mongoose-unique-validator');


export interface Tag {
  _id?: string;
  name: string;
  owner: string;
  createdAt: Date;
}

export interface TagDBO extends Tag, Mongoose.Document {
  _id: string;
}

const TagSchema = new Mongoose.Schema({
  _id: {
    type: String,
    'default': generate,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    ref: 'User',
    required: true
  },
  createdAt: Date
});
TagSchema.index({name: 1, owner: 1}, {unique: true});
TagSchema.plugin(uniqueValidator);

export const TagModel = Mongoose.model<TagDBO>('Tag', TagSchema);
