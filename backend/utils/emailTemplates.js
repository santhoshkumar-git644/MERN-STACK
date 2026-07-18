const generateWelcomeEmail = (name) => `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
  <h1 style="color: #4F46E5;">Welcome to Felicity!</h1>
  <p style="color: #333; font-size: 16px;">Hi ${name},</p>
  <p style="color: #333; font-size: 16px;">We are thrilled to have you on board. Discover amazing events, join clubs, and be part of the vibrant campus life.</p>
  <p style="color: #333; font-size: 16px;">Log in to your dashboard to get started.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="${process.env.CLIENT_URL}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
  </div>
</div>
`;

const generateRegistrationEmail = (name, eventName, ticketType) => `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
  <h1 style="color: #10B981;">Registration Confirmed! 🎉</h1>
  <p style="color: #333; font-size: 16px;">Hi ${name},</p>
  <p style="color: #333; font-size: 16px;">You are successfully registered for <strong>${eventName}</strong>.</p>
  <p style="color: #333; font-size: 16px;"><strong>Ticket Type:</strong> ${ticketType}</p>
  <p style="color: #333; font-size: 16px;">Please find your QR code attached to this email. Show it at the entrance for quick check-in.</p>
</div>
`;

module.exports = {
  generateWelcomeEmail,
  generateRegistrationEmail
};
