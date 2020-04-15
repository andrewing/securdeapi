import mongoose from 'mongoose';
import moment from 'moment';
import to from '../../util/to';

const {Schema} = mongoose;
const Book = require('./book');

const bookInstanceSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
  isAvailable: Boolean,
  dateAvailable: Date,
});

bookInstanceSchema.statics.addBookInstance = (bookInstance, callback) => {
  return to(bookInstance.save().then(callback));
};

bookInstanceSchema.statics.findBookInstanceById = async bookInstanceID => {
  return to(
    BookInstance.findOne({
      _id: bookInstanceID,
    }).populate('book'),
  );
};

bookInstanceSchema.statics.findAllBookInstances = async () => {
  return to(BookInstance.find().populate('book'));
};

bookInstanceSchema.statics.findAllAvailable = () => {
  return to(
    BookInstance.find({
      isAvailable: true,
    }).populate('book'),
  );
};

bookInstanceSchema.statics.findAllReserved = () => {
  return to(
    BookInstance.find({
      isAvailable: false,
    }).populate('book'),
  );
};

bookInstanceSchema.statics.borrowBookInstance = (_id, days) => {
  return to(
    BookInstance.updateOne(
      {
        _id,
      },
      {
        $set: {
          isAvailable: false,
          dateAvailable: moment().add(Number(days || '7'), 'd'),
        },
      },
    ),
  );
};

bookInstanceSchema.statics.returnBookInstance = _id => {
  return to(
    BookInstance.updateOne(
      {
        _id,
      },
      {
        $set: {
          isAvailable: true,
          dateAvailable: null,
        },
      },
    ),
  );
};

bookInstanceSchema.statics.deleteBookInstance = bookInstanceID => {
  return to(
    BookInstance.deleteOne({
      _id: bookInstanceID,
    }),
  );
};

bookInstanceSchema.statics.updateBookInstance = (_id, bookInstance) => {
  return to(
    BookInstance.updateOne(
      {
        _id,
      },
      {
        ...bookInstance,
      },
    ),
  );
};

const BookInstance = mongoose.model(
  'BookInstance',
  bookInstanceSchema,
  'bookinstances',
);

export default BookInstance;
