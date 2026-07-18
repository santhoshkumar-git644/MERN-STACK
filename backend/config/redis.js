const Redis = require('ioredis');

// Fallback logic so the app doesn't crash if Redis isn't running locally
let redisClient = null;

try {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('Redis connection failed. Caching will be disabled.');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    }
  });

  let hasLoggedError = false;

  redisClient.on('error', (err) => {
    // Suppress repeated connection errors during retry attempts
    if (!hasLoggedError && redisClient.status === 'end') {
      console.warn(`[Warning] Redis is not running locally (${err.message}). Caching is safely disabled and the app will continue normally.`);
      hasLoggedError = true;
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

} catch (error) {
  console.warn('Failed to initialize Redis client. Caching disabled.');
}

module.exports = redisClient;
