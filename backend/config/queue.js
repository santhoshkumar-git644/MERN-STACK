// BullMQ requires Redis lists, hashes, and streams, which are not supported by CacheX.
// Therefore, we disable the queue when using CacheX.

const connection = null;
const emailQueue = null;

const addEmailJob = async (jobName, payload) => {
  console.warn(`[Queue] Ignored job ${jobName} because BullMQ is disabled (incompatible with CacheX).`);
};

module.exports = { emailQueue, addEmailJob, connection };
