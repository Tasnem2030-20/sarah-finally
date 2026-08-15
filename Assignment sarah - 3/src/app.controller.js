import dotenv from "dotenv";
import path from "node:path";
import cors from "cors";
import { connectDB } from "./DB/Connection.js";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response.js";
import { successResponse } from "./Utils/response/sucess.response.js";

dotenv.config({ path: path.resolve("config/dev.env") });

const bootstrap = async (app, express) => {
  app.use(express.json(), cors());

  await connectDB();

  app.get("/", (req, res) => {
    successResponse({
      res,
      statusCode: 200,
      message: "Hello From Sara7a App API",
    });
  });

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/user", userRouter);

  app.all("/*dummy", (req, res, next) => {
    throw NotFoundException("Not Found Handler!!");
  });

  app.use(globalErrorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
  });
};

export default bootstrap;