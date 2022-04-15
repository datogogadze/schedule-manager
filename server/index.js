require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models/index');

app.use(cors());

db.sequelize
  .authenticate()
  .then(() =>
    console.log('Database connected: ' + db.sequelize.config.database)
  )
  .catch(err => console.log('Database connection error: ' + err));

const { User } = db;
app.get('/users', async (req, res) => {
  return res.json(await User.findAll());
});

app.post('/user', async (req, res) => {
  try {
    const user = await User.create({
      email: Math.random().toString(),
    });
    return res.json(user);
  } catch (err) {
    return res.json({ err });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
