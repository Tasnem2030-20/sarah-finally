import { toomanyrequestsException } from "../Utils/response/error.response.js";

const ipRequest = {};
let blockedIps = new Set();
let unblockedTimer = new Map();
const RATE_LIMIT = 50;
const WINDOW_MS = 2 * 60 * 1000;

export const customRateLimiter = () => {
  return (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();

    if (blockedIps.has(ip)) {
      return toomanyrequestsException({
        message: "Too many requests, please try again later.",
      });
    }

    if (!ipRequest[ip]) {
      ipRequest[ip] = { count: 1, startTime: currentTime };
      return next();
    }

    const diffTime = currentTime - ipRequest[ip].startTime;

    if (diffTime < WINDOW_MS) {
      ipRequest[ip].count++;

      if (ipRequest[ip].count > RATE_LIMIT) {
        blockedIps.add(ip);

        if (!unblockedTimer.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            unblockedTimer.delete(ip);
            delete ipRequest[ip];
          }, WINDOW_MS);
          unblockedTimer.set(ip, timer);
        }

        return TooManyRequestsException({
          message: "Too many requests, please try again later.",
        });
      }
    } else {
      ipRequest[ip] = { count: 1, startTime: currentTime };
    }

    next();
  };
};
