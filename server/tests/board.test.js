require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const agent = request.agent(app);
const db = require('../models/index');

beforeAll(async () => {});

afterAll(async () => {});

describe('Test boards', () => {
  it('', () => {});
});
