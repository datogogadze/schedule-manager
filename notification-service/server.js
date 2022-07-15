require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models/index');
const logger = require('./utils/winston');
const auth = require('./routers/auth');
const notifications = require('./routers/notifications');
const morganBody = require('morgan-body');

app.use(express.json());

if (process.env.NODE_ENV != 'test') {
  morganBody(app);
}

db.sequelize
  .authenticate()
  .then(() =>
    logger.info(
      'Notification service connected to: ' + db.sequelize.config.database
    )
  )
  .catch((err) => logger.error('Notification can not connect to db', err));

app.use('/auth', auth);
app.use('/notifications', notifications);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Notification service is running on port: ${port}`);
});
