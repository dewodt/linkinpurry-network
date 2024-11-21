import winston from 'winston';

/**
 * Logger class to log messages
 * using winston logger
 */
class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private readonly levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  private readonly colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  };

  private constructor() {
    winston.addColors(this.colors);
    this.logger = this.createLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.errors({ stack: true }),
      winston.format.padLevels(),
      winston.format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label'],
      })
    );
  }

  private createTransports(): winston.transport[] {
    return [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
      }),
    ];
  }

  private createLogger(): winston.Logger {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      levels: this.levels,
      format: this.createFormat(),
      transports: this.createTransports(),
      exitOnError: false,
    });
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public http(message: string): void {
    this.logger.http(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}

export const logger = Logger.getInstance();
