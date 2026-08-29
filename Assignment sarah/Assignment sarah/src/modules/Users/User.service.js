import {
  findOne,
  findById,
  findByIdAndUpdate,
  updateOne,
  deleteOne,
} from "../../DB/database.repositly.js";
import UserModel from "../../DB/models/user.model.js";
import { successResponse } from "../../Utils/response/sucess.response.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import { compareHash, generateHash } from "../../Utils/security/hash.security.js";
import { HashEnum, RoleEnum } from "../../Utils/enums/user.enum.js";

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

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const isValidOldPassword = await compareHash({
    plaintext: oldPassword,
    ciphertext: req.user.password,
    algorithm: HashEnum?.Argon2 || "Argon2",
  });

  if (!isValidOldPassword) throw BadRequestException("Invalid Credentials");

  const hashedPassword = await generateHash({
    plaintext: newPassword,
    algorithm: HashEnum?.Argon2 || "Argon2",
  });

  await updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    update: { password: hashedPassword },
  });

  successResponse({ res, message: "Password Updated Successfully" });
};

export const freezeAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUserId = userId || req.user._id;

  if (
    targetUserId.toString() !== req.user._id.toString() &&
    req.user.role !== RoleEnum?.ADMIN &&
    req.user.role !== RoleEnum?.Admin
  ) {
    const error = new Error("You are not authorized to freeze this account");
    error.statusCode = 403;
    throw error;
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: targetUserId, freezedAt: { $exists: false } },
    {
      freezedBy: req.user._id,
      freezedByRole: req.user.role,
      freezedAt: new Date(),
      $unset: { restoredBy: true, restoredAt: true },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw NotFoundException("User Not Found or account is already frozen");
  }

  successResponse({
    res,
    message: "Frozen Successfully",
    statusCode: 200,
    data: { updatedUser },
  });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUserId = userId || req.user._id;

  const user = await findById({ model: UserModel, id: targetUserId });
  if (!user || !user.freezedAt) {
    throw NotFoundException("User Not Found or Accouont is not Frozen");
  }

  if (user.freezedByRole === RoleEnum.Admin || user.freezedByRole === RoleEnum.ADMIN) {
    if (req.user.role !== RoleEnum.Admin && req.user.role !== RoleEnum.ADMIN) {
      const error = new Error("This account was frozen by an admin. Only an Admin can restore it.");
      error.statusCode = 403;
      throw error;
    }
  } else {
    if (
      targetUserId.toString() !== req.user._id.toString() &&
      req.user.role !== RoleEnum.Admin &&
      req.user.role !== RoleEnum.ADMIN
    ) {
      const error = new Error("You are not authorized to restore this account");
      error.statusCode = 403;
      throw error;
    }
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: targetUserId },
    {
      restoredAt: new Date(),
      restoredBy: req.user._id,
      $unset: { freezedAt: true, freezedBy: true, freezedByRole: true },
    },
    { new: true }
  );

  successResponse({
    res,
    message: "Restores Successfully",
    statusCode: 200,
    data: { updatedUser },
  });
};

export const hardDelete = async (req, res) => {
  const { userId } = req.params;

  const results = await deleteOne({
    model: UserModel,
    filter: { _id: userId },
  });

  if (!results.deletedCount) throw NotFoundException("User Not Found");

  successResponse({
    res,
    message: "User Deleted Successfully",
    statusCode: 200,
  });
};