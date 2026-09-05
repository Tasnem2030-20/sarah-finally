import dotenv from "dotenv";
import path from "node:path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./DB/Connection.js";
import { redisConnection } from "./DB/Models/redis-connection.js"; 
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import { attachRouterWithLogger } from "./Utils/loggers/morgan.logger.js";
import { sendEmail } from "./Utils/email/email.utils.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response.js";
import { successResponse } from "./Utils/response/sucess.response.js";
import { customRateLimiter } from "./Middlewares/rate-limte.middleware.js";

dotenv.config({ path: path.resolve("config/dev.env") });

const bootstrap = async (app, express) => {
  app.use(
    express.json(),
    cors(corsOptions()),
    helmet(),
    morgan("tiny"),
    customRateLimiter(),
  );

  await connectDB();
  await redisConnection();

  app.get("/", (req, res) => {
    successResponse({
      res,
      statusCode: 200,
      message: "Hello From Sara7a App API",
    });
  });

  attachRouterWithLogger(app, "/api/v1/auth", authRouter, "access.log");

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/user", userRouter);

  app.all("/*dummy", (req, res, next) => {
    throw NotFoundException("Not Found Handler!!");
  });

  app.use(globalErrorHandler);
};

export default bootstrap;