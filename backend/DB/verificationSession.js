const Joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const verificationSessionSchema = new mongoose.Schema({
  randomId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  expireeAt: {
    type: Date,
    require: true,
    default: new Date(Date.now() + 60 * 2 * 1000),
  },
});

const verificationSession = mongoose.model(
  "verificationSession",
  verificationSessionSchema
);

function validateverificationSession(data) {
  // console.log(data);
  const scheme = Joi.object({
    randomId: Joi.string().required(),
    email: Joi.string().min(5).max(255).email().required(),
  });
  // console.log(scheme.validate(data));
  return scheme.validate(data);
}

module.exports.verificationSession = verificationSession;
module.exports.validateverificationSession = validateverificationSession;
