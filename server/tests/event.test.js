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
  notification_time: 10,
  frequency: 'daily',
  interval: null,
  count: null,
};

const event3_start_date = 1656808200000;

const event3_data = {
  kid_id: kid_id,
  name: 'Event 3',
  description: 'Event 3 description',
  start_date: event3_start_date,
  end_date: null,
  duration: 60,
  notification_time: 10,
  frequency: 'daily',
  interval: null,
  count: 10,
};

const test_board_data = {
  name: 'test_board',
  role: 'aunt',
};

beforeAll(async () => {
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
    notification_time: 10,
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
});

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Board.destroy({ where: {} });
  await db.UserBoard.destroy({ where: {} });
  await db.Event.destroy({ where: {} });
});

describe('Test events', () => {
  it('Test getting event data', async () => {
    const res = await agent.get(`/event/${event1_id}`).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;
    expect(event.id).toBe(event1_id);
  });

  it('Test creating an event', async () => {
    const res = await agent.post('/event').send(event2_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;
    expect(event.name).toBe('Event 2');
  });

  it('Create recurring event and update all recurrences', async () => {
    let res = await agent.post('/event').send(event2_data).expect(200);
    expect(res.body.success).toBe(true);
    res = await agent
      .put('/event/all')
      .send({
        event_id: res.body.event.id,
        current_event_timestamp: event2_third_recurrence,
        event: {
          ...event2_data,
          start_date: event2_third_recurrence,
          name: 'updated',
          description: 'updated',
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;
    expect(event.name).toBe('updated');
    expect(event.description).toBe('updated');
  });

  it('Update all recurrences with wrong date', async () => {
    const res = await agent
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
          notification_time: 10,
          frequency: 'daily',
          interval: null,
          count: null,
        },
      })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('wrong "current_event_timestamp"');
  });

  it('Update all recurrences for future events', async () => {
    // create a board
    let res = await agent
      .post('/board')
      .send({
        ...test_board_data,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const { board } = res.body;
    event3_data.board_id = board.id;

    // create an event
    res = await agent.post('/event').send(event3_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    // update all occurances starting from 4th
    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: event3_start_date + 3 * 86400000,
        event: {
          ...event3_data,
          name: 'updated1',
          start_date: event3_start_date + 3 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const new_event_id = res.body.event.id;

    // check board events
    res = await agent
      .post('/board/events')
      .send({
        board_id: res.body.event.board_id,
        start_date: 1656808200000,
        end_date: 1656808200000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(10);
    const old_names = res.body.events.filter((e) => e.name == event3_data.name);
    const new_names = res.body.events.filter((e) => e.name == 'updated1');
    expect(Object.keys(old_names).length).toBe(3);
    expect(Object.keys(new_names).length).toBe(7);

    // update one more time
    res = await agent
      .put('/event/future')
      .send({
        event_id: new_event_id,
        current_event_timestamp: event3_start_date + 6 * 86400000,
        event: {
          ...event3_data,
          name: 'updated2',
          start_date: event3_start_date + 6 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    // check boards one more time
    res = await agent
      .post('/board/events')
      .send({
        board_id: res.body.event.board_id,
        start_date: 1656808200000,
        end_date: 1656808200000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(10);
    const names1 = res.body.events.filter((e) => e.name == event3_data.name);
    const names2 = res.body.events.filter((e) => e.name == 'updated1');
    const names3 = res.body.events.filter((e) => e.name == 'updated2');

    expect(Object.keys(names1).length).toBe(3);
    expect(Object.keys(names2).length).toBe(3);
    expect(Object.keys(names3).length).toBe(4);
  });

  it('Update all recurrences for future events', async () => {
    // create a board
    let res = await agent
      .post('/board')
      .send({
        ...test_board_data,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const { board } = res.body;
    event3_data.board_id = board.id;

    // create an event
    res = await agent.post('/event').send(event3_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    // update all occurances starting from 4th
    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: event3_start_date + 3 * 86400000,
        event: {
          ...event3_data,
          name: 'updated1',
          start_date: event3_start_date + 3 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const new_event_id = res.body.event.id;

    // update one more time
    res = await agent
      .put('/event/future')
      .send({
        event_id: new_event_id,
        current_event_timestamp: event3_start_date + 3 * 86400000,
        event: {
          ...event3_data,
          name: 'updated2',
          start_date: event3_start_date + 6 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    const new_event_id1 = res.body.event.id;

    // check boards
    res = await agent
      .post('/board/events')
      .send({
        board_id: res.body.event.board_id,
        start_date: 1656808200000,
        end_date: 1656808200000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(7);
    const names1 = res.body.events.filter((e) => e.name == event3_data.name);
    const names2 = res.body.events.filter((e) => e.name == 'updated1');
    const names3 = res.body.events.filter((e) => e.name == 'updated2');

    expect(Object.keys(names1).length).toBe(3);
    expect(Object.keys(names2).length).toBe(0);
    expect(Object.keys(names3).length).toBe(4);

    // update again
    res = await agent
      .put('/event/future')
      .send({
        event_id: new_event_id1,
        current_event_timestamp: event3_start_date + 6 * 86400000,
        event: {
          ...event3_data,
          name: 'updated3',
          start_date: event3_start_date + 4 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    // check boards
    res = await agent
      .post('/board/events')
      .send({
        board_id: res.body.event.board_id,
        start_date: 1656808200000,
        end_date: 1656808200000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(9);
    const names11 = res.body.events.filter((e) => e.name == event3_data.name);
    const names21 = res.body.events.filter((e) => e.name == 'updated1');
    const names31 = res.body.events.filter((e) => e.name == 'updated3');

    expect(Object.keys(names11).length).toBe(3);
    expect(Object.keys(names21).length).toBe(0);
    expect(Object.keys(names31).length).toBe(6);
  });

  it('Test update single', async () => {
    let res = await agent
      .post('/board')
      .send({ name: 'single', role: 'aunt' })
      .expect(200);
    expect(res.body.success).toBe(true);
    const board_id = res.body.board.id;
    const event_data = {
      board_id,
      kid_id,
      name: 'STARTING VALUE',
      description: 'STARTING VALUE',
      start_date: 1656902700000,
      end_date: null,
      duration: 60,
      notification_time: 10,
      frequency: 'daily',
      interval: null,
      count: 10,
    };

    res = await agent.post('/event').send(event_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    res = await agent
      .put('/event/single')
      .send({
        event_id: event.id,
        current_event_timestamp: 1656902700000 + 3 * 86400000,
        event: {
          ...event_data,
          name: 'FIRST UPDATE',
          start_date: 1656902700000 + 3 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .put('/event/single')
      .send({
        event_id: event.id,
        current_event_timestamp: 1656902700000 + 5 * 86400000,
        event: {
          ...event_data,
          name: 'SECOND UPDATE',
          start_date: 1656902700000 + 5 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .put('/event/single')
      .send({
        event_id: event.id,
        current_event_timestamp: 1656902700000 + 7 * 86400000,
        event: {
          ...event_data,
          name: 'THIRD UPDATE',
          start_date: 1656902700000 + 7 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1656902700000,
        end_date: 1656902700000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(10);

    const names1 = res.body.events.filter((e) => e.name == 'STARTING VALUE');
    const names2 = res.body.events.filter((e) => e.name == 'FIRST UPDATE');
    const names3 = res.body.events.filter((e) => e.name == 'SECOND UPDATE');
    const names4 = res.body.events.filter((e) => e.name == 'THIRD UPDATE');

    expect(Object.keys(names1).length).toBe(7);
    expect(Object.keys(names2).length).toBe(1);
    expect(Object.keys(names3).length).toBe(1);
    expect(Object.keys(names4).length).toBe(1);

    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: 1656902700000 + 5 * 86400000,
        event: {
          ...event_data,
          name: 'FOURTH UPDATE',
          start_date: 1656902700000 + 5 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1656902700000,
        end_date: 1656902700000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(10);

    const names11 = res.body.events.filter((e) => e.name == 'STARTING VALUE');
    const names21 = res.body.events.filter((e) => e.name == 'FIRST UPDATE');
    const names31 = res.body.events.filter((e) => e.name == 'FOURTH UPDATE');

    expect(Object.keys(names11).length).toBe(4);
    expect(Object.keys(names21).length).toBe(1);
    expect(Object.keys(names31).length).toBe(5);

    res = await agent
      .put('/event/all')
      .send({
        event_id: event.id,
        current_event_timestamp: 1656902700000 + 4 * 86400000,
        event: {
          ...event_data,
          name: 'LAST UPDATE',
          start_date: 1656902700000 + 4 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1656902700000,
        end_date: 1656902700000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(6);

    const names111 = res.body.events.filter((e) => e.name == 'STARTING VALUE');
    const names211 = res.body.events.filter((e) => e.name == 'FIRST UPDATE');
    const names311 = res.body.events.filter((e) => e.name == 'FOURTH UPDATE');
    const names411 = res.body.events.filter((e) => e.name == 'LAST UPDATE');

    expect(Object.keys(names111).length).toBe(0);
    expect(Object.keys(names211).length).toBe(0);
    expect(Object.keys(names311).length).toBe(0);
    expect(Object.keys(names411).length).toBe(6);
  });

  it('Test delete all', async () => {
    let res = await agent
      .post('/board')
      .send({ name: 'delete all', role: 'aunt' })
      .expect(200);
    expect(res.body.success).toBe(true);
    const board_id = res.body.board.id;
    const event_data = {
      board_id,
      kid_id,
      name: 'DELETE EVENT',
      description: 'DELETE EVENT DESCRIPTION',
      start_date: 1657693800000,
      end_date: null,
      duration: 60,
      notification_time: 10,
      frequency: 'daily',
      interval: null,
      count: 10,
    };

    res = await agent.post('/event').send(event_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: 1657693800000 + 5 * 86400000,
        event: {
          ...event_data,
          name: 'UPDATE',
          start_date: 1657693800000 + 5 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .delete('/event')
      .send({
        event_id: event.id,
        current_event_timestamp: 1657693800000 + 3 * 86400000,
        type: 'all',
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1657693800000,
        end_date: 1657693800000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(0);
  });

  it('Test delete future', async () => {
    let res = await agent
      .post('/board')
      .send({ name: 'delete all', role: 'aunt' })
      .expect(200);
    expect(res.body.success).toBe(true);
    const board_id = res.body.board.id;
    const event_data = {
      board_id,
      kid_id,
      name: 'DELETE EVENT',
      description: 'DELETE EVENT DESCRIPTION',
      start_date: 1657693800000,
      end_date: null,
      duration: 60,
      notification_time: 10,
      frequency: 'daily',
      interval: null,
      count: 10,
    };

    res = await agent.post('/event').send(event_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: 1657693800000 + 5 * 86400000,
        event: {
          ...event_data,
          name: 'UPDATE',
          start_date: 1657693800000 + 5 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .delete('/event')
      .send({
        event_id: event.id,
        current_event_timestamp: 1657693800000 + 3 * 86400000,
        type: 'future',
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1657693800000,
        end_date: 1657693800000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    expect(res.body.size).toBe(3);
  });

  it('Test delete single', async () => {
    let res = await agent
      .post('/board')
      .send({ name: 'delete single', role: 'aunt' })
      .expect(200);
    expect(res.body.success).toBe(true);
    const board_id = res.body.board.id;
    const event_data = {
      board_id,
      kid_id,
      name: 'DELETE EVENT',
      description: 'DELETE EVENT DESCRIPTION',
      start_date: 1657693800000,
      end_date: null,
      duration: 60,
      notification_time: 10,
      frequency: 'daily',
      interval: null,
      count: 10,
    };

    res = await agent.post('/event').send(event_data).expect(200);
    expect(res.body.success).toBe(true);
    const { event } = res.body;

    res = await agent
      .put('/event/future')
      .send({
        event_id: event.id,
        current_event_timestamp: 1657693800000 + 5 * 86400000,
        event: {
          ...event_data,
          name: 'UPDATE',
          start_date: 1657693800000 + 5 * 86400000,
        },
      })
      .expect(200);
    expect(res.body.success).toBe(true);

    res = await agent
      .delete('/event')
      .send({
        event_id: res.body.event.id,
        current_event_timestamp: 1657693800000 + 7 * 86400000,
        type: 'single',
      })
      .expect(200);

    expect(res.body.success).toBe(true);

    res = await agent
      .post('/board/events')
      .send({
        board_id,
        start_date: 1657693800000,
        end_date: 1657693800000 + 9 * 86400000,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.size).toBe(9);
  });
});
