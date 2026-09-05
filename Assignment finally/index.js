import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve("config/dev.env") });

import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "./src/Utils/events/email.events.js";

import express from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";
import chalk from "chalk";

const app = express();

await bootstrap(app, express);

app.listen(PORT, () => {
  console.log(chalk.bgBlue(`Example app listening on port ${PORT}!`));
});