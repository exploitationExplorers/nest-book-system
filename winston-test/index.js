// import winston from 'winston'
// import 'winston-daily-rotate-file'
// const logger = winston.createLogger({
//     level: 'debug',
//     format: winston.format.combine(
//         winston.format.label({label: '日志'}),
//         winston.format.timestamp(),
//         winston.format.colorize(),
//         winston.format.simple(),
        
//     ),
//     transports: [
//         new winston.transports.Console(),
//     ]
// })

// logger.info('111');
// logger.error('error');
// logger.debug(66666666);


import winston from 'winston';

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ 
            dirname: 'log3',
            filename: 'test.log',
            format: winston.format.json()
        }),
    ]
});

logger.info('111');
logger.error('error');
logger.debug(66666666);