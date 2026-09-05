import { create, findOne, find, findById } from "../../DB/database.repositly.js";
import MessageModel from "../../DB/Models/message.model.js";
import UserModel from "../../DB/Models/user.model.js";
import { NotFoundException } from "../../Utils/response/error.response.js";

const successResponse = ({ res, statusCode = 200, message = "Success", data = {} }) => {
  return res.status(statusCode).json({ message, data });
};

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  const receiver = await findOne({
    model: UserModel,
    filter: {
      _id: receiverId,
      freezedAt: { $exists: false },
    },
  });

  if (!receiver) {
    throw NotFoundException("Receiver not found or account is freezed");
  }

  const messsage = await create({
    model: MessageModel,
    data: [
      {
        content,
        receiverId,
      },
    ],
  });

  return successResponse({
    res,
    message: "Message Sent Successfully",
    statusCode: 201,
    data: { messsage },
  });
};

export const getMessages = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const receiverId = req.user._id;

  const skip = (page - 1) * limit;

  const [messages, totalMessage] = await Promise.all([
    find({
      model: MessageModel,
      filter: { receiverId },
      options: {
        sort: { createdAt: -1 },
        skip: Number(skip),
        limit: Number(limit),
      },
    }),
    MessageModel.countDocuments({ receiverId }),
  ]);

  return successResponse({
    res,
    message: "Inbox Retrived Successfully",
    statusCode: 200,
    data: {
      messsage: messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalMessage / limit),
        totalMessage,
      },
    },
  });
};

export const toggleRead = async (req, res) => {
  const { messageId } = req.params;
  const receiverId = req.user._id;

  const message = await findById({ model: MessageModel, id: messageId });
  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NotFoundException("Message Not Found or Unauthorized");

  message.isRead = !message.isRead;
  await message.save();

  return successResponse({
    res,
    message: `Message Marked as ${message.isRead ? "read" : "unread"}`,
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};

export const toggleFavorites = async (req, res) => {
  const { messageId } = req.params;
  const receiverId = req.user._id;

  const message = await findById({ model: MessageModel, id: messageId });
  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NotFoundException("Message Not Found or Unauthorized");

  message.isFavorite = !message.isFavorite;
  await message.save();

  return successResponse({
    res,
    message: message.isFavorite ? "Added to Favorite" : "Removed from Favorite",
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};