import joi from "joi";
import { Types } from "mongoose";
import { BadRequestException } from "../Utils/response/error.response.js";
import { GenderEnum, RoleEnum, ProviderEnum } from "../Utils/enums/user.enum.js";
export const generalFields = {
  firstName: joi.string().alphanum().min(3).max(25).messages({
    "string.min": "FirstName must be at least 3 character long",
    "string.max": "FirstName must be at most 25 character long",
  }),
  lastName: joi.string().alphanum().min(3).max(25).messages({
    "any.required": "LastName is required",
    "string.min": "LastName must be at least 3 character long",
    "string.max": "LastName must be at most 25 character long",
  }),
  username: joi.string().alphanum().min(3).max(25),
  email: joi.string().email({
    minDomainSegments: 1,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net", "org"] },
  }),
  password: joi.string(),
  confirmPassword: joi.ref("password"),
  age: joi.number().positive().integer(),
  phone: joi
    .string()
    .pattern(/^01[0125]{1}\d{8}$/)
    .messages({
      "string.pattern.base": "Invalid Phone Number",
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
          details: validationResults.error.details,
        });
      }
    }

    if (validationError.length) {
      throw BadRequestException("ValidationError", validationError);
    }

    return next();
  };
};

export default validation;