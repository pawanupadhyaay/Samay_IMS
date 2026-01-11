const Joi = require("joi");

function loginValidation(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(user);
}

module.exports.loginValidation = loginValidation;
