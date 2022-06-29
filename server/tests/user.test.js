require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const agent = request.agent(app);
const db = require('../models/index');

const user_id = 'bd913403-6d7d-49c3-b6ca-3c85057934c6';
const board1_id = '65020b82-4ae7-48a4-b340-18aded9637c3';
const board2_id = 'e34ede56-e221-4ced-a37f-740af7e1771c';

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

  const board1 = await db.Board.create({
    id: board1_id,
    creator_id: user.id,
    name: 'board1',
    code: 'board1',
  });

  const board2 = await db.Board.create({
    id: board2_id,
    creator_id: user.id,
    name: 'board2',
    code: 'board2',
  });

  await db.UserBoard.create({
    user_id: user.id,
    board_id: board1.id,
    role: 'role',
  });

  await db.UserBoard.create({
    user_id: user.id,
    board_id: board2.id,
    role: 'role',
  });
});

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Board.destroy({ where: {} });
  await db.UserBoard.destroy({ where: {} });
});

describe('Test users', () => {
  it('Test getting user boards', (done) => {
    agent
      .post('/auth/basic')
      .send({
        email: 'johndoe@mail.com',
        password: '12345678',
      })
      .expect(200)
      .end((err, res) => {
        agent
          .get('/user/boards')
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body.success).toBe(true);
            const { boards } = res.body;
            expect(boards.length).toBe(2);
            const b1 = boards.find((b) => b.id == board1_id);
            expect(b1.name).toBe('board1');
            const b2 = boards.find((b) => b.id == board2_id);
            expect(b2.name).toBe('board2');
            done();
          });
      });
  });
});
