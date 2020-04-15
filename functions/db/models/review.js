import mongoose from 'mongoose';
import moment from 'moment';
import to from '../../util/to';

const {Schema} = mongoose;
const Book = require('./book');
const Account = require('./account');

const reviewSchema = new Schema({
  time: String,
  content: String,
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
  dateCreated: {
    type: Date,
    default: () => moment(),
  },
});

reviewSchema.statics.addReview = (review, callback) => {
  return to(review.save().then(callback));
};

reviewSchema.statics.findReviewsByAccount = id => {
  return to(
    Review.find({
      account: id,
    }).populate('book account'),
  );
};

reviewSchema.statics.findReviewsByBook = id => {
  return to(
    Review.find({
      book: id,
    }).populate('book'),
  );
};

reviewSchema.statics.updateReview = async (reviewId, content) => {
  return to(
    Review.updateOne(
      {
        _id: reviewId,
      },
      {
        content,
        time: moment().format(),
      },
      {
        new: true,
      },
    ),
  );
};

reviewSchema.statics.deleteReview = async reviewId => {
  return to(
    Review.deleteOne({
      _id: reviewId,
    }),
  );
};

reviewSchema.statics.deleteReviewByAccount = async accountId => {
  return to(
    Review.deleteMany({
      accountId,
    }),
  );
};

const Review = mongoose.model('Review', reviewSchema, 'reviews');

export default Review;
