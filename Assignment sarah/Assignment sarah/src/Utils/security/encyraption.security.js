import crypto from "node:crypto";
import { ENC_BYTE } from "../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from(ENC_BYTE); // must be 32 bytes

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedData) => {
  const [ivHex, encryptedText] = encryptedData.split(":");

  const binaryLikeIv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryLikeIv
  );

  let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};