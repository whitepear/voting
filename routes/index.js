var express = require('express');
var router = express.Router();
var mid = require('../middleware');
var User = require('../models/user.js');

// GET /
router.get('/', function(req, res, next) {
	if (req.params.poll) {
		res.render('poll', { title: 'Poll' });
	} else {
		res.render('index', { title: 'Home' });
	}
});

// POST /

// GET /poll

// POST /poll

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
	res.render('register', { title: 'Register' });
});

// POST /register
router.post('/register', function (req, res, next) {	
	if (req.body.username && req.body.email && req.body.password && req.body.confirmPassword) {
		if (req.body.password !== req.body.confirmPassword) {
			var err = new Error('The passwords provided do not match.');
			err.status = 400; // bad request
			next(err);
		}	else {
			// create object with form-data
			// this will represent the document to be inserted into the database
			var userData = {
				username: req.body.username,
				email: req.body.email,
				password: req.body.password
			};
			// use the schema's create method to insert a new document into database,
			// based on the model specified by the schema
			User.create(userData, function(err, user) {
				if (err) {
					next(err);
				} else {
					res.redirect('/');
				}
			});
		}
	} else {
		var err = new Error('Please fill out all form-fields before submission.');
		err.status = 400; // bad request
		next(err);
	}
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
	res.render('login', { title: 'Login' });
});

// POST /login
router.post('/login', function(req, res, next) {
	if (req.body.username && req.body.password) {
		User.authenticate(req.body.username, req.body.password, function(err, user) {
			if (err || !user) {
				var err = new Error('Wrong username or password.');
				err.status = 401;
				next(err);
			} else {		
				req.session.userId = user._id;
				res.redirect('/');
			}
		});
	} else {
		var err = new Error('Please make sure both fields are filled in.');
		err.status = 401; // unauthorized/bad authentication
		next(err);
	}
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /profile
router.get('/profile', mid.loggedIn, function(req, res, next) {
	User.findById(req.session.userId)
			.exec(function (err, user) {
				if (err) {
					next(err);
				} else {
					res.render('profile', {title: 'Profile', name: user.username});
				}
			});
});

module.exports = router;