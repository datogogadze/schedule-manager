const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  eventSchema,
  updateEventSchema,
  deleteEventSchema,
} = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const Event = require('../models/index').Event;
const Exclusion = require('../models/index').Exclusion;
const { RRule, RRuleSet, rrulestr } = require('rrule');
const { Recurrence } = require('../utils/enums/enums');
const { Op, fn, col } = require('sequelize');
const axios = require('axios');
const logger = require('../utils/winston');

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
    logger.error('Error in getting event with id', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

const getMidnight = (d) => {
  const date = new Date(d);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).getTime();
};

const generateEventModel = (eventData) => {
  let {
    parent_id,
    board_id,
    kid_id,
    name,
    description,
    start_date,
    end_date,
    duration,
    notification_time,
    frequency,
    interval,
    count,
  } = eventData;

  let recurrence_pattern = null;
  if (!frequency) {
    if (count != null || end_date != null) {
      return {
        error: true,
        message:
          'if there is no frequency, "count" and "end_date" are not supported',
      };
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
    recurrence_rule = generateRule(
      new Date(start_date),
      Recurrence.convert(frequency),
      interval,
      count,
      new Date(end_date)
    );
    recurrence_pattern = recurrence_rule.toString();
  }

  const event = {
    parent_id,
    board_id,
    kid_id,
    name,
    description,
    start_date,
    end_date,
    duration,
    notification_time,
    recurrence_pattern,
  };

  return event;
};

router.post('/', auth, async (req, res) => {
  try {
    await eventSchema.validateAsync(req.body, { abortEarly: false });
    const board = await Board.findOne({ where: { id: req.body.board_id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: "board_id doesn't exist" });
    }
    const kid = await User.findOne({ where: { id: req.body.kid_id } });
    if (!kid) {
      return res
        .status(400)
        .json({ success: false, message: "kid_id doesn't exist" });
    }
    const event = generateEventModel(req.body);
    if (event.error) {
      return res.status(400).json({
        success: false,
        message: event.message,
      });
    }
    const createdEvent = await Event.create(event);
    if (process.env.NODE_ENV != 'test') {
      // reschedule board notifications
      axios.get(
        `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
      );
    }
    return res.json({ success: true, event: { ...createdEvent.dataValues } });
  } catch (err) {
    logger.error('Error in creating event', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

const getMaxEndDate = (parent_id) =>
  Event.findOne({
    attributes: [[fn('max', col('end_date')), 'max_date']],
    raw: true,
    where: { parent_id },
  });

router.put('/all', auth, async (req, res) => {
  try {
    await updateEventSchema.validateAsync(req.body, { abortEarly: false });
    const { event_id, current_event_timestamp, event } = req.body;
    let existing_event = await Event.findOne({ where: { id: event_id } });
    if (!existing_event) {
      return res
        .status(400)
        .json({ success: false, message: 'event does not exist' });
    }
    if (!existing_event.recurrence_pattern) {
      return res.status(400).json({
        success: false,
        message:
          'This is a one time event, call update endpoint for single event',
      });
    }
    const rule = RRule.fromString(existing_event.recurrence_pattern);
    const before = rule.before(new Date(current_event_timestamp), true);
    const exists = before ? before.getTime() == current_event_timestamp : null;
    if (!exists) {
      return res.status(400).json({
        success: false,
        message: 'wrong "current_event_timestamp"',
      });
    }
    if (getMidnight(current_event_timestamp) != getMidnight(event.start_date)) {
      return res.status(400).json({
        success: false,
        message: 'When changing day, use update single or future events',
      });
    }

    const new_event = generateEventModel(event);
    if (event.error) {
      return res.status(400).json({
        success: false,
        message: event.message,
      });
    }
    if (existing_event.parent_id) {
      existing_event = await Event.findOne({
        where: { id: existing_event.parent_id },
      });
    }

    const { max_date } = await getMaxEndDate(existing_event.id);

    if (!event.frequency) {
      await Event.update(
        {
          ...new_event,
          end_date:
            new Date(new_event.start_date).getTime() +
            new_event.duration * 60000,
          recurrence_pattern: null,
        },
        {
          where: { id: existing_event.id },
        }
      );
    } else {
      await Event.update(
        { ...new_event, end_date: new Date(max_date).getTime() },
        {
          where: { id: existing_event.id },
        }
      );
    }

    await Event.destroy({
      where: { parent_id: existing_event.id },
    });

    await Exclusion.destroy({
      where: { event_id },
    });

    await Exclusion.destroy({
      where: { event_id: existing_event.id },
    });

    if (process.env.NODE_ENV != 'test') {
      // reschedule board notifications
      axios.get(
        `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
      );
    }
    return res.json({ success: true, event });
  } catch (err) {
    logger.error('Error in update all', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

const isRecurrenceChanging = (existing_event, new_event) => {
  const old_rule = RRule.parseString(existing_event.recurrence_pattern);
  const new_rule = RRule.parseString(new_event.recurrence_pattern);
  if (old_rule.freq != new_rule.freq) {
    return true;
  }
  if (old_rule.interval != new_rule.interval) {
    return true;
  }
  if (old_rule.count != new_rule.count) {
    return true;
  }
};

const whenRecurrenceChanging = async (
  existing_event,
  new_event,
  current_event_timestamp
) => {
  const real_parent_id = existing_event.parent_id
    ? existing_event.parent_id
    : existing_event.id;
  new_event.parent_id = null;
  existing_event.end_date = current_event_timestamp - 1;
  const old_rule = RRule.parseString(existing_event.recurrence_pattern);
  const changed_recurrence_pattern = new RRule({
    dtstart: old_rule.dtstart,
    freq: old_rule.freq,
    interval: old_rule.interval,
    count: null,
    until: existing_event.end_date,
  });
  if (existing_event.start_date > existing_event.end_date) {
    await Event.destroy({ where: { id: existing_event.id } });
  } else {
    await Event.update(
      {
        end_date: new_event.start_date - 1,
        recurrence_pattern: changed_recurrence_pattern.toString(),
      },
      { where: { id: existing_event.id } }
    );
  }
  await Event.destroy({
    where: {
      parent_id: real_parent_id,
      start_date: {
        [Op.gte]: new_event.start_date,
      },
    },
  });
  await Exclusion.destroy({
    where: {
      event_id: existing_event.id,
      start_date: {
        [Op.gte]: new_event.start_date,
      },
    },
  });
  return Event.create(new_event);
};

const whenRecurrenceNotChanging = async (
  existing_event,
  new_event,
  current_event_timestamp
) => {
  const real_parent_id = existing_event.parent_id
    ? existing_event.parent_id
    : existing_event.id;
  new_event.parent_id = real_parent_id;
  existing_event.end_date = current_event_timestamp - 1;
  const old_rule = RRule.parseString(existing_event.recurrence_pattern);
  const changed_recurrence_pattern = new RRule({
    dtstart: old_rule.dtstart,
    freq: old_rule.freq,
    interval: old_rule.interval,
    count: null,
    until: existing_event.end_date,
  });
  if (existing_event.start_date > existing_event.end_date) {
    await Event.destroy({ where: { id: existing_event.id } });
  } else {
    await Event.update(
      {
        end_date: new_event.start_date - 1,
        recurrence_pattern: changed_recurrence_pattern.toString(),
      },
      { where: { id: existing_event.id } }
    );
  }
  await Event.destroy({
    where: {
      parent_id: real_parent_id,
      start_date: {
        [Op.gte]: new_event.start_date,
      },
    },
  });

  const exclusion_data = {
    ...new_event,
    exclusion_timestamp: current_event_timestamp,
    event_id: real_parent_id,
    end_date: new_event.start_date + new_event.duration * 60000,
  };
  delete exclusion_data.parent_id;
  delete exclusion_data.recurrence_pattern;
  await Exclusion.update(exclusion_data, {
    where: {
      event_id: real_parent_id,
      start_date: {
        [Op.gte]: new_event.start_date,
      },
    },
  });
  return Event.create(new_event);
};

router.put('/future', auth, async (req, res) => {
  try {
    await updateEventSchema.validateAsync(req.body, { abortEarly: false });
    const { event_id, current_event_timestamp, event } = req.body;
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
          'This is a one time event, call update endpoint for single event',
      });
    }
    const rule = RRule.fromString(existing_event.recurrence_pattern);
    const before = rule.before(new Date(current_event_timestamp), true);
    const exists = before ? before.getTime() == current_event_timestamp : null;
    if (!exists) {
      return res.status(400).json({
        success: false,
        message: 'wrong "current_event_timestamp"',
      });
    }
    const new_event = generateEventModel(event);
    if (event.error) {
      return res.status(400).json({
        success: false,
        message: event.message,
      });
    }
    let created;
    if (
      !isRecurrenceChanging(existing_event, new_event) &&
      current_event_timestamp == event.start_date
    ) {
      created = await whenRecurrenceNotChanging(
        existing_event,
        new_event,
        current_event_timestamp
      );
    } else {
      created = await whenRecurrenceChanging(
        existing_event,
        new_event,
        current_event_timestamp
      );
    }
    if (process.env.NODE_ENV != 'test') {
      // reschedule board notifications
      axios.get(
        `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
      );
    }
    return res.json({ success: true, event: { ...created.dataValues } });
  } catch (err) {
    logger.error('Error in update future', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.put('/single', auth, async (req, res) => {
  try {
    await updateEventSchema.validateAsync(req.body, { abortEarly: false });
    const { event_id, current_event_timestamp, event } = req.body;
    const existing_event = await Event.findOne({ where: { id: event_id } });

    if (!existing_event) {
      return res
        .status(400)
        .json({ success: false, message: 'event does not exist' });
    }
    const new_event = generateEventModel(event);
    if (event.error) {
      return res.status(400).json({
        success: false,
        message: event.message,
      });
    }

    if (!existing_event.recurrence_pattern) {
      await Event.update(new_event, { where: { id: event_id } });
      if (process.env.NODE_ENV != 'test') {
        // reschedule board notifications
        axios.get(
          `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
        );
      }
      return res.json({ success: true, event: { ...new_event } });
    } else {
      if (isRecurrenceChanging(existing_event, new_event)) {
        const rule = RRule.fromString(existing_event.recurrence_pattern);
        const before = rule.before(new Date(current_event_timestamp), true);
        const exists = before
          ? before.getTime() == current_event_timestamp
          : null;
        if (!exists) {
          return res.status(400).json({
            success: false,
            message: 'wrong "current_event_timestamp"',
          });
        }
        return res.status(400).json({
          success: false,
          message:
            'you can only change recurrence only for all or future events',
        });
      } else {
        const exclusion_data = {
          ...new_event,
          exclusion_timestamp: current_event_timestamp,
          event_id,
          end_date: new_event.start_date + new_event.duration * 60000,
        };
        delete exclusion_data.parent_id;
        delete exclusion_data.recurrence_pattern;
        const existing_exclusion = await Exclusion.findOne({
          where: { event_id, exclusion_timestamp: current_event_timestamp },
        });
        if (existing_exclusion) {
          await Exclusion.update(exclusion_data, {
            where: { event_id, exclusion_timestamp: current_event_timestamp },
          });
        } else {
          await Exclusion.create(exclusion_data);
        }
        if (process.env.NODE_ENV != 'test') {
          // reschedule board notifications
          axios.get(
            `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
          );
        }
        return res.json({
          success: true,
          event: {
            ...new_event,
            recurrence_pattern: null,
            parent_id: null,
            id: event_id,
          },
        });
      }
    }
  } catch (err) {
    logger.error('Error in update single', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

const deleteAll = async (event) => {
  await Event.destroy({ where: { id: event.id } });
  await Event.destroy({ where: { parent_id: event.id } });
  if (event.parent_id) {
    await Event.destroy({ where: { id: event.parent_id } });
    await Event.destroy({ where: { parent_id: event.parent_id } });
  }
  await Exclusion.destroy({
    where: { event_id: event.id },
  });
  if (process.env.NODE_ENV != 'test') {
    // reschedule board notifications
    axios.get(
      `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
    );
  }
  return true;
};

const deleteFuture = async (event, current_event_timestamp) => {
  const real_parent_id = event.parent_id ? event.parent_id : event.id;
  const rule = RRule.parseString(event.recurrence_pattern);
  let new_recurrence = generateRule(
    rule.dtstart,
    rule.freq,
    rule.interval,
    null,
    new Date(current_event_timestamp - 1)
  );
  new_recurrence = new_recurrence.toString();
  await Event.update(
    {
      end_date: current_event_timestamp - 1,
      recurrence_pattern: new_recurrence,
    },
    { where: { id: event.id } }
  );

  await Event.destroy({
    where: {
      parent_id: real_parent_id,
      start_date: {
        [Op.gte]: current_event_timestamp,
      },
    },
  });

  await Exclusion.destroy({
    where: {
      event_id: event.id,
      start_date: {
        [Op.gte]: current_event_timestamp,
      },
    },
  });

  await Exclusion.destroy({
    where: {
      event_id: real_parent_id,
      start_date: {
        [Op.gte]: current_event_timestamp,
      },
    },
  });

  if (process.env.NODE_ENV != 'test') {
    // reschedule board notifications
    axios.get(
      `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
    );
  }
  return true;
};

const deleteSingle = async (event, current_event_timestamp) => {
  if (!event.recurrence_pattern) {
    await Event.destroy({ where: { id: event.id } });
  } else {
    const exclusion_data = {
      ...event,
      exclusion_timestamp: current_event_timestamp,
      event_id: event.id,
      end_date: event.start_date + event.duration * 60000,
      deleted: true,
    };
    delete exclusion_data.parent_id;
    delete exclusion_data.recurrence_pattern;
    const existing_exclusion = await Exclusion.findOne({
      where: {
        event_id: event.id,
        exclusion_timestamp: current_event_timestamp,
      },
    });
    if (existing_exclusion) {
      await Exclusion.update(exclusion_data, {
        where: {
          event_id: event.id,
          exclusion_timestamp: current_event_timestamp,
        },
      });
    } else {
      await Exclusion.create(exclusion_data);
    }
  }
  if (process.env.NODE_ENV != 'test') {
    // reschedule board notifications
    axios.get(
      `${process.env.NOTIFICATION_SERVICE_ADDRESS}/notifications/board/${event.board_id}`
    );
  }
  return true;
};

router.delete('/', auth, async (req, res) => {
  try {
    await deleteEventSchema.validateAsync(req.body, { abortEarly: false });
    const { event_id, current_event_timestamp, type } = req.body;
    const existing_event = await Event.findOne({ where: { id: event_id } });

    const correct_type = ['all', 'future', 'single'].find((t) => t === type);
    if (!correct_type) {
      return res
        .status(400)
        .json({ success: false, message: '"type" is incorrect' });
    }

    if (!existing_event) {
      return res
        .status(400)
        .json({ success: false, message: 'event does not exist' });
    }

    if (existing_event.recurrence_pattern) {
      const rule = RRule.fromString(existing_event.recurrence_pattern);
      const before = rule.before(new Date(current_event_timestamp), true);
      const exists = before
        ? before.getTime() == current_event_timestamp
        : null;
      if (!exists) {
        return res.status(400).json({
          success: false,
          message: 'wrong "current_event_timestamp"',
        });
      }
    }

    if (type === 'all') {
      await deleteAll(existing_event.dataValues);
    }

    if (type === 'future') {
      await deleteFuture(existing_event.dataValues, current_event_timestamp);
    }

    if (type === 'single') {
      await deleteSingle(existing_event.dataValues, current_event_timestamp);
    }

    return res.json({
      success: true,
      event_id,
    });
  } catch (err) {
    logger.error('Error in delete event', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
