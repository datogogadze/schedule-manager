const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
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
    // return res.redirect(`${process.env.CLIENT_ADDRESS}?id=${req.user.id}`);
    return res.redirect(`/auth/success`);
  }
);

router.get('/success', auth, (req, res) => {
  return res.send('success');
});

function validateLoginForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (
    !payload ||
    typeof payload.email !== 'string' ||
    payload.email.trim().length === 0
  ) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (
    !payload ||
    typeof payload.password !== 'string' ||
    payload.password.trim().length === 0
  ) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors,
  };
}

router.post('/local', (req, res, next) => {
  try {
    const validationResult = validateLoginForm(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
        errors: validationResult.errors,
      });
    }

    return passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: info.message,
        });
      }

      req.login(user, err => {
        if (err) {
          return res.status(502).json({ message: err.message });
        }
      });

      return res.json({
        success: true,
        message: 'logged in',
        id: user.id,
      });
    })(req, res, next);
  } catch (err) {
    return res.status(502).json({
      message: err.message,
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(400).json({
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
    res.json({
      message: 'created',
      id: createdUser.id,
    });
  } catch (err) {
    return res.status(502).json({ message: err.message });
  }
});

router.get('/user/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        message: 'not found',
      });
    }
    delete user.dataValues.password_hash;
    return res.json(user);
  } catch (err) {
    return res.status(502).json({
      message: err.message,
    });
  }
});

router.get('/logout', function (req, res) {
  req.logout();
  return res.json({ message: 'logged out' });
});

module.exports = router;
