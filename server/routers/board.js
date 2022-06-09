const router = require('express').Router();
const auth = require('../middleware/auth');
const { Role } = require('../utils/enums');
const { boardSchema } = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const boards = await UserBoard.findAll({ where: { userId } });
    res.json(boards);
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    await boardSchema.validateAsync(req.body, { abortEarly: false });
    const userId = req.user.id;
    const { name, role } = req.body;
    // if (!Role.has(role)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Incorrect role' });
    // }
    const code = Math.floor(Math.random() * 1000000000);
    const boardPayload = {
      name,
      role,
      code,
      creator_id: userId,
    };
    const createdBoard = await Board.create(boardPayload);
    const userBoardPayload = {
      user_id: userId,
      board_id: createdBoard.id,
    };
    await UserBoard.create(userBoardPayload);
    return res.json(createdBoard);
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
