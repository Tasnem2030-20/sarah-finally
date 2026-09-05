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
import { v4 as uuid } from "uuid";
import { SignatureEnum, RoleEnum } from "../enums/user.enum.js";
import { set, revokeTokenKey } from "../../DB/Models/redis-service.js";

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

  const jwtid = uuid();

  const accessToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.accessSignature,
    options: { expiresIn: accessExpires, jwtid },
  });

  const refreshToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.refreshSignature,
    options: { expiresIn: refreshExpires, jwtid },
  });

  await set({
    key: revokeTokenKey({ userId: user._id, jti: jwtid }),
    value: jwtid,
    ttl: refreshExpires,
  });

  return {
    accessToken,
    refreshToken,
  };
};