const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  boardSchema,
  boardAddUserSchema,
  boardRemoveUserSchema,
  boardUsersSchema,
  boardEventsSchema,
} = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const Event = require('../models/index').Event;
const Exclusion = require('../models/index').Exclusion;
const crypto = require('crypto');
const { Op } = require('sequelize');
const { RRule, RRuleSet, rrulestr } = require('rrule');
const logger = require('../utils/winston');

const generateCode = async () => {
  const code = crypto.randomBytes(3).toString('hex');
  const board = await Board.findOne({ where: { code } });
  if (!board) {
    return code;
  }
  return generateCode();
};

router.post('/', auth, async (req, res) => {
  try {
    await boardSchema.validateAsync(req.body, { abortEarly: false });
    const userId = req.user.id;
    const { name, role } = req.body;
    const code = await generateCode();
    const boardPayload = {
      name,
      code,
      creator_id: userId,
    };
    const createdBoard = await Board.create(boardPayload);
    const userBoardPayload = {
      user_id: userId,
      board_id: createdBoard.id,
      role,
    };
    await UserBoard.create(userBoardPayload);
    return res.json({ success: true, board: { ...createdBoard.dataValues } });
  } catch (err) {
    logger.error('Error in creating board', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '"id" is required as a parameter',
      });
    }
    const board = await Board.findOne({ where: { id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'board not found' });
    }
    return res.json({ success: true, board: { ...board.dataValues } });
  } catch (err) {
    logger.error('Error in getting board', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/add-user', auth, async (req, res) => {
  try {
    await boardAddUserSchema.validateAsync(req.body, { abortEarly: false });
    const { code, role } = req.body;
    const board = await Board.findOne({ where: { code } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect code' });
    }
    const userId = req.user.id;
    const userBoard = await UserBoard.findOne({
      where: {
        user_id: userId,
        board_id: board.id,
      },
    });

    if (userBoard) {
      return res
        .status(400)
        .json({ success: false, message: 'User already on this board' });
    }

    const addUserPayload = {
      user_id: userId,
      board_id: board.id,
      role,
    };
    const result = await UserBoard.create(addUserPayload);
    return res.json({ success: true, board: { ...board.dataValues } });
  } catch (err) {
    logger.error('Error in board add user', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/remove-user', auth, async (req, res) => {
  try {
    await boardRemoveUserSchema.validateAsync(req.body, { abortEarly: false });
    const { user_id, board_id } = req.body;
    const board = await Board.findOne({ where: { id: board_id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect board_id' });
    }
    if (board.creator_id != req.user.id && req.user.id != user_id) {
      return res.status(403).json({ success: false, message: 'unauthorized' });
    }
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect user_id' });
    }

    const userBoard = await UserBoard.findOne({
      where: {
        user_id,
        board_id,
      },
    });

    if (!userBoard) {
      return res
        .status(400)
        .json({ success: false, message: 'User is not on this board' });
    }

    if (userBoard.role == 'kid') {
      await Event.destroy({
        where: { kid_id: userBoard.user_id, board_id: board.id },
      });
      await Exclusion.destroy({
        where: { kid_id: userBoard.user_id, board_id: board.id },
      });
      await UserBoard.destroy({
        where: {
          board_id,
          user_id,
        },
      });
    } else if (userBoard.user_id == board.creator_id) {
      await Event.destroy({
        where: { board_id: board.id },
      });
      await Exclusion.destroy({
        where: { board_id: board.id },
      });
      await UserBoard.destroy({
        where: {
          board_id,
        },
      });
      await Board.destroy({
        where: {
          board_id,
        },
      });
    } else {
      await UserBoard.destroy({
        where: {
          board_id,
          user_id,
        },
      });
    }
    return res.json({ success: true, board_id: board.id });
  } catch (err) {
    logger.error('Error in board remove user', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/users', auth, async (req, res) => {
  try {
    await boardUsersSchema.validateAsync(req.body, { abortEarly: false });
    const { board_id } = req.body;
    const board = await Board.findOne({ where: { id: board_id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect board_id' });
    }
    const userBoards = await UserBoard.findAll({ where: { board_id } });
    const userIds = userBoards.map((user) => user.dataValues.user_id);
    if (!userIds.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'unauthorized' });
    }
    const users = await User.findAll({
      attributes: [
        'id',
        'email',
        'display_name',
        'first_name',
        'last_name',
        'image_url',
      ],
      where: { id: { [Op.in]: userIds } },
    });
    const usersList = users.map((user) => user.dataValues);
    return res.json({ success: true, users: usersList });
  } catch (err) {
    logger.error('Error in board users', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/kids', auth, async (req, res) => {
  try {
    await boardUsersSchema.validateAsync(req.body, { abortEarly: false });
    const { board_id } = req.body;
    const board = await Board.findOne({ where: { id: board_id } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect board_id' });
    }
    const userBoards = await UserBoard.findAll({ where: { board_id } });
    let userIds = userBoards.map((user) => user.dataValues.user_id);
    if (!userIds.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'unauthorized' });
    }
    userIds = userBoards.filter((user) => user.dataValues.role == 'kid');
    userIds = userIds.map((user) => user.dataValues.user_id);
    const users = await User.findAll({
      attributes: [
        'id',
        'email',
        'display_name',
        'first_name',
        'last_name',
        'image_url',
      ],
      where: { id: { [Op.in]: userIds } },
    });

    const usersList = users.map((user) => user.dataValues);
    return res.json({ success: true, kids: usersList });
  } catch (err) {
    logger.error('Error in board users', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/events', auth, async (req, res) => {
  try {
    await boardEventsSchema.validateAsync(req.body, { abortEarly: false });
    const { board_id, start_date, end_date, kid_ids } = req.body;
    const eventsList = await Event.findAll({
      where: {
        board_id,
        end_date: {
          [Op.gte]: start_date,
        },
        start_date: {
          [Op.lte]: end_date,
        },
      },
    });

    let events = [];
    const original_events = eventsList.map((event) => event.dataValues);
    for (let e of original_events) {
      const exclusions = await Exclusion.findAll({
        where: { event_id: e.id },
      });
      const exclusion_list = exclusions.map((e) => e.dataValues);
      if (e.recurrence_pattern) {
        const rule = RRule.fromString(e.recurrence_pattern);
        const dates = rule.between(
          new Date(start_date),
          new Date(end_date),
          true
        );
        for (let date of dates) {
          const exclusion = exclusion_list.find(
            (e) => e.exclusion_timestamp.getTime() == date.getTime()
          );

          if (exclusion) {
            if (!exclusion.deleted) {
              if (!kid_ids || kid_ids.includes(exclusion.kid_id)) {
                events.push({
                  event_id: e.id,
                  parent_id: e.parent_id,
                  board_id: e.board_id,
                  kid_id: exclusion.kid_id,
                  name: exclusion.name,
                  description: exclusion.description,
                  current_event_timestamp: new Date(date).getTime(),
                  start_date: new Date(exclusion.start_date).getTime(),
                  end_date: new Date(
                    exclusion.start_date + exclusion.duration * 60000
                  ).getTime(),
                  duration: exclusion.duration,
                  notification_time: exclusion.notification_time,
                  recurrence_pattern: e.recurrence_pattern,
                });
              }
            }
          } else {
            if (!kid_ids || kid_ids.includes(e.kid_id)) {
              events.push({
                event_id: e.id,
                parent_id: e.parent_id,
                board_id: e.board_id,
                kid_id: e.kid_id,
                name: e.name,
                description: e.description,
                current_event_timestamp: new Date(date).getTime(),
                start_date: new Date(date).getTime(),
                end_date: new Date(date + e.duration * 60000).getTime(),
                duration: e.duration,
                notification_time: e.notification_time,
                recurrence_pattern: e.recurrence_pattern,
              });
            }
          }
        }
      } else {
        if (!kid_ids || kid_ids.includes(e.kid_id)) {
          events.push({
            event_id: e.id,
            parent_id: e.parent_id,
            board_id: e.board_id,
            kid_id: e.kid_id,
            name: e.name,
            description: e.description,
            current_event_timestamp: new Date(e.start_date).getTime(),
            start_date: new Date(e.start_date).getTime(),
            end_date: new Date(e.start_date + e.duration * 60000).getTime(),
            duration: e.duration,
            notification_time: e.notification_time,
            recurrence_pattern: e.recurrence_pattern,
          });
        }
      }
    }
    return res.json({
      success: true,
      size: Object.keys(events).length,
      events,
    });
  } catch (err) {
    logger.error('Error in board events', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
