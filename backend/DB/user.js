const Joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  status: {
    type: String,
    default: "IA",
  },
});

userSchema.methods.encryptPassword = async function () {
  const hasedPassword = await bcrypt
    .hash(this.password, 10)
    .catch((error) => console.log("hassing error: ", error));
  return hasedPassword;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  // console.log(user);
  const scheme = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().alphanum().min(5).max(1024).required(),
  });
  // console.log(scheme.validate(user));
  return scheme.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;
