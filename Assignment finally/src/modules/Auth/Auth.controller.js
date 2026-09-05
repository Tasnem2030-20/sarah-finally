import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import * as authValidation from "./auth.validation.js";
import validation from "../../Middlewares/validation.middleware.js";

const router = Router();

if (authValidation?.signupSchema && authService?.signup) {
  router.post(
    "/signup",
    validation(authValidation.signupSchema),
    authService.signup
  );
}

if (authValidation?.confirmEmailSchema && authService?.confirmEmail) {
  router.patch(
    "/confirm-email",
    validation(authValidation.confirmEmailSchema),
    authService.confirmEmail
  );
}

if (authValidation?.forgetPasswordSchema && authService?.forgetPassword) {
  router.post(
    "/forget-password",
    validation(authValidation.forgetPasswordSchema),
    authService.forgetPassword
  );
}

if (authValidation?.resetPasswordSchema && authService?.resetPassword) {
  router.post(
    "/reset-password",
    validation(authValidation.resetPasswordSchema),
    authService.resetPassword
  );
}

if (authValidation?.loginSchema && authService?.login) {
  router.post(
    "/login",
    validation(authValidation.loginSchema),
    authService.login
  );
}

if (authService?.refreshToken) {
  router.post(
    "/refresh-token",
    authentication({ tokenType: TokenTypeEnum?.REFRESH || TokenTypeEnum?.Refresh }),
    authService.refreshToken
  );
}

if (authValidation?.socialLoginSchema && authService?.loginWithGoogle) {
  router.post(
    "/social-login",
    validation(authValidation.socialLoginSchema),
    authService.loginWithGoogle
  );
}

if (authService?.logout) {
  router.post(
    "/logout",
    authentication({ tokenType: TokenTypeEnum?.ACCESS || TokenTypeEnum?.Access }),
    authService.logout
  );
}

router.post(
  "/logout-with-redis",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logoutWithRedis
);

export default router;