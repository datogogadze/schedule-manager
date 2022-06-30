require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const agent = request.agent(app);
const db = require('../models/index');

const user_id = '8a62996b-a001-46a7-8b9c-6fd848b1eaea';
const board_id = '90fa1eb0-f38d-48de-889f-e7bf87a2eb0e';
const event1_id = 'a1ea8426-d5cf-43c2-9b3b-9582fd9e2456';
const kid_id = 'c37b3dac-ce34-4ecc-92f0-d5437568592c';
const event1_start_date = 1656687900000;
const event1_end_date = 1657033500000;
const event2_start_date = 1656687900000;
const event2_end_date = 1657033500000;

beforeAll(async () => {
  try {
    const user = await db.User.create({
      id: user_id,
      email: 'johndoe@mail.com',
      password_hash:
        '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
      display_name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email_verified: true,
    });

    const kid = await db.User.create({
      id: kid_id,
      email: 'kid@mail.com',
      password_hash:
        '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
      display_name: 'Kid Kid',
      first_name: 'Kid',
      last_name: 'Kid',
      email_verified: true,
    });

    const board = await db.Board.create({
      id: board_id,
      creator_id: user_id,
      name: 'board',
      code: '123456',
    });

    await db.UserBoard.create({
      user_id,
      board_id,
      role: 'aunt',
    });

    await db.UserBoard.create({
      user_id: kid_id,
      board_id,
      role: 'kid',
    });

    const event = await db.Event.create({
      id: event1_id,
      board_id: board_id,
      kid_id: kid_id,
      name: 'Event 1',
      description: 'Event 1 description',
      start_date: event1_start_date,
      end_date: event1_end_date,
      duration: 60,
      frequency: 'daily',
      interval: null,
      count: null,
    });

    await agent
      .post('/auth/basic')
      .send({
        email: 'johndoe@mail.com',
        password: '12345678',
      })
      .expect(200);
  } catch (err) {
    console.log(err);
  }
});

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Board.destroy({ where: {} });
  await db.UserBoard.destroy({ where: {} });
  await db.Event.destroy({ where: {} });
});

describe('Test events', () => {
  it('Test getting event data', (done) => {
    agent
      .get(`/event/${event1_id}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(res.body);
          throw err;
        }
        expect(res.body.success).toBe(true);
        const { event } = res.body;
        expect(event.id).toBe(event1_id);
        done();
      });
  });

  it('Test creating an event', (done) => {
    agent
      .post('/event')
      .send({
        board_id: board_id,
        kid_id: kid_id,
        name: 'Event 2',
        description: 'Event 2 description',
        start_date: event2_start_date,
        end_date: event2_end_date,
        duration: 60,
        frequency: 'daily',
        interval: null,
        count: null,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(res.body);
          throw err;
        }
        expect(res.body.success).toBe(true);
        const { event } = res.body;
        expect(event.name).toBe('Event 2');
        done();
      });
  });
});
