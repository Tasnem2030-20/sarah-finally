import joi from "joi";
import { Types } from "mongoose";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.not(joi.ref("oldPassword")).required().messages({
      "any.invalid": "New password cannot be the same as old password",
    }),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref("newPassword")).required().messages({
      "any.only": "Confirm password must match new password",
    }),
  }),
};

export const freezeSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId Format")
      );
    }),
  }),
};
export const restoreSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId Format")
      );
    }),
  }),
};
export const hardDeleteSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId Format")
      );
    }),
  }),
};