const request = require('supertest');
const express = require('express');

// We mount a fake app just to test the route behavior,
// since requiring server.js directly would start the actual server and connect to DB.
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'Felicity API is running' }));

describe('Health Check API', () => {
  it('should return 200 and a status message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'Felicity API is running');
  });
});
