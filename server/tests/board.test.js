require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const agent1 = request.agent(app);
const agent2 = request.agent(app);
const db = require('../models/index');

const user1_id = '4ae85602-103f-4418-8d65-e06291ded4ca';
const user2_id = 'ba9aaf08-0077-46ea-9ef1-9f73164a8301';
const board_id = 'aff55a61-6cae-4e9c-ac83-9fb942d91432';
const event1_id = '9813906a-6c12-420c-81ae-8fc29f20355c';
const event1_start_date = 1656687900000;
const event1_end_date = 1657033500000;
// plus 1 hour
const event2_start_date = event1_start_date + 3600000;
// plus 1 day
const event3_start_date = event2_start_date + 86400000;

beforeAll(async () => {
  const user1 = await db.User.create({
    id: user1_id,
    email: 'johndoe1@mail.com',
    password_hash:
      '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
    display_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    email_verified: true,
  });

  const user2 = await db.User.create({
    id: user2_id,
    email: 'johndoe2@mail.com',
    password_hash:
      '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
    display_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    email_verified: true,
  });

  const board = await db.Board.create({
    id: board_id,
    creator_id: user1.id,
    name: 'board1',
    code: 'board1',
  });

  await db.UserBoard.create({
    user_id: user1.id,
    board_id: board.id,
    role: 'kid',
  });

  const event = await db.Event.create({
    id: event1_id,
    board_id: board_id,
    kid_id: user2_id,
    name: 'Event 1',
    description: 'Event 1 description',
    start_date: event1_start_date,
    end_date: event1_end_date,
    duration: 60,
    notification_time: 10,
    recurrence_pattern:
      'DTSTART:20220701T150500Z\nRRULE:FREQ=DAILY;UNTIL=20220705T160500Z',
    // 'DTSTART:20220701T150500Z\nRRULE:FREQ=DAILY;COUNT=2;UNTIL=20220705T160500Z',
  });

  await agent1
    .post('/auth/basic')
    .send({
      email: 'johndoe1@mail.com',
      password: '12345678',
    })
    .expect(200);

  await agent2
    .post('/auth/basic')
    .send({
      email: 'johndoe2@mail.com',
      password: '12345678',
    })
    .expect(200);
});

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Board.destroy({ where: {} });
  await db.UserBoard.destroy({ where: {} });
  await db.Event.destroy({ where: {} });
});

describe('Test boards', () => {
  it('Test creating board', async () => {
    const res = await agent1
      .post('/board')
      .send({
        name: 'board',
        role: 'aunt',
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.board.name).toBe('board');
  });

  it('Test getting board', async () => {
    const res = await agent1.get(`/board/${board_id}`).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.board.name).toBe('board1');
  });

  it('Test adding user to board', async () => {
    const res = await agent2
      .post('/board/add-user')
      .send({
        code: 'board1',
        role: 'aunt',
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.board.creator_id).toBe(user1_id);
    expect(res.body.board.id).toBe(board_id);
  });

  it('Try adding creator to board', async () => {
    const res = await agent1
      .post('/board/add-user')
      .send({
        code: 'board1',
        role: 'aunt',
      })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User already on this board');
  });

  it('Test getting users from board', async () => {
    const res = await agent1
      .post('/board/users')
      .send({
        board_id,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const { users } = res.body;
    expect(users.length).toBe(2);
    const u1 = users.find((u) => u.id == user1_id);
    expect(u1.email).toBe('johndoe1@mail.com');
    const u2 = users.find((u) => u.id == user2_id);
    expect(u2.email).toBe('johndoe2@mail.com');
  });

  it('Test getting kids from board', async () => {
    const res = await agent1
      .post('/board/kids')
      .send({
        board_id,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const { kids } = res.body;
    expect(kids.length).toBe(1);
    const u1 = kids.find((u) => u.id == user1_id);
    expect(u1.email).toBe('johndoe1@mail.com');
  });

  it('Test removing user from board', async () => {
    const res = await agent1
      .post('/board/remove-user')
      .send({
        user_id: user2_id,
        board_id,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('Test getting events from board', async () => {
    const res = await agent1
      .post('/board/events')
      .send({
        board_id: board_id,
        start_date: event1_start_date,
        end_date: event1_end_date,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(5);
  });

  it('Test getting events from board with increased start date', async () => {
    const res = await agent1
      .post('/board/events')
      .send({
        board_id: board_id,
        start_date: event1_start_date + 1,
        end_date: event1_end_date,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(4);
  });

  it('Test getting events from board with increased start date and decreased end date', async () => {
    const res = await agent1
      .post('/board/events')
      .send({
        board_id: board_id,
        start_date: event1_start_date + 1,
        end_date: event1_end_date - 1,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(3);
  });

  it('Add non recurring event', async () => {
    let res = await agent1
      .post('/event')
      .send({
        board_id: board_id,
        kid_id: user2_id,
        name: 'Event 2',
        description: 'Event 2 description',
        start_date: event2_start_date,
        end_date: null,
        duration: 60,
        notification_time: 10,
        frequency: null,
        interval: null,
        count: null,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    res = await agent1
      .post('/board/events')
      .send({
        board_id: board_id,
        start_date: event1_start_date,
        end_date: event1_end_date,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(6);
  });

  it('Add one more recurring event', async () => {
    let res = await agent1
      .post('/event')
      .send({
        board_id: board_id,
        kid_id: user2_id,
        name: 'Event 3',
        description: 'Event 3 description',
        start_date: event3_start_date,
        end_date: null,
        duration: 60,
        notification_time: 10,
        frequency: 'daily',
        interval: null,
        count: 2,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    res = await agent1
      .post('/board/events')
      .send({
        board_id: board_id,
        start_date: event1_start_date,
        end_date: event1_end_date,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(8);
  });
});
