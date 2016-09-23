function loggedOut(req, res, next) {
	// prevent logged in users from accessing a route
  if (req.session && req.session.userId) {
    res.redirect('/profile');
  }
  next();
}

module.exports.loggedOut = loggedOut;