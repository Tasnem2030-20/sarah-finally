import { Router } from "express";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { authentication, authorization } from "../../Middlewares/authentication.middleware.js";
import { localFileUpload, fileValidation } from "../../Utils/multer/local.multer.js";
import validation from "../../Middlewares/validation.middleware.js";
import * as userValidation from "./User.validation.js";
import * as userService from "./User.service.js";

const router = Router();

if (userService?.updateProfilePic) {
  router.patch(
    "/upload-file",
    authentication({ tokenType: TokenTypeEnum?.ACCESS || "access" }),
    authorization({ accessRoles: [RoleEnum?.Admin, RoleEnum?.User] }),
    localFileUpload({
      customPath: "users",
      validation: fileValidation.images,
    }).single("attachments"),
    userService.updateProfilePic
  );

  router.patch(
    "/cover-upload-file",
    authentication({ tokenType: TokenTypeEnum?.ACCESS || "access" }),
    authorization({ accessRoles: [RoleEnum?.Admin, RoleEnum?.User] }),
    localFileUpload({
      customPath: "users",
      validation: fileValidation.videos,
    }).single("attachments"),
    userService.updateProfilePic
  );
}

if (userService?.updatePassword) {
  router.patch(
    "/update-password",
    authentication({ tokenType: TokenTypeEnum?.ACCESS || "access" }),
    authorization({ accessRoles: [RoleEnum?.Admin, RoleEnum?.User] }),
    validation(userValidation?.updatePasswordSchema),
    userService.updatePassword
  );
}

if (userService?.freezeAccount) {
  router.delete(
    ["/freeze-account", "/freeze-account/:userId"],
    authentication({ tokenType: TokenTypeEnum?.ACCESS || "access" }),
    authorization({ accessRoles: [RoleEnum?.Admin, RoleEnum?.User] }),
    validation(userValidation?.freezeSchema),
    userService.freezeAccount
  );
}

if (userService?.restoreAccount) {
  router.patch(
    ["/restore-account", "/restore-account/:userId"],
    authentication({ tokenType: TokenTypeEnum?.ACCESS || "access" }),
    authorization({ accessRoles: [RoleEnum?.Admin] }),
    validation(userValidation?.restoreSchema || userValidation?.freezeSchema),
    userService.restoreAccount
  );
}
router.patch(
  "/:userId/hard-delete-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  validation(userValidation.hardDeleteSchema),
  userService.hardDelete
);

export default router;