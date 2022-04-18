const router = require('express').Router();
const passport = require('passport');
const User = require('../models/index').User;

router.get(
  '/google',
  passport.authenticate('google', { scope: ['openid', 'profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'exp://192.168.1.106:19000/--/login',
  }),
  (req, res) => {
    // return res.redirect('exp://192.168.1.106:19000/--/login?id=' + req.user.id);
    return res.redirect(`exp://192.168.1.106:19000?id=${req.user.id}`);
  }
);

router.get('/user/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ where: { id } });
  return res.json(user.dataValues);
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
