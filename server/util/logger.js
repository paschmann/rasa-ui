const winston = require("winston");

class Logger {
  constructor(appliName) {
    this.appliName = appliName || "rasa-ui";

    this.logFormat = winston.format.printf(info => {
      const formattedDate = info.timestamp.replace("T", " ").replace("Z", "");
      return `${formattedDate}|${this.appliName}|${info.level}|${
        info.message
      };`;
    });

    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        this.logFormat
      ),
      transports: [new winston.transports.Console({})]
    });
  }
}

const logger = new Logger();

module.exports = logger;
