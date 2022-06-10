const router = require('express').Router();
const auth = require('../middleware/auth');
const { userBoardsSchema } = require('../utils/validation');
const UserBoard = require('../models/index').UserBoard;
const Board = require('../models/index').Board;
const User = require('../models/index').User;
const { Op } = require('sequelize');

router.get('/boards', auth, async (req, res) => {
  try {
    await userBoardsSchema.validateAsync(req.body, { abortEarly: false });
    const { user_id } = req.body;
    if (user_id != req.user.id) {
      return res.status(403).json({ success: false, message: 'unauthorized' });
    }
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect user_id' });
    }
    const userBoards = await UserBoard.findAll({ where: { user_id } });
    const boardIds = userBoards.map((board) => board.board_id);
    const boards = await Board.findAll({
      attributes: ['id', 'name', 'code', 'image_url'],
      where: { id: { [Op.in]: boardIds } },
    });
    const boardsList = boards.map((board) => board.dataValues);
    return res.json({ success: true, boards: boardsList });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
