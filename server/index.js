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

app.use(express.json());
app.use(cors());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

db.sequelize
  .authenticate()
  .then(() =>
    console.log('Database connected: ' + db.sequelize.config.database)
  )
  .catch(err => console.log('Database connection error: ' + err));

app.use('/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
