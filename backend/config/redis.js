const net = require('net');

class CacheXClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.status = 'connecting';
    this.client = new net.Socket();
    this.queue = [];
    this.buffer = '';
    this.connect();
  }
  
  connect() {
    this.client.connect(this.port, this.host, () => {
      console.log('✅ CacheX connected successfully');
      this.status = 'ready';
    });

    this.client.on('data', (data) => {
      this.buffer += data.toString();
      let pos;
      while ((pos = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.substring(0, pos).trim();
        this.buffer = this.buffer.substring(pos + 1);
        
        const resolve = this.queue.shift();
        if (resolve) {
          if (line === '(nil)' || line === 'Unknown command') {
            resolve(null);
          } else {
            resolve(line);
          }
        }
      }
    });

    this.client.on('error', (err) => {
      if (this.status !== 'error') {
        console.warn(`[Warning] CacheX connection error: ${err.message}. Caching disabled.`);
        this.status = 'error';
      }
      this.flushQueue();
    });
    
    this.client.on('close', () => {
      this.status = 'end';
      this.flushQueue();
    });
  }

  flushQueue() {
    while(this.queue.length > 0) {
        const resolve = this.queue.shift();
        if (resolve) resolve(null);
    }
  }

  sendCommand(cmd) {
    if (this.status !== 'ready') return Promise.resolve(null);
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.client.write(cmd + '\n');
    });
  }

  async get(key) {
    const b64Val = await this.sendCommand(`GET ${key}`);
    if (!b64Val || b64Val === '(nil)' || b64Val === 'OK') return null;
    try {
      return Buffer.from(b64Val, 'base64').toString('utf8');
    } catch (e) {
      return null;
    }
  }

  async set(key, val, ex, ttl) {
    // Base64 encode the value because CacheX parses spaces as command arguments
    const b64Val = Buffer.from(val, 'utf8').toString('base64');
    if (ex === 'EX' && ttl) {
      return this.sendCommand(`SET ${key} ${b64Val} EX ${ttl}`);
    }
    return this.sendCommand(`SET ${key} ${b64Val}`);
  }

  async del(key) {
    if (Array.isArray(key)) {
      for (const k of key) {
         await this.sendCommand(`DEL ${k}`);
      }
      return 'OK';
    }
    return this.sendCommand(`DEL ${key}`);
  }
}

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let host = '127.0.0.1';
let port = 6379;
try {
  const parsed = new URL(redisUrl);
  host = parsed.hostname || host;
  port = parsed.port || port;
} catch (e) {
  // fallback to defaults
}

const redisClient = new CacheXClient(host, port);
module.exports = redisClient;
