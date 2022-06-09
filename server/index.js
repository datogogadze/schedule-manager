require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models/index');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const MySQLStore = require('express-mysql-session')(session);
const mysql2 = require('mysql2/promise');
const logger = require('./utils/winston');
require('./utils/passport');

// Routers
const auth = require('./routers/auth');
const board = require('./routers/board');

app.get('/register', (req, res) => {
  res.render('register', {
    layout: 'register',
  });
});
app.get('/resetPassword', (req, res) => {
  res.render('resetPassword', {
    layout: 'resetPassword',
  });
});

const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
var connection = mysql2.createPool(options);
var sessionStore = new MySQLStore({}, connection);

app.use(express.json());
app.use(cors());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

db.sequelize
  .authenticate()
  .then(() =>
    logger.info('Database connected: ' + db.sequelize.config.database)
  )
  .catch((err) => logger.error('Database connection error: ' + err));

app.use('/auth', auth);
app.use('/board', board);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});
