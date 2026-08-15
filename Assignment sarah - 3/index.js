import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("config/dev.env") });

import express from "express";
import appController from "./src/app.controller.js";

const app = express();
appController(app, express);