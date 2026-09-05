import joi from "joi";
import { Types } from "mongoose";
import { GenderEnum, RoleEnum, ProviderEnum } from "../Utils/enums/user.enum.js";

export const generalFields = {
  firstName: joi.string().alphanum().min(3).max(25).required().messages({
    "any.required": "FirstName is required",
    "string.min": "FirstName must be at least 3 characters long",
    "string.max": "FirstName must be at most 25 characters long",
  }),
  lastName: joi.string().alphanum().min(3).max(25).required().messages({
    "any.required": "LastName is required",
    "string.min": "LastName must be at least 3 characters long",
    "string.max": "LastName must be at most 25 characters long",
  }),
  username: joi.string().alphanum().min(3).max(25).required(),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net", "org"] },
  }).required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
    "any.only": "Confirm password does not match password",
    "any.required": "Confirm password is required",
  }),
  age: joi.number().positive().integer(),
  phone: joi
    .string()
    .pattern(/^01[0125]{1}\d{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Phone Number",
      "any.required": "Phone number is required",
    }),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId Format")
    );
  }),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  role: joi.string().valid(...Object.values(RoleEnum)),
  provider: joi.string().valid(...Object.values(ProviderEnum)),
};

const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];

    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResults.error) {
        validationError.push({
          key,
          details: validationResults.error.details.map((d) => d.message),
        });
      }
    }

    if (validationError.length) {
      return res.status(400).json({
        message: "ValidationError",
        errors: validationError,
      });
    }

    return next();
  };
};

export default validation;