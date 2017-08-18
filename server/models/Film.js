const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  originalTitle: {
    type: String
  },
  posterPath: {
    type: String
  },
  backdropPath: {
    type: String
  },
  overview: {
    type: String
  },
  releaseDate: {
    type: String
  },
  genres: {
    type: [String]
  },
  placeToFind: {
    type: String
  },
  _account: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  }
});

module.exports = mongoose.model('Film', schema);
