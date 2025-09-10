import { createLogger, format, transports } from 'winston';

const { combine, timestamp, label, errors, json } = format;

export const appLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: 'KainosCore KFD API' }),
    timestamp(),
    errors({ stack: true }),
    format.metadata({ fillExcept: ['level','message', 'timestamp', 'label']}),
    json()),
  transports: [new transports.Console()],
});

if (process.env.NODE_ENV !== 'production') {
  appLogger.format = combine(
    appLogger.format,
    format.prettyPrint(),
    format.colorize({ all: true }));
}
