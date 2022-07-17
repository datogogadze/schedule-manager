require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const agent = request.agent(app);
const db = require('../models/index');

beforeAll(async () => {});

afterAll(async () => {
  await db.User.destroy({ where: {} });
});

describe('Test auth', () => {
  it('Test register', async () => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: 'johndoe@mail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '12345678',
        passwordConfirmation: '12345678',
      })
      .expect(200);
    const { user } = res.body;
    expect(res.body.success).toBe(true);
    expect(user.email).toBe('johndoe@mail.com');
  });

  it('Test login', async () => {
    await db.User.update(
      { email_verified: true },
      { where: { email: 'johndoe@mail.com' } }
    );
    const res = await agent
      .post('/auth/basic')
      .send({
        email: 'johndoe@mail.com',
        password: '12345678',
      })
      .expect(200);
    const { user } = res.body;
    expect(res.body.success).toBe(true);
    expect(user.email).toBe('johndoe@mail.com');
  });

  it('Test me', async () => {
    const res = await agent.get('/user/me').expect(200);
    const { user } = res.body;
    expect(res.body.success).toBe(true);
    expect(user.email).toBe('johndoe@mail.com');
  });

  it('Test logout', async () => {
    const res = await agent.get('/auth/logout').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('logged out');
  });

  it('Test me after logout', async () => {
    const res = await agent.get('/user/me').expect(401);
    const { user } = res.body;
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('unauthenticated');
  });
});
