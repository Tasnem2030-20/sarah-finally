import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { createOne, findOne, create, updateOne } from "../../DB/database.repositly.js";
import UserModel from "../../DB/Models/user.model.js";
import TokenModel from "../../DB/Models/token.model.js";
import { generateHash, compareHash } from "../../Utils/security/hash.security.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN } from "../../../config/config.service.js";
import { ProviderEnum, LogoutTypeEnum } from "../../Utils/enums/user.enum.js";

const successResponse = ({ res, statusCode = 200, message = "Success", data = {} }) => {
  return res.status(statusCode).json({ message, data });
};

const getNewLoginCredentials = async (user) => {
  const token = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: Number(ACCESS_TOKEN_EXPIRES_IN) || "1h",
    audience: ["web", "mobile"],
    issuer: "Sara7aApp",
    subject: "User Authentication",
  });
  return { token };
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  return ticket.getPayload();
}

export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const isUserExist = await findOne({
      model: UserModel,
      filter: { email },
    });

    if (isUserExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await generateHash({ plaintext: password });

    const user = await createOne({
      model: UserModel,
      data: { firstName, lastName, username, email, password: hashedPassword },
    });

    return successResponse({
      res,
      statusCode: 201,
      message: "User created successfully 🎉",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findOne({
      model: UserModel,
      filter: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.provider === ProviderEnum.GOOGLE && !user.password) {
      return res.status(400).json({ message: "Please login via Google" });
    }

    const isMatch = await compareHash({
      plaintext: password,
      ciphertext: user.password,
      algorithm: HashEnum.Bcrypt,
    });

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const credentials = await getNewLoginCredentials(user);
    return successResponse({
      res,
      message: "User logged in successfully",
      data: { credentials },
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;
    const credentials = await getNewLoginCredentials(user);

    return successResponse({
      res,
      message: "Done",
      data: { credentials },
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleAccount({ idToken });
    const { email, given_name, family_name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Email not verified by Google" });
    }

    let user = await findOne({ model: UserModel, filter: { email } });

    if (!user) {
      user = await createOne({
        model: UserModel,
        data: {
          firstName: given_name,
          lastName: family_name,
          email,
          profilePic: picture,
          provider: ProviderEnum.GOOGLE,
          isConfirmed: true,
        },
      });
    }

    const credentials = await getNewLoginCredentials(user);

    return successResponse({
      res,
      message: "Login Successfully",
      data: { credentials },
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({ message: "Google Auth Failed", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { flag } = req.body;
    let status = 200;

    switch (flag) {
      case LogoutTypeEnum.logout:
        await create({
          model: TokenModel,
          data: [
            {
              jti: req.decoded.jti,
              userId: req.user._id,
              expiresIn: new Date(req.decoded.exp * 1000),
            },
          ],
        });
        status = 201;
        break;

      case LogoutTypeEnum.logoutFromAll:
        await updateOne({
          model: UserModel,
          filter: { _id: req.user._id },
          update: {
            changeCredentialsTime: Date.now(),
          },
        });
        status = 200;
        break;
    }

    return successResponse({
      res,
      statusCode: status,
      message: "Logout Successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};