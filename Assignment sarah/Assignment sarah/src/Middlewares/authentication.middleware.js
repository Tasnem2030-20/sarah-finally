import { TokenTypeEnum, SignatureEnum } from "../Utils/enums/user.enum.js";
import UserModel from "../DB/Models/user.model.js";
import TokenModel from "../DB/Models/token.model.js";
import { findOne, findById } from "../DB/database.repositly.js";
import {
  UnauthorizedException,
  NotFoundException,
} from "../Utils/response/error.response.js";
import { getSignature, verifyToken } from "../Utils/tokens/token.js";

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

  // Check if token is revoked
  if (await findOne({ model: TokenModel, filter: { jti: decoded.jti } })) {
    throw UnauthorizedException({ message: "Token is Revoked" });
  }

  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Not Registered Account" });

  // طباعة قيم وقت تغيير البيانات ووقت إصدار التوكن للـ Debugging
  console.log(user.changeCredentialsTime?.getTime(), decoded.iat);

  // التحقق مما إذا تم تغيير البيانات بعد تاريخ إنشاء التوكن
  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw UnauthorizedException({ message: "Token is Expired due to password change" });
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