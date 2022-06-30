const router = require('express').Router();
const auth = require('../middleware/auth');
const { eventSchema } = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const Event = require('../models/index').Event;
const EventModel = require('../utils/classes/EventModel');
const { RRule, RRuleSet, rrulestr } = require('rrule');
const { Recurrence } = require('../utils/classes/enums');

const getRule = (dtstart, freq, interval, count, until) => {
  return new RRule({
    dtstart,
    freq,
    interval,
    count,
    until,
  });
};

router.get('/:id', auth, async (req, res) => {
  try {
    const event_id = req.params.id;
    const event = await Event.findOne({ where: { id: event_id } });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }
    const user_board = await UserBoard.findOne({
      where: { user_id: req.user.id, board_id: event.board_id },
    });
    if (!user_board) {
      return res.status(404).json({ success: false, message: 'unauthorized' });
    }
    return res.json({ success: true, event });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

const getMidnight = (d) => {
  const date = new Date(d);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).getTime();
};

const generateRRuleString = (
  start_date,
  frequency,
  interval,
  count,
  end_date
) => {
  const rule = getRule(
    new Date(start_date),
    Recurrence.convert(frequency),
    interval,
    count,
    new Date(end_date)
  );
  return rule.toString();
};

router.post('/', auth, async (req, res) => {
  try {
    await eventSchema.validateAsync(req.body, { abortEarly: false });
    let {
      board_id,
      kid_id,
      name,
      description,
      start_date,
      end_date,
      duration,
      frequency,
      interval,
      count,
    } = req.body;

    let recurrence_pattern = null;
    if (!frequency) {
      const start_midnight = getMidnight(start_date);
      const ms = start_date - start_midnight + duration * 60000;
      end_date = new Date(start_midnight + ms).getTime();
    } else {
      if (end_date) {
        const start_midnight = getMidnight(start_date);
        const end_midnight = getMidnight(end_date);
        const ms = start_date - start_midnight + duration * 60000;
        end_date = new Date(end_midnight + ms).getTime();
      } else {
        end_date = new Date(Date.UTC(9999, 11, 31, 23, 59, 59)).getTime();
      }
      recurrence_pattern = generateRRuleString(
        start_date,
        frequency,
        interval,
        count,
        end_date
      );
    }

    const event = new EventModel(
      board_id,
      kid_id,
      name,
      description,
      start_date,
      end_date,
      duration,
      recurrence_pattern
    );

    const createdEvent = await Event.create(event);
    return res.json({ success: true, event: { ...createdEvent.dataValues } });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
