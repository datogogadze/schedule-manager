const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  passwordSchema,
  emailSchema,
} = require('../utils/validation');
const { sendVerificationMail, sendResetPasswrdMail } = require('../utils/mail');
const jwt = require('jsonwebtoken');
const User = require('../models/index').User;

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_ADDRESS}`,
  }),
  (req, res) => {
    return res.redirect(`${process.env.CLIENT_ADDRESS}?id=${req.user.id}`);
  }
);

router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${process.env.CLIENT_ADDRESS}`,
  }),
  (req, res) => {
    // return res.redirect(`${process.env.CLIENT_ADDRESS}?id=${req.user.id}`);
    return res.redirect(`/auth/success`);
  }
);

router.get('/success', auth, (req, res) => {
  return res.send('success');
});

router.post('/local', async (req, res, next) => {
  try {
    await loginSchema.validateAsync(req.body, { abortEarly: false });
    return passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: info.message
        });
      }

      req.login(user, err => {
        if (err) {
          return res.status(502).json({
            success: false,
            message: err.message
          });
        }
      });

      return res.json({
        success: true,
        id: user.id,
        message: 'Login successful',
      });
    })(req, res, next);
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: err.message
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    await registerSchema.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userPayload = {
      email: req.body.email,
      display_name: `${req.body.firstName} ${req.body.lastName}`,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      password_hash: hashedPassword,
    };
    const createdUser = await User.create(userPayload);
    sendVerificationMail(req.body.email);
    return res.json({
      success: true,
      message: 'created',
      id: createdUser.id,
    });
  } catch (err) {
    return res.status(502).json({ successs: false, message: err.message });
  }
});

router.get('/confirm/:token', async (req, res) => {
  try {
    jwt.verify(
      req.params.token,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.json(400).json({ message: err.message });
        }
        const id = decoded.id;
        await User.update({ email_verified: true }, { where: { id } });
        return res.json({ message: 'email verified' });
      }
    );
  } catch (err) {
    return res.status(502).json({ message: err.message });
  }
});

router.post('/confirm/resend', async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email } });
    if (user) {
      sendVerificationMail(email);
      return res.json({ success: true, message: 'Email sent' });
    }
    return res.status(400).json({ success: false, message: 'User not found' });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/password/reset/send', async (req, res) => {
  try {
    await emailSchema.validateAsync(req.body, { abortEarly: false });
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    sendResetPasswrdMail(email);
    return res.json({ success: true, message: 'Password reset mail sent' });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/password/reset/:token', async (req, res) => {
  try {
    await passwordSchema.validateAsync(req.body, { abortEarly: false });
    jwt.verify(
      req.params.token,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.json(400).json({ message: err.message });
        }
        const id = decoded.id;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.update({ password_hash: hashedPassword }, { where: { id } });
        return res.json({ message: 'password changed' });
      }
    );
  } catch (err) {
    return res.status(502).json({ message: err.message });
  }
});

router.get('/logout', function (req, res) {
  req.logout();
  return res.json({ message: 'logged out' });
});

module.exports = router;
