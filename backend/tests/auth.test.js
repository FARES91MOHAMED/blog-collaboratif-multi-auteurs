// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const appModule = require('../server'); // NOTE: server.js must export app or create a testable instance
// For simplicity in cet exemple, on utilisera un fichier test bootstrap différent.
// Alternatively tu peux extraire createServer() pour test.

describe('Auth', () => {
  beforeAll(async () => {
    // Connect to test DB - utiliser process.env.MONGO_URI_TEST si défini
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('register -> login', async () => {
    const server = request('http://localhost:5000'); // démarre le serveur dev avant tests
    const user = { name: 'Test', email: 'a@b.com', password: 'azerty123' };
    const reg = await server.post('/api/auth/register').send(user);
    expect(reg.statusCode).toBe(200);
    expect(reg.body).toHaveProperty('accessToken');
    const login = await server.post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('accessToken');
  });
});
