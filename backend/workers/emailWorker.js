const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { connection } = require('../config/queue');
const { generateWelcomeEmail, generateRegistrationEmail } = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let emailWorker = null;

try {
  emailWorker = new Worker('email-queue', async job => {
    const { type, data } = job.data;
    
    let mailOptions = {
      from: `"Felicity" <${process.env.EMAIL_USER}>`,
      to: data.email,
    };

    if (type === 'welcome') {
      mailOptions.subject = 'Welcome to Felicity!';
      mailOptions.html = generateWelcomeEmail(data.name);
    } else if (type === 'registration-confirmation') {
      mailOptions.subject = `Registration Confirmed: ${data.eventName}`;
      mailOptions.html = generateRegistrationEmail(data.name, data.eventName, data.ticketType);
      
      if (data.qrCodeBuffer) {
        mailOptions.attachments = [
          {
            filename: 'ticket-qrcode.png',
            content: data.qrCodeBuffer.split('base64,')[1],
            encoding: 'base64'
          }
        ];
      }
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Worker] Sent ${type} email to ${data.email} (${info.messageId})`);
  }, { connection });

  emailWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed:`, err.message);
  });

  // Catch Redis connection errors for the worker to prevent crash/spam
  emailWorker.on('error', (err) => {
    // Suppress repeated connection errors
  });

  console.log('✅ Email Worker started successfully');
} catch (error) {
  console.warn('Failed to initialize Email Worker. Ensure Redis is running if you want async emails.');
}

module.exports = emailWorker;
