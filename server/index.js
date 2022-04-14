require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');

app.use(cors());

db.authenticate()
  .then(() => console.log('Database connected: ' + db.config.database))
  .catch(err => console.log('Database connection error: ' + err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
