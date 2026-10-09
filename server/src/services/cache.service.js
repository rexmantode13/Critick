const NodeCache = require('node-cache');

// Memory cache instance with 10 minute standard TTL (600 seconds)
const memoryCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
});

const cacheService = {
  get: (key) => memoryCache.get(key),
  set: (key, value, ttlInSeconds = 600) => memoryCache.set(key, value, ttlInSeconds),
  del: (key) => memoryCache.del(key),
  flush: () => memoryCache.flushAll(),
};

module.exports = cacheService;
