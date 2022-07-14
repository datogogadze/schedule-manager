const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  passwordSchema,
  emailSchema,
  oAuthSchema,
} = require('../utils/validation');
const { sendVerificationMail, sendResetPasswrdMail } = require('../utils/mail');
const jwt = require('jsonwebtoken');
const logger = require('../utils/winston');
const User = require('../models/index').User;

router.get('/success', auth, (req, res) => {
  return res.json({ success: true });
});

router.post('/oauth', async (req, res, next) => {
  try {
    await oAuthSchema.validateAsync(req.body, { abortEarly: false });
    return passport.authenticate('oauth-local', (err, user, info) => {
      if (err) {
        logger.error('Error in oauth-local: ', err);
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

      req.login(user, (err) => {
        if (err) {
          logger.error('Error in oauth req login: ', err);
          return res.status(502).json({
            success: false,
            message: err.message,
          });
        }
      });

      return res.json({
        success: true,
        user: {
          ...user,
          session_expires: req.session.cookie._expires.getTime(),
        },
        message: 'Login successful',
      });
    })(req, res, next);
  } catch (err) {
    logger.error('Error in oauth: ', err);
    return res.status(502).json({
      success: false,
      message: err.message,
    });
  }
});

router.post('/basic', async (req, res, next) => {
  try {
    await loginSchema.validateAsync(req.body, { abortEarly: false });
    return passport.authenticate('basic-local', (err, user, info) => {
      if (err) {
        logger.error('Error in basic-local: ', err);
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

      req.login(user, (err) => {
        if (err) {
          logger.error('Error in req login basic: ', err);
          return res.status(502).json({
            success: false,
            message: err.message,
          });
        }
      });

      return res.json({
        success: true,
        user: {
          ...user,
          session_expires: req.session.cookie._expires.getTime(),
        },
        message: 'Login successful',
      });
    })(req, res, next);
  } catch (err) {
    logger.error('Error in basic: ', err);
    return res.status(502).json({
      success: false,
      message: err.message,
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    await registerSchema.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'user already exists',
        });
      } else {
        await User.destroy({ where: { email: req.body.email } });
      }
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
    delete createdUser.dataValues.password_hash;
    return res.json({
      success: true,
      message: 'created',
      user: {
        ...createdUser.dataValues,
        session_expires: req.session.cookie._expires.getTime(),
      },
    });
  } catch (err) {
    logger.error('Error in register: ', err);
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
          logger.error('Error cinfirm token verify: ', err);
          return res.send(
            `
            <html>
              <body style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    ">
                <h1>დაფიქსირდა შეცდომა</h1>
              </body>
            </html>
            `
          );
        }
        const id = decoded.id;
        const user = await User.findOne({ where: { id } });
        if (!user) {
          return res.send(
            `
            <html>
              <body style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    ">
                <h1>მომხმარებელი ვერ მოიძებნა</h1>
              </body>
            </html>
            `
          );
        }
        if (user.dataValues.email_verified) {
          return res.send(
            `
            <html>
              <body style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    ">
                <h1>ამ მომხმარებელზე იმეილი უკვე ვერიფიცირებულა</h1>
              </body>
            </html>
            `
          );
        }
        await User.update({ email_verified: true }, { where: { id } });
        return res.send(
          `
          <html>
            <body style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  ">
              <h1>იმეილის ვერიფიკაცია წარმატებით დასრულდა</h1>
            </body>
          </html>
          `
        );
      }
    );
  } catch (err) {
    logger.error('Error in confirm token: ', err);
    return res.send(
      `
      <html>
        <body style="
              display: flex;
              justify-content: center;
              align-items: center;
              ">
          <h1>დაფიქსირდა შეცდომა</h1>
        </body>
      </html>
      `
    );
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
    logger.error('Error in confirm resend: ', err);
    return res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/password/reset/send', async (req, res) => {
  try {
    await emailSchema.validateAsync(req.body, { abortEarly: false });
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }
    sendResetPasswrdMail(email);
    return res.json({ success: true, message: 'Password reset mail sent' });
  } catch (err) {
    logger.error('Error in reset resend: ', err);
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
          logger.error('Error in password reset token verify: ', err);
          return res.send(
            `
            <html>
              <body style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    ">
                <h1>დაფიქსირდა შეცდომა</h1>
              </body>
            </html>
            `
          );
        }
        const id = decoded.id;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.update({ password_hash: hashedPassword }, { where: { id } });
        return res.send(
          `
          <html>
            <body style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
            ">
              <h1>პაროლის ცვლილება წარმატებით დასრულდა</h1>
            </body>
          </html>
          `
        );
      }
    );
  } catch (err) {
    logger.error('Error in password reset token: ', err);
    return res.send(
      `
      <html>
        <body style="
              display: flex;
              justify-content: center;
              align-items: center;
              ">
          <h1>დაფიქსირდა შეცდომა</h1>
        </body>
      </html>
      `
    );
  }
});

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'logged out' });
  });
});

module.exports = router;
