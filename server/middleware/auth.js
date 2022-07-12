module.exports = (req, res, next) => {
  if (req.headers.auth == process.env.NOTIFICATION_SERVICE_SECRET) {
    return next();
  }
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'unauthenticated',
  });
};
