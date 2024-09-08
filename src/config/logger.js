import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  default: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export default logger
