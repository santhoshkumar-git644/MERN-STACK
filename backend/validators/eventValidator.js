const { z } = require('zod');

const createEventSchema = z.object({
  body: z.object({
    eventName: z.string().min(3, { message: "Event name must be at least 3 characters" }),
    eventDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
    eventType: z.enum(['normal', 'merchandise']),
    eligibility: z.enum(['all', 'iiit-only', 'non-iiit-only']).optional(),
    eventStartDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
    eventEndDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
    registrationDeadline: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid deadline" }),
    registrationFee: z.number().min(0).optional(),
    registrationLimit: z.number().positive().optional().nullable(),
    tags: z.array(z.string()).optional(),
  })
});

module.exports = { createEventSchema };
