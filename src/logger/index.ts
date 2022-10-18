import bunyan, { LogLevel } from 'bunyan';
import config from 'config';

const logLevel: LogLevel = config.get('App.logLevel');

const logger = bunyan.createLogger({
  name: 'ninja-node-js',
  stream: process.stdout,
  level: logLevel,
  serializers: { err: bunyan.stdSerializers.err }
});

export default logger;
