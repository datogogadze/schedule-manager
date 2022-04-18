module.exports = (req, res, next) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    message: 'unauthorized',
  });
};
