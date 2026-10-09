const sanitizeLogMessage = (msg) => {
  if (!msg) return msg;
  let str = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
  // Redact apikey=... from any string or URL
  str = str.replace(/apikey=([^&"\s]+)/gi, 'apikey=[REDACTED]');
  return str;
};

const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${sanitizeLogMessage(msg)}`, ...args.map(sanitizeLogMessage)),
  warn: (msg, ...args) => console.warn(`[WARN] ${sanitizeLogMessage(msg)}`, ...args.map(sanitizeLogMessage)),
  error: (msg, ...args) => console.error(`[ERROR] ${sanitizeLogMessage(msg)}`, ...args.map(sanitizeLogMessage)),
  sanitize: sanitizeLogMessage,
};

module.exports = logger;
