import { Router } from "express";
import { RoleEnum } from "../../Utils/enums/user.enum.js";
import { authentication, authorization } from "../../Middlewares/authentication.middleware.js";
import { localFileUpload, fileValidation } from "../../Utils/multer/local.multer.js";
import * as userService from "./User.service.js";

const router = Router();

router.patch(
  "/upload-file",
  authentication({ tokenType: "access" }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({
    customPath: "users",
    validation: fileValidation.images,
  }).single("attachments"),
  userService.updateProfilePic
);

router.patch(
  "/cover-upload-file",
  authentication({ tokenType: "access" }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({
    customPath: "users",
    validation: fileValidation.videos,
  }).single("attachments"),
  userService.updateProfilePic
);

export default router;