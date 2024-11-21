// import path from 'path';
import winston from 'winston';

// Define severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add errors stack trace
  winston.format.errors({ stack: true }),
  // Add padding between levels
  winston.format.padLevels(),
  // Format the metadata
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
);

// Define which transports the logger must use
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
  }),

  // // Allow to print all the error level messages inside the error.log file
  // new winston.transports.File({
  //   filename: path.join('logs', 'error.log'),
  //   level: 'error',
  //   format: winston.format.combine(
  //     winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  //   ),
  // }),

  // // Allow to print all the messages inside the all.log file
  // new winston.transports.File({
  //   filename: path.join('logs', 'all.log'),
  //   format: winston.format.combine(
  //     winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  //   ),
  // }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});
