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
const event1_third_recurrence = 1656860700000;
const event2_start_date = 1656687900000;
const event2_end_date = 1657033500000;
const event2_third_recurrence = 1656860700000;

let event2_data = {
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
};

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
      recurrence_pattern:
        'DTSTART:20220701T150500Z\nRRULE:FREQ=DAILY;UNTIL=20220705T160500Z',
      // 'DTSTART:20220701T150500Z\nRRULE:FREQ=DAILY;COUNT=2;UNTIL=20220705T160500Z',
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
      .send(event2_data)
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

  it('Create recurring event and update all recurrences', (done) => {
    agent
      .post('/event')
      .send(event2_data)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(res.body);
          throw err;
        }
        expect(res.body.success).toBe(true);

        agent
          .put('/event/all')
          .send({
            event_id: res.body.event.id,
            current_event_timestamp: event2_third_recurrence,
            event: { ...event2_data, name: 'updated', description: 'updated' },
          })
          .expect(200)
          .end((err, res) => {
            if (err) {
              console.log(res.body);
              throw err;
            }
            expect(res.body.success).toBe(true);
            const { event } = res.body;
            expect(event.name).toBe('updated');
            expect(event.description).toBe('updated');
            done();
          });
      });
  });

  it('Update all recurrences with wrong date', (done) => {
    agent
      .put('/event/all')
      .send({
        event_id: event1_id,
        current_event_timestamp: event1_third_recurrence + 1,
        event: {
          board_id,
          kid_id,
          name: 'updated',
          description: 'updated',
          start_date: event1_start_date,
          end_date: event1_end_date,
          duration: 60,
          frequency: 'daily',
          interval: null,
          count: null,
        },
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          console.log(res.body);
          throw err;
        }
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('wrong "start_date"');
        done();
      });
  });

  const event3_start_date = 1656808200000;

  const event3_data = {
    kid_id: kid_id,
    name: 'Event 3',
    description: 'Event 3 description',
    start_date: event3_start_date,
    end_date: null,
    duration: 60,
    frequency: 'daily',
    interval: null,
    count: 10,
  };

  const test_board_data = {
    name: 'test_board',
    role: 'aunt',
  };

  it('Update all recurrences for future events', (done) => {
    agent
      .post('/board')
      .send({
        ...test_board_data,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(res.body);
          throw err;
        }
        expect(res.body.success).toBe(true);
        event3_data.board_id = res.body.board.id;
        agent
          .post('/event')
          .send(event3_data)
          .expect(200)
          .end((err, res) => {
            if (err) {
              console.log(res.body);
              throw err;
            }
            expect(res.body.success).toBe(true);
            agent
              .put('/event/future')
              .send({
                event_id: res.body.event.id,
                current_event_timestamp: event3_start_date + 3 * 86400000,
                event: {
                  ...event3_data,
                  name: 'updated',
                  start_date: event3_start_date + 3 * 86400000,
                },
              })
              .expect(200)
              .end((err, res) => {
                if (err) {
                  console.log(res.body);
                  throw err;
                }
                expect(res.body.success).toBe(true);
                agent
                  .post('/board/events')
                  .send({
                    board_id: res.body.event.board_id,
                    start_date: 1656808200000,
                    end_date: 1656808200000 + 9 * 86400000,
                  })
                  .expect(200)
                  .end((err, res) => {
                    if (err) {
                      console.log(res.body);
                      throw err;
                    }
                    expect(res.body.success).toBe(true);
                    expect(res.body.size).toBe(10);
                    const old_names = res.body.events.filter(
                      (e) => e.name == event3_data.name
                    );
                    const new_names = res.body.events.filter(
                      (e) => e.name == 'updated'
                    );
                    expect(Object.keys(old_names).length).toBe(3);
                    expect(Object.keys(new_names).length).toBe(7);
                    done();
                  });
              });
          });
      });
  });
});
