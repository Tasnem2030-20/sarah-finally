import { findOne, create, updateOne } from "../../DB/database.repositly.js";
import UserModel from "../../DB/Models/user.model.js";
import { generateHash, compareHash } from "../../Utils/security/hash.security.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { generateOTP } from "../../Utils/generateOtp.utils.js";
import { emailEvents } from "../../Utils/events/email.events.js";
import { NotFoundException, BadRequestException } from "../../Utils/response/error.response.js";
import { set, revokeTokenKey } from "../../DB/Models/redis-service.js";
import { ACCESS_TOKEN_ADMIN_EXPIRES_IN } from "../../../config/config.service.js";
import { getNewLoginCredentials } from "../../Utils/tokens/token.js";

const successResponse = ({ res, statusCode = 200, message = "Success", data = {} }) => {
  return res.status(statusCode).json({ message, data });
};

export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, phone } = req.body;

    if (await findOne({ model: UserModel, filter: { email } })) {
      return res.status(409).json({ message: "User already exists" });
    }

    const otp = await generateOTP();
    const OtpHashed = await generateHash({
      plaintext: String(otp),
      algorithm: HashEnum.Argon2,
    });

    const hashedPassword = await generateHash({
      plaintext: password,
      algorithm: HashEnum.Bcrypt,
    });

    const user = await create({
      model: UserModel,
      data: [
        {
          firstName,
          lastName,
          username: username || firstName,
          email,
          password: hashedPassword,
          phone,
          confirmEmailOTP: OtpHashed,
        },
      ],
    });

    emailEvents.emit("confirmEmail", { 
      to: email, 
      otp, 
      username: username || firstName || "User" 
    });

    return successResponse({
      res,
      statusCode: 201,
      message: "User created successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const logoutWithRedis = async (req, res) => {
  await set({
    key: revokeTokenKey({ userId: req.user._id, jti: req.decoded.jti }),
    value: req.decoded.jti,
    ttl: req.decoded.iat + Number(ACCESS_TOKEN_ADMIN_EXPIRES_IN),
  });

  return successResponse({
    res,
    message: "Logout Successfully",
    statusCode: 200,
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findOne({ model: UserModel, filter: { email } });
  if (!user) throw NotFoundException("User not found");

  const isMatch = await compareHash({
    plaintext: String(otp),
    ciphertext: user.confirmEmailOTP,
    algorithm: HashEnum.Argon2,
  });

  if (!isMatch) throw BadRequestException("Invalid OTP");

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: Date.now(),
      $unset: {
        confirmEmailOTP: true,
      },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User Confirmed successfully",
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!user) throw NotFoundException("User not found");

  const isMatch = await compareHash({
    plaintext: password,
    ciphertext: user.password,
    algorithm: HashEnum.Bcrypt,
  });
  if (!isMatch) throw BadRequestException("Invalid credentials");

  const tokens = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "User Logged in successfully",
    data: { tokens },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = generateOTP();
  const hashedOtp = await generateHash({
    plaintext: String(otp),
    algorithm: HashEnum.Argon2,
  });

  const user = await findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
    update: {
      forgetPasswordOTP: hashedOtp,
    },
  });

  if (!user) throw NotFoundException("User Not Found");
  emailEvents.emit("forgetPassword", {
    to: email,
    otp,
    username: user.username || user.firstName || "User",
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Reset password OTP sent successfully",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) throw NotFoundException("User Not Found");

  const isValidOtp = await compareHash({
    plaintext: String(otp),
    ciphertext: user.forgetPasswordOTP,
    algorithm: HashEnum.Argon2,
  });

  if (!isValidOtp) throw BadRequestException("Invalid OTP");

  const hashedPassword = await generateHash({
    plaintext: password,
    algorithm: HashEnum.Bcrypt,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashedPassword,
      $unset: { forgetPasswordOTP: true },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password reset successfully",
  });
};