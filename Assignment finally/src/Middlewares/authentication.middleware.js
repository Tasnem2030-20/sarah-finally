import { TokenTypeEnum, SignatureEnum } from "../Utils/enums/user.enum.js";
import UserModel from "../DB/Models/user.model.js";
import { findById } from "../DB/database.repositly.js";
import {
  UnauthorizedException,
  NotFoundException,
} from "../Utils/response/error.response.js";
import { getSignature, verifyToken } from "../Utils/tokens/token.js";
import { get, revokeTokenKey } from "../DB/Models/redis-service.js";

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
  if (!authorization) {
    throw UnauthorizedException({ message: "Authorization Header Required" });
  }

  const [Bearer, token] = authorization.split(" ") || [];

  let signature = await getSignature({
    signatureLevel:
      Bearer === "ADMIN"
        ? SignatureEnum.ADMIN
        : Bearer === "USER"
        ? SignatureEnum.User
        : new Error("Invalid Signature"),
  });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === TokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  const isRevoked = await get(
    revokeTokenKey({ userId: decoded.id, jti: decoded.jti })
  );

  if (isRevoked) {
    throw UnauthorizedException({ message: "Token is Revoked" });
  }

  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Not Registered Account" });

  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw UnauthorizedException({
      message: "Token is Expired due to password change",
    });
  }

  return { user, decoded };
};

export const authentication = ({ tokenType = TokenTypeEnum.Access } = {}) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};