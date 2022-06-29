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

    if (!end_date) {
      if (frequency) {
        end_date = new Date(Date.UTC(9999, 11, 31, 23, 59, 59)).getTime();
        const rule = getRule(
          new Date(start_date),
          Recurrence.convert(frequency),
          interval,
          count,
          new Date(end_date)
        );
        recurrence_pattern = rule.toString();
      } else {
        end_date = new Date(start_date).getTime();
      }
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
    return res.json({ success: true, ...createdEvent.dataValues });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
