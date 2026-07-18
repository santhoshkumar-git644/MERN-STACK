const { Queue } = require('bullmq');

// We use the same Redis connection settings, but pass connection options directly to BullMQ
// because BullMQ requires specific client options to not block standard queries.
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 3) {
      return null; // Stop retrying after 3 attempts
    }
    return Math.min(times * 50, 2000);
  }
};

let emailQueue = null;

try {
  emailQueue = new Queue('email-queue', { connection });
  
  // Catch Redis connection errors for the queue to prevent crash/spam
  emailQueue.on('error', (err) => {
    // Suppress repeated connection errors
  });
} catch (error) {
  console.warn('Failed to initialize BullMQ emailQueue. Queueing will fail gracefully if Redis is down.');
}

const addEmailJob = async (jobName, payload) => {
  if (emailQueue) {
    try {
      await emailQueue.add(jobName, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      });
      console.log(`[Queue] Added job: ${jobName}`);
    } catch (error) {
      console.warn(`[Queue] Failed to add job ${jobName}:`, error.message);
    }
  } else {
    console.warn(`[Queue] Ignored job ${jobName} because BullMQ is not initialized.`);
  }
};

module.exports = { emailQueue, addEmailJob, connection };
