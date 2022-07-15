const router = require('express').Router();
const { loginSchema, logoutSchema } = require('../utils/validation');
const logger = require('../utils/winston');
const UserDevice = require('../models/index').UserDevice;
const User = require('../models/index').User;

router.post('/login', async (req, res) => {
  try {
    await loginSchema.validateAsync(req.body, { abortEarly: false });
    const { user_id, device_token, session_expires } = req.body;
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'user not found' });
    }
    const user_device = await UserDevice.findOne({
      where: { user_id, device_token },
    });

    await UserDevice.update({ logged_in: false }, { where: { device_token } });

    if (user_device) {
      await UserDevice.update(
        { user_id, device_token, logged_in: true, session_expires },
        { where: { user_id, device_token } }
      );
    } else {
      await UserDevice.create({
        user_id,
        device_token,
        logged_in: true,
        session_expires,
      });
    }

    return res.json({ succes: true });
  } catch (err) {
    logger.error('Error in device login', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await logoutSchema.validateAsync(req.body, { abortEarly: false });
    const { user_id, device_token } = req.body;
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'user not found' });
    }
    await UserDevice.update(
      { logged_in: false },
      { where: { user_id, device_token } }
    );
    return res.json({ succes: true });
  } catch (err) {
    logger.error('Error in device logout', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
