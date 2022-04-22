const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const { User } = require('./models/index');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.HOST_ADDRESS}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ where: { external_id: profile.id } });
        if (user) {
          delete user.dataValues.password_hash;
          done(null, user.dataValues);
        } else {
          const userPayload = {
            email: profile.emails[0].value,
            display_name: profile.displayName,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            image_url: profile.photos[0].value,
            external_type: 'google',
            external_id: profile.id,
          };
          const createdUser = await User.create(userPayload);
          delete createdUser.dataValues.password_hash;
          done(null, createdUser.dataValues);
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);

const authenticateUser = async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user == null) {
      return done(null, null, { message: 'user not found' });
    }
    if (await bcrypt.compare(password, user.password_hash)) {
      delete user.dataValues.password_hash;
      return done(null, user.dataValues);
    } else {
      return done(null, null, { message: 'password incorrect' });
    }
  } catch (err) {
    return done(err);
  }
};

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    authenticateUser
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findOne({ where: { id } })
    .then(user => {
      delete user.dataValues.password_hash;
      done(null, user.dataValues);
    })
    .catch(err => done(err));
});
