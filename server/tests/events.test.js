require('dotenv').config();
const app = require('../app');
const request = require('supertest');
let agent = request.agent(app);
const db = require('../models/index');

beforeAll(async () => {
  await db.User.create({
    email: 'johndoe2@mail.com',
    password_hash:
      '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
    display_name: 'wefwfe',
    first_name: 'wefwef',
    last_name: 'wef',
    email_verified: true,
  });
});

afterAll(async () => {
  await db.User.destroy({ where: { email: 'johndoe2@mail.com' } });
});

describe('EVENTS', () => {
  it('1', (done) => {
    agent
      .post('/auth/basic')
      .send({
        email: 'johndoe2@mail.com',
        password: '12345678',
      })
      .end((err, res) => {
        agent.get('/auth//success').end((err, res) => {
          console.log(res.body);
          done();
        });
      });
  });
});
