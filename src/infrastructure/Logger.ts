import pino from "pino";

export class Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: "info",
      timestamp: false,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });

    this.info = this.logger.info.bind(this.logger);
    this.error = this.logger.error.bind(this.logger);
    this.warn = this.logger.warn.bind(this.logger);
    this.debug = this.logger.debug.bind(this.logger);

    this.success = this.logger.info.bind(this.logger);
  }

  public info: (...args: unknown[]) => void;
  public error: (...args: unknown[]) => void;
  public warn: (...args: unknown[]) => void;
  public debug: (...args: unknown[]) => void;
  public success: (...args: unknown[]) => void;

  child() {
    return this;
  }
}
