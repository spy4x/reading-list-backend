import * as Mongoose from 'mongoose';
import isEmail = require('validator/lib/isEmail');
import { generate } from 'shortid';
const uniqueValidator = require('mongoose-unique-validator');


export interface User {
  _id?: string;
  name: string;
  email?: string;
  avatarURL?: string;
  googleId: string;
  lastLoggedIn?: Date;
  createdAt: Date;
  isBlocked?: boolean;
  blockedLastTimeAt?: Date;
  blockedComment?: string;
}

export interface UserDBO extends User, Mongoose.Document {
  _id: string;
  getPublic (): any;
}

const UserSchema = new Mongoose.Schema({
  _id: {
    type: String,
    'default': generate,
    required: true,
    unique: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [isEmail, 'Invalid email']
  },
  avatarURL: String,
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  isBlocked: Boolean,
  blockedLastTimeAt: Date,
  blockedComment: String,
  lastLoggedIn: Date,
  createdAt: Date
});

UserSchema.plugin(uniqueValidator);

/* tslint:disable: no-invalid-this only-arrow-functions */

UserSchema.methods = {

  getPublic: function () {
    return {
      _id: this._id.toString(),
      email: this.email,
      name: this.name,
      avatarURL: this.avatarURL,
      googleId: this.googleId,
      lastLoggedIn: this.lastLoggedIn,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
};

export const UserModel = Mongoose.model<UserDBO>('User', UserSchema);
