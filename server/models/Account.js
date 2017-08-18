const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');
require('mongoose-type-email');

const schema = new Schema({
  password: {
    type: String,
    required: true
  },
  email: {
    type: Schema.Types.Email,
    required: true,
    unique: true
  }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Account', schema);
