/**
 * Structured logger utility for EasyPOS.
 * Support for different environments and module-based logging.
 */

const IS_DEV = import.meta.env.MODE === 'development';

const createLogger = (moduleName) => {
  const formatMsg = (level, msg, data) => {
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${level.toUpperCase()}] [${moduleName}]: ${msg}`, data || ''];
  };

  return {
    debug: (msg, data) => {
      if (IS_DEV) console.debug(...formatMsg('debug', msg, data));
    },
    info: (msg, data) => {
      if (IS_DEV) console.info(...formatMsg('info', msg, data));
    },
    warn: (msg, data) => {
      console.warn(...formatMsg('warn', msg, data));
    },
    error: (msg, data) => {
      console.error(...formatMsg('error', msg, data));
    }
  };
};

export default createLogger;
