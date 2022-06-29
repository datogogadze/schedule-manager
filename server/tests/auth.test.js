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
  it('Test register', (done) => {
    agent
      .post('/auth/register')
      .send({
        email: 'johndoe@mail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '12345678',
        passwordConfirmation: '12345678',
      })
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        const { user } = res.body;
        expect(res.body.success).toBe(true);
        expect(user.email).toBe('johndoe@mail.com');
        done();
      });
  });

  it('Test login', (done) => {
    db.User.update(
      { email_verified: true },
      { where: { email: 'johndoe@mail.com' } }
    )
      .then(() => {
        agent
          .post('/auth/basic')
          .send({
            email: 'johndoe@mail.com',
            password: '12345678',
          })
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            const { user } = res.body;
            expect(res.body.success).toBe(true);
            expect(user.email).toBe('johndoe@mail.com');
            done();
          });
      })
      .catch((err) => {
        throw err;
      });
  });

  it('Test me', (done) => {
    agent
      .get('/user/me')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        const { user } = res.body;
        expect(res.body.success).toBe(true);
        expect(user.email).toBe('johndoe@mail.com');
        done();
      });
  });

  it('Test logout', (done) => {
    agent
      .get('/auth/logout')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('logged out');
        done();
      });
  });

  it('Test me after logout', (done) => {
    agent
      .get('/user/me')
      .expect(401)
      .end((err, res) => {
        if (err) throw err;
        const { user } = res.body;
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('unauthenticated');
        done();
      });
  });
});
