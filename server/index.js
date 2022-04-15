require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models/index');
const auth = require('./routers/auth');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
require('./passport');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.get('/', (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

app.use(cors());

db.sequelize
  .authenticate()
  .then(() =>
    console.log('Database connected: ' + db.sequelize.config.database)
  )
  .catch(err => console.log('Database connection error: ' + err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
