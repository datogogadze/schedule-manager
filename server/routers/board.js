const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  boardSchema,
  boardAddUserSchema,
  boardRemoveUserSchema,
  boardUsersSchema,
} = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const crypto = require('crypto');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const boards = await UserBoard.findAll({ where: { user_id: userId } });
    return res.json({ success: true, ...boards.dataValues });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

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
    return res.json({ success: true, ...createdBoard.dataValues });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/add-user', auth, async (req, res) => {
  try {
    await boardAddUserSchema.validateAsync(req.body, { abortEarly: false });
    const { code, user_id, role } = req.body;
    const board = await Board.findOne({ where: { code } });
    if (!board) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect code' });
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
        board_id: board.id,
      },
    });

    if (userBoard) {
      return res
        .status(400)
        .json({ success: false, message: 'User already on this board' });
    }

    const addUserPayload = {
      user_id,
      board_id: board.id,
      role,
    };
    const result = await UserBoard.create(addUserPayload);
    return res.json({ success: true, ...result.dataValues });
  } catch (err) {
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
    if (board.creator_id != req.user.id) {
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

    const result = await UserBoard.destroy({
      where: {
        board_id,
        user_id,
      },
    });

    return res.json({ success: true, ...result.dataValues });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.get('/users', auth, async (req, res) => {
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
    const userIds = userBoards.map((user) => user.user_id);
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
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
