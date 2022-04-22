require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models/index');
const auth = require('./routers/auth');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
const flash = require('express-flash');
const MySQLStore = require('express-mysql-session')(session);
const mysql2 = require('mysql2/promise');
const logger = require('./utils/winston');
require('./passport');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.get('/', (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});
app.get('/register', (req, res) => {
  res.render('register', {
    layout: 'register',
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
  .catch(err => logger.error('Database connection error: ' + err));

app.use('/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});
