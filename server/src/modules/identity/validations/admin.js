import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const passwordOptions = {
  min: 8,
  max: 30,
  numeric: 1,
  lowerCase: 1,
  upperCase: 1,
  symbol: 1,
  requirementCount: 4,
};

export const handleAdminRegister = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).trim().required(),
    lastName: Joi.string().min(3).max(50).trim().required(),
    email: Joi.string().email().trim().required(),
    password: passwordComplexity(passwordOptions).required(),
    role: Joi.string().valid("tailor", "customer", "admin").required(),
  });

  return schema.validate(data, { abortEarly: true });
};
