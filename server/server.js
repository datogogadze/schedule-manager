require('dotenv').config();
const app = require('./app');
const db = require('./models/index');
const logger = require('./utils/winston');

db.sequelize
  .authenticate()
  .then(() =>
    logger.info('Database connected: ' + db.sequelize.config.database)
  )
  .catch((err) => logger.error('Database connection error', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`App is running on port: ${port}`);
});
