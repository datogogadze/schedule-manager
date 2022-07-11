require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models/index');
const logger = require('./utils/winston');
const auth = require('./routers/auth');

app.use(express.json());

db.sequelize
  .authenticate()
  .then(() =>
    logger.info(
      'Notification service connected to: ' + db.sequelize.config.database
    )
  )
  .catch((err) => logger.error('Notification can not connect to db: ' + err));

app.use('/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Notification service is running on port: ${port}`);
});
