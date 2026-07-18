const redisClient = require('../config/redis');

/**
 * Cache middleware
 * @param {string|Function} key - Cache key or function that generates the key
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (key, ttl = 60) => async (req, res, next) => {
  if (!redisClient || redisClient.status !== 'ready') {
    return next(); // Bypass cache if Redis is down
  }

  const cacheKey = typeof key === 'function' ? key(req) : key;

  try {
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Override res.json to capture response and cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.set(cacheKey, JSON.stringify(body), 'EX', ttl).catch(err => {
          console.warn('Cache set error:', err.message);
        });
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.warn('Cache middleware error:', error.message);
    next();
  }
};

const invalidateCache = async (pattern) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.warn('Cache invalidation error:', error.message);
  }
};

module.exports = { cacheMiddleware, invalidateCache };
