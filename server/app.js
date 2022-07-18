const express = require('express');
const cors = require('cors');
const app = express();
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const MySQLStore = require('express-mysql-session')(session);
const MemoryStore = require('memorystore')(session);
const mysql2 = require('mysql2/promise');
const morganBody = require('morgan-body');
require('./utils/passport');

// Routers
const auth = require('./routers/auth');
const board = require('./routers/board');
const user = require('./routers/user');
const event = require('./routers/event');

const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV == 'test'
      ? process.env.TEST_DB_NAME
      : process.env.DB_NAME,
};

const connection = mysql2.createPool(options);
const sessionStore =
  process.env.NODE_ENV == 'test'
    ? new MemoryStore()
    : new MySQLStore({}, connection);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV != 'test') {
  morganBody(app);
}

app.use('/auth', auth);
app.use('/board', board);
app.use('/user', user);
app.use('/event', event);

module.exports = app;
