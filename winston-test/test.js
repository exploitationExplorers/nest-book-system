import winston from 'winston';

const console = new winston.transports.Console();

const file = new winston.transports.File({ filename: 'test.log' });

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple()
});

logger.clear();
logger.add(console);
logger.remove(console);
logger.add(file);


logger.info('111');
logger.error('error');
logger.debug(66666666);