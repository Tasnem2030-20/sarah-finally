import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_USER_EXPIRES_IN,
  ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  REFRESH_TOKEN_USER_EXPIRES_IN,
  REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  ACCESS_TOKEN_USER_SECRET,
  REFRESH_TOKEN_USER_SECRET,
  ACCESS_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_ADMIN_SECRET,
} from "../../../config/config.service.js";
import { v4 as uuidv4 } from "uuid";
import { SignatureEnum, RoleEnum } from "../enums/user.enum.js";

export const generateToken = ({
  payload,
  secretKey,
  options = { expiresIn: Number(ACCESS_TOKEN_USER_EXPIRES_IN) },
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = SignatureEnum.User } = {}) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case SignatureEnum.Admin:
      signature.accessSignature = ACCESS_TOKEN_ADMIN_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_ADMIN_SECRET;
      break;

    case SignatureEnum.User:
    default:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
      break;
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const isUser = user.role !== RoleEnum.Admin;

  const signature = await getSignature({
    signatureLevel: isUser ? SignatureEnum.User : SignatureEnum.Admin,
  });

  const accessExpires = isUser
    ? Number(ACCESS_TOKEN_USER_EXPIRES_IN)
    : Number(ACCESS_TOKEN_ADMIN_EXPIRES_IN);

  const refreshExpires = isUser
    ? Number(REFRESH_TOKEN_USER_EXPIRES_IN)
    : Number(REFRESH_TOKEN_ADMIN_EXPIRES_IN);

  const jti = uuidv4();

  const accessToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.accessSignature,
    options: { expiresIn: accessExpires, jwtid: jti },
  });

  const refreshToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.refreshSignature,
    options: { expiresIn: refreshExpires, jwtid: jti },
  });

  return {
    accessToken,
    refreshToken,
  };
};