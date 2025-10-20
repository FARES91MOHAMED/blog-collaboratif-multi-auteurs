
const request = require('supertest');
const mongoose = require('mongoose');
const appModule = require('../server'); 

describe('Auth', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('register -> login', async () => {
    const server = request('http://localhost:5000'); 
    const user = { name: 'Test', email: 'a@b.com', password: 'azerty123' };
    const reg = await server.post('/api/auth/register').send(user);
    expect(reg.statusCode).toBe(200);
    expect(reg.body).toHaveProperty('accessToken');
    const login = await server.post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('accessToken');
  });
});
