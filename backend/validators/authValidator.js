const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    participantType: z.enum(['iiit', 'non-iiit']).optional(),
    contactNumber: z.string().optional(),
    collegeOrOrg: z.string().optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
  })
});

module.exports = { registerSchema, loginSchema };
