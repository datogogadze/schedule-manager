const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
