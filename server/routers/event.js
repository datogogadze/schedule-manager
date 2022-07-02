const router = require('express').Router();
const auth = require('../middleware/auth');
const { eventSchema, updateEventSchema } = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const Event = require('../models/index').Event;
const EventModel = require('../utils/classes/EventModel');
const { RRule, RRuleSet, rrulestr } = require('rrule');
const { Recurrence } = require('../utils/classes/enums');

const generateRule = (dtstart, freq, interval, count, until) => {
  if (!interval) {
    interval = 1;
  }
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
  const rule = generateRule(
    new Date(start_date),
    Recurrence.convert(frequency),
    interval,
    count,
    new Date(end_date)
  );
  return rule.toString();
};

const generateEventModel = (eventData) => {
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
  } = eventData;

  let recurrence_pattern = null;
  if (!frequency) {
    if (count != null || end_date != null) {
      return res.status(400).json({
        success: false,
        message:
          'if there is no frequency, "count" and "end_date" are not supported',
      });
    }
    const start_midnight = getMidnight(start_date);
    const ms = start_date - start_midnight + duration * 60000;
    end_date = new Date(start_midnight + ms).getTime();
  } else {
    if (end_date) {
      const start_midnight = getMidnight(start_date);
      const end_midnight = getMidnight(end_date);
      const ms = start_date - start_midnight + duration * 60000;
      end_date = new Date(end_midnight + ms).getTime();
      count = null;
    } else if (count) {
      const rule = generateRule(
        new Date(start_date),
        Recurrence.convert(frequency),
        interval,
        count,
        new Date(Date.UTC(9999, 11, 31, 23, 59, 59))
      );
      const events = rule.all();
      const len = Object.keys(events).length;
      const last = events[len - 1];
      end_date = new Date(last).getTime() + duration * 60000;
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

  return event;
};

router.post('/', auth, async (req, res) => {
  try {
    await eventSchema.validateAsync(req.body, { abortEarly: false });
    const event = generateEventModel(req.body);
    const createdEvent = await Event.create(event);
    return res.json({ success: true, event: { ...createdEvent.dataValues } });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.put('/all', auth, async (req, res) => {
  try {
    await updateEventSchema.validateAsync(req.body, { abortEarly: false });
    const { event_id, start_date, event } = req.body;
    const existing_event = await Event.findOne({ where: { id: event_id } });
    if (!existing_event) {
      return res
        .status(400)
        .json({ success: false, message: 'event does not exist' });
    }
    if (!existing_event.recurrence_pattern) {
      return res.status(400).json({
        success: false,
        message:
          'This is a one time event call update endpoint for single event',
      });
    }
    const rule = RRule.fromString(existing_event.recurrence_pattern);
    const all_events = rule.all();
    const exists = all_events.find((e) => start_date == e.getTime());
    if (!exists) {
      return res.status(400).json({
        success: false,
        message: 'wrong "start_date"',
      });
    }
    const new_event = generateEventModel(event);
    const updatedEvent = await Event.update(new_event, {
      where: { id: event_id },
    });
    return res.json({ success: true, event });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
