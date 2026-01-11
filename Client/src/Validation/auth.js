import Joi from "joi";

const loginschema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(5).required(),
});

const signUpschema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(5).required(),
});

export function loginValidation(data) {
  const { error } = loginschema.validate(data);
  if (error) return error;

  return false;
}

export function signUpValidation(data) {
  const { error } = signUpschema.validate(data);

  if (error) return error;

  return false;
}
