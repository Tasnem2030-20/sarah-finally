import fs from "node:fs";
import multer from "multer";
import path from "node:path";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg", "image/gif"],
  videos: ["video/mp4", "video/mpeg", "video/jpeg", "video/mj2"],
  audios: ["audio/3gpp2", "audio/aac", "audio/mp3"],
  documents: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) userBasePath += `/${req.user._id}`;
      const fullPath = path.resolve(`./src/${userBasePath}`);

      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      cb(null, path.resolve(fullPath));
    },

    filename: (req, file, cb) => {
      const uniqueFilename =
        Date.now() +
        "_" +
        Math.round(Math.random() * 1e9) +
        "_" +
        file.originalname;

      const userId = req.user?._id || "guest";
      file.finalPath = `${basePath}/${userId}/${uniqueFilename}`;
      cb(null, uniqueFilename);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (validation.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Invalid File Type"), false);
  };

  return multer({ fileFilter, storage });
};