const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock auth route for testing validation
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidator');
app.post('/api/auth/login', validate(loginSchema), (req, res) => res.status(200).json({ token: 'fake-token' }));

describe('Auth API Validation', () => {
  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation Failed');
  });

  it('should return 200 for valid credentials format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
      
    expect(res.statusCode).toEqual(200);
  });
});
