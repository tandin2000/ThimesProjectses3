const winston = require('winston');

// Logger configuration
const logConfiguration = {
    'transports': [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                   format: 'MMM-DD-YYYY HH:mm:ss'
               }),
                winston.format.align(),
                winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),
        new winston.transports.File({
            level: 'error',
            // Create the log file in the current directory
            filename: 'logs/error.log',
            format: winston.format.combine(
                winston.format.timestamp({
                   format: 'MMM-DD-YYYY HH:mm:ss'
               }),
                winston.format.json()
            )
        })
    ]
};

// Create the logger
const logger = winston.createLogger(logConfiguration);

module.exports = logger;
