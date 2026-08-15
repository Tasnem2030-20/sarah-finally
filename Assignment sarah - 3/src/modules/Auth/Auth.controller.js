import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import * as authValidation from "./auth.validation.js";
import validation from "../../Middlewares/validation.middleware.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup
);

router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken
);

router.post(
  "/social-login",
  validation(authValidation.socialLoginSchema),
  authService.loginWithGoogle
);
router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logout
);

export default router;