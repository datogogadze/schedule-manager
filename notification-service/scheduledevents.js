require('dotenv').config();
const schedule = require('node-schedule');
const axios = require('axios').default;
const User = require('./models/index').User;
const Board = require('./models/index').Board;

const eventNotifications = new Map();

const DAY = 86400000;

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

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';

const scheduleAllEventsFromAllBoards = async () => {
  try {
    let boards = await Board.findAll();
    boards = [...boards].map((b) => b.dataValues.id);
    const now = Date.now();
    const start_date = getMidnight(now);
    const end_date = getEndOfDay(now);
    for (let board of boards) {
      try {
        const { data } = await axios.post(
          `${process.env.SERVER_ADDRESS}/board/events`,
          {
            board_id: board,
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
              new Date(event.start_date - event.duration * 60000),
              async () => {
                //send notification
              }
            );
            notifications.push(job);
          }
        }
        eventNotifications[board] = notifications;
      } catch (err) {
        console.log('Error while scheduling board events', board, err.message);
      }
    }
    console.log({ eventNotifications });
  } catch (err) {
    console.log({ err });
  }
};

// const job = schedule.scheduleJob(rule, async () => {
//   await scheduleAllEventsFromAllBoards();
// });

scheduleAllEventsFromAllBoards();
