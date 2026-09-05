import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import validation from "../../Middlewares/validation.middleware.js";
import * as messageService from "./message.service.js";
import * as messageValidation from "./message.validation.js";

const router = Router();

router.get(
  "/",
  authentication,
  messageService.getMessages
);

router.patch(
  "/toggle-read/:messageId",
  authentication,
  validation(messageValidation.toggleReadSchema),
  messageService.toggleRead
);

router.post(
  "/send-message/:receiverId",
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage
);

router.patch(
  "/toggle-favorites/:messageId",
  authentication,
  validation(messageValidation.toggleFavoritesSchema),
  messageService.toggleFavorites
);

export default router;