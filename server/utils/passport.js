const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const { User } = require('../models/index');
const logger = require('./winston');

const basicAuthenticateUser = async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return done(null, null, { message: 'User not found' });
    }
    if (!user.email_verified) {
      return done(null, null, { message: 'Email not verified' });
    }
    if (await bcrypt.compare(password, user.password_hash)) {
      delete user.dataValues.password_hash;
      return done(null, user.dataValues);
    } else {
      return done(null, null, { message: 'Incorrect password' });
    }
  } catch (err) {
    logger.error('Error in basicAuthenticateUser: ', err);
    return done(err);
  }
};

const oAuthAuthenticateUser = async (req, email, password, done) => {
  try {
    const { profile } = req.body;
    const user = await User.findOne({
      where: { email: profile.email },
    });
    if (user) {
      if (!user.email_verified) {
        return done(null, null, { message: 'Email not verified' });
      }
      delete user.dataValues.password_hash;
      done(null, user.dataValues);
    } else {
      const userPayload = {
        email: profile.email,
        display_name: profile.name,
        first_name: profile.given_name,
        last_name: profile.family_name,
        image_url: profile.picture,
        email_verified: profile.verified_email,
        external_type: profile.external_type,
        external_id: profile.id,
      };
      const createdUser = await User.create(userPayload);
      delete createdUser.dataValues.password_hash;
      done(null, createdUser.dataValues);
    }
  } catch (err) {
    logger.error('Error in oAuthAuthenticateUser: ', err);
    return done(err, null);
  }
};

passport.use(
  'basic-local',
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    basicAuthenticateUser
  )
);

passport.use(
  'oauth-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
    },
    oAuthAuthenticateUser
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findOne({ where: { id } })
    .then((user) => {
      delete user.dataValues.password_hash;
      done(null, user.dataValues);
    })
    .catch((err) => {
      logger.error('Error in deserializeUser: ', err);
      return done(err);
    });
});
