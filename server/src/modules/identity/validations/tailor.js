import Joi, { symbol } from "joi";
import passwordComplexity from "joi-password-complexity";

const passwordOptions = {
  max: 30,
  min: 8,
  numeric: 1,
  upperCase: 1,
  lowerCase: 1,
  symbol: 1,
  requirementCount: 4,
};

export const handleTailorRegister = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).min(3).trim().required(),
    lastName: Joi.string().max(50).min(3).trim().required(),
    email: Joi.string().email().trim().required(),
    password: passwordComplexity(passwordOptions).required(),
    role: Joi.string().valid("tailor", "customer").required(),
  });

  return schema.validate(data, { abortEarly: true });
};
