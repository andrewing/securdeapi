import mongoose from 'mongoose';
import crypto from 'crypto';
import {AUDIENCE} from '../../util/constants';
import to from '../../util/to';

const {Schema} = mongoose;
const LibraryLog = require('./library_log');
const Book = require('./book');
const Review = require('./review');

const validateEmail = email => {
  // eslint-disable-next-line no-useless-escape
  const regex = /^\w+([\.-]?\w+)*@\w([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const accountSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  password: String,
  email: String,
  idNumber: String,
  question: String,
  answer: String,
  type: String,
  bookHistory: [
    {
      book: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
      log: {
        type: Schema.Types.ObjectId,
        ref: 'LibraryLog',
      },
    },
  ],
  reviewHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  salt: String,
});

accountSchema.statics.authenticate = (username, password, salt, type) => {
  const hashed = sha512(password, salt).hashedPassword;
  return to(
    Account.findOne({
      username,
      password: hashed,
      type,
    }),
  );
};

accountSchema.statics.addAccount = (account, callback) => {
  const passwordData = saltHashPassword(account.password);
  account.password = passwordData.hashedPassword;
  account.salt = passwordData.salt;
  account.save().then(callback);
};

accountSchema.statics.findAllUsers = () => {
  return to(Account.find().populate('bookHistory reviewHistory'));
};

accountSchema.statics.findNonAdminUsers = () => {
  return to(
    Account.find({
      userType: AUDIENCE.USER,
    }).populate('bookHistory reviewHistory'),
  );
};

accountSchema.statics.findUserByUsername = username => {
  return to(
    Account.findOne({
      username,
    }).populate('bookHistory reviewHistory'),
  );
};

accountSchema.statics.findUserById = accountID => {
  return to(
    Account.findOne({
      _id: accountID,
    }).populate('bookHistory reviewHistory'),
  );
};

accountSchema.statics.findUserByIdNumber = idNumber => {
  return to(
    Account.findOne({
      idNumber,
    }).populate('bookHistory reviewHistory'),
  );
};

accountSchema.statics.updateAccount = (accountID, account) => {
  const hashed = saltHashPassword(account.password);
  return to(
    Account.updateOne(
      {
        _id: accountID,
      },
      {
        $set: {
          firstname: account.firstname,
          lastname: account.lastname,
          username: account.username,
          password: hashed.hashedPassword,
          salt: hashed.salt,
          email: account.email,
          idNumber: account.idNumber,
          question: account.question,
          answer: account.answer,
          userType: account.userType,
        },
      },
    ),
  );
};

accountSchema.statics.changePassword = (_id, password) => {
  const hashed = saltHashPassword(password);
  return to(
    Account.updateOne(
      {
        _id,
      },
      {
        password: hashed.hashedPassword,
        salt: hashed.salt,
      },
    ),
  );
};

accountSchema.statics.deleteAccount = accountID => {
  return to(
    Account.deleteOne({
      _id: accountID,
    }),
  );
};

accountSchema.statics.addBookHistory = (accountId, bookId, logId) => {
  return to(
    Account.updateOne(
      {
        _id: accountId,
      },
      {
        $push: {
          bookHistory: {
            book: bookId,
            log: logId,
          },
        },
      },
    ),
  );
};

accountSchema.statics.addReviewHistory = (accountId, reviewId) => {
  return to(
    Account.updateOne(
      {
        _id: accountId,
      },
      {
        $push: {
          reviewHistory: reviewId,
        },
      },
    ),
  );
};

const genRandomString = length => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

const sha512 = (password, salt) => {
  const hash = crypto.createHmac(
    'sha512',
    salt,
  ); /** Hashing algorithm sha512 */
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt,
    hashedPassword: value,
  };
};

function saltHashPassword(userpassword) {
  const salt = genRandomString(16); /** Gives us salt of length 16 */
  const passwordData = sha512(userpassword, salt);
  return {
    hashedPassword: passwordData.hashedPassword,
    salt,
  };
}

const Account = mongoose.model('Account', accountSchema, 'accounts');

export default Account;
