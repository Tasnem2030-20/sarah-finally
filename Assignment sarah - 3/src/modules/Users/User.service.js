import {
  findOne,
  findByIdAndUpdate,
} from "../../DB/database.repositly.js";
import UserModel from "../../DB/models/user.model.js";
import { successResponse } from "../../Utils/response/sucess.response.js";
import { BadRequestException } from "../../Utils/response/error.response.js";

const decrypt = (data) => data;

export const getProfile = async (req, res) => {
  const { user } = req;
  if (user?.phone) user.phone = decrypt(user.phone);
  successResponse({ res, statusCode: 200, data: { user } });
};

export const updateProfilePic = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw BadRequestException("User ID is required");
  }

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: userId,
    update: { profilePic: req.file?.finalPath },
  });

  successResponse({ res, statusCode: 200, data: { user }, message: "Profile picture updated successfully" });
};

export const updateCoverPic = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw BadRequestException("User ID is required");
  }

  const coverPictures = req.files?.map((file) => file.finalPath) || [req.file?.finalPath];

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: userId,
    update: { coverPictures },
  });

  successResponse({ res, statusCode: 200, data: { user }, message: "Cover picture updated successfully" });
};