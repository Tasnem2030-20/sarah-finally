import joi from "joi";

export const sendMessageSchema = {
  body: joi
    .object({
      content: joi.string().min(1).max(500).required(),
    })
    .required(),
  params: joi
    .object({
      receiverId: joi.string().hex().length(24).required(),
    })
    .required(),
};