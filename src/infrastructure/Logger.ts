import { BaileysLogger, pinoLogger } from "../shared/utils/BaileysLogger";

export class Logger {
  private logger: BaileysLogger;

  constructor() {
    this.logger = pinoLogger;

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
