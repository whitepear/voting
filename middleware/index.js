function loggedOut(req, res, next) {
	// prevent logged in users from accessing a route
  if (req.session && req.session.userId) {
    res.redirect('/profile');
  }
  next();
}

function loggedIn(req, res, next) {
	// prevent unauthenticated users from accessing a route
	if (req.session & req.session.userId) {
		next();
	}
	var err = new Error('You are not authorized to view this page.');
	err.status = 401; // 'unauthorized'
	next(err);
}

module.exports.loggedOut = loggedOut;
module.exports.loggedIn = loggedIn;