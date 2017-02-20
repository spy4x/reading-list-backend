import * as Mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');


export interface Tag {
  _id?: any;
  name: string;
  owner: string;
  createdAt: Date;
}

export interface TagDBO extends Tag, Mongoose.Document {
  _id: any;
}

const TagSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: Date
});
TagSchema.index({name: 1, owner: 1}, {unique: true});
TagSchema.plugin(uniqueValidator);

export const TagModel = Mongoose.model<TagDBO>('Tag', TagSchema);
