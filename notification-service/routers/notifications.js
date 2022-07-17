require('dotenv').config();
const router = require('express').Router();
const schedule = require('node-schedule');
const axios = require('axios').default;
const User = require('../models/index').User;
const UserBoard = require('../models/index').UserBoard;
const UserDevice = require('../models/index').UserDevice;
const Board = require('../models/index').Board;
const { Expo } = require('expo-server-sdk');
const logger = require('../utils/winston');
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

const eventNotifications = new Map();
const eventNotificationNames = new Map();

const DAY = 86400000;

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';

const getMidnight = (d) => {
  const date = new Date(d);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).getTime();
};

const getEndOfRange = (d) => {
  const date = new Date(d + DAY);
  const tommorow_midnight = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).getTime();
  return tommorow_midnight - 1 + 8 * DAY;
};

const sendPushNotification = async (event) => {
  try {
    let users = await UserBoard.findAll({
      where: { board_id: event.board_id },
    });
    users = [...users].map((u) => u.dataValues.user_id);
    for (let user of users) {
      let userDeviceData = await UserDevice.findAll({
        where: { user_id: user },
      });
      userDeviceData = [...userDeviceData].map((d) => d.dataValues);
      for (let data of userDeviceData) {
        const { logged_in, session_expires, device_token } = data;
        if (logged_in && session_expires > Date.now()) {
          const message = {
            to: device_token,
            sound: 'default',
            body: event.name,
            data: event,
          };
          const ticket = await expo.sendPushNotificationsAsync([message]);
          logger.info(
            `Push notification to user: ${user}, status: ${ticket[0].status}`
          );
        } else {
          logger.info(
            `Notification not sent to ${user}, logged in: ${logged_in},session_expires: ${session_expires}`
          );
        }
      }
    }
    return true;
  } catch (err) {
    logger.error('Error in sendPushNotification', err);
    return false;
  }
};

const scheduleNotificationsForBoard = async (board_id) => {
  try {
    logger.info('Scheduling notification for board ' + board_id);
    const now = Date.now();
    const start_date = getMidnight(now);
    const end_date = getEndOfRange(now);
    const { data } = await axios.post(
      `${process.env.SERVER_ADDRESS}/board/events`,
      {
        board_id,
        start_date,
        end_date,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          auth: process.env.NOTIFICATION_SERVICE_SECRET,
        },
      }
    );

    const notifications = [];
    const notificationNames = [];
    for (let event of data.events) {
      if (event.notification_time && event.notification_time >= 0) {
        logger.info(
          `Scheduling notification for event ${event.name}, for date ${new Date(
            event.start_date - event.notification_time * 60000
          )}`
        );
        const names = eventNotificationNames[board_id];
        if (names) {
          for (let name of names) {
            const old_job = schedule.scheduledJobs[name];
            if (old_job) {
              old_job.cancel();
            }
          }
        }
        const notification_name = event.event_id + event.start_date;
        const job = schedule.scheduleJob(
          notification_name,
          new Date(event.start_date - event.notification_time * 60000),
          async () => {
            await sendPushNotification(event);
            job.cancel();
          }
        );
        notificationNames.push(notification_name);
        notifications.push(job);
      }
    }
    eventNotificationNames[board_id] = notificationNames;
    eventNotifications[board_id] = notifications;
    return true;
  } catch (err) {
    logger.error('Error in scheduleNotificationsForBoard', err);
    return false;
  }
};

const scheduleNotificationsForAllEventsFromAllBoards = async () => {
  try {
    let boards = await Board.findAll();
    boards = [...boards].map((b) => b.dataValues.id);
    for (let board of boards) {
      await scheduleNotificationsForBoard(board);
    }
    return true;
  } catch (err) {
    logger.error(
      'Error in scheduleNotificationsForAllEventsFromAllBoards',
      err
    );
    return false;
  }
};

const scheduleNotifications = async () => {
  try {
    await scheduleNotificationsForAllEventsFromAllBoards();
    const job = schedule.scheduleJob(rule, async () => {
      await scheduleNotificationsForAllEventsFromAllBoards();
    });
  } catch (err) {
    logger.error('Error in scheduleNotifications', err);
  }
};
scheduleNotifications();

router.get('/board/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const board = await Board.findOne({ where: { id } });
    if (!board) {
      logger.error('board not found with id');
      return res
        .status(400)
        .json({ success: false, message: 'board not found' });
    }
    await scheduleNotificationsForBoard(id);
    return res.json({ success: true });
  } catch (err) {
    logger.error('Error in rescheduling board notifications', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    await scheduleNotificationsForAllEventsFromAllBoards();
    return res.json({ success: true });
  } catch (err) {
    logger.error('Error in today', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
