require('dotenv').config();
const router = require('express').Router();
const schedule = require('node-schedule');
const axios = require('axios').default;
const User = require('../models/index').User;
const UserBoard = require('../models/index').UserBoard;
const UserDevice = require('../models/index').UserDevice;
const Board = require('../models/index').Board;
const { Expo } = require('expo-server-sdk');
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

const eventNotifications = new Map();

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

const getEndOfDay = (d) => {
  const date = new Date(d + DAY);
  const tommorow_midnight = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).getTime();
  return tommorow_midnight - 1;
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
      for (data of userDeviceData) {
        const { logged_in, session_expires, device_token } = data;
        if (logged_in && session_expires > Date.now()) {
          const message = {
            to: device_token,
            sound: 'default',
            body: event.name,
            data: event,
          };
          const ticket = await expo.sendPushNotificationsAsync([message]);
          console.log({ ticket });
        }
      }
    }
    return true;
  } catch (err) {
    console.log({ err });
    return false;
  }
};

const scheduleNotificationsForBoard = async (board_id) => {
  try {
    const now = Date.now();
    const start_date = getMidnight(now);
    const end_date = getEndOfDay(now);
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
    for (let event of data.events) {
      if (event.notification_time && event.notification_time >= 0) {
        const job = schedule.scheduleJob(
          new Date(event.start_date - event.notification_time * 60000),
          async () => {
            await sendPushNotification(event);
            job.cancel();
          }
        );
        notifications.push(job);
      }
    }
    eventNotifications[board_id] = notifications;
    return true;
  } catch (err) {
    console.log('Error while scheduling board events', board_id, err.message);
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
    console.log({ err });
    return false;
  }
};

const scheduleNotifications = async () => {
  await scheduleNotificationsForAllEventsFromAllBoards();
  const job = schedule.scheduleJob(rule, async () => {
    await scheduleNotificationsForAllEventsFromAllBoards();
  });
};
scheduleNotifications();

router.get('/board/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const board = await Board.findOne({ where: { id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'board not found' });
    }
    await scheduleNotificationsForBoard(id);
    return res.json({ success: true });
  } catch (err) {
    console.log({ err });
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    await scheduleNotificationsForAllEventsFromAllBoards();
    return res.json({ success: true });
  } catch (err) {
    console.log({ err });
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
