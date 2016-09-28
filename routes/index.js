var express = require('express');
var router = express.Router();
var mid = require('../middleware');
var User = require('../models/user.js');

// GET /
router.get('/', function(req, res, next) {
	User.find({ polls: { $gt: [] } }, { email: 0, password: 0, __v: 0 }, { sort: {"polls.createdOn": -1} }, function(err, docs) {
		if (err) {
			var err = new Error('Database query for GET "/" failed.');
			err.status = 500; // internal server error
			next(err);
		} else {			
			res.render('index', { title: 'Home', userDocs: docs });
		}				
	});	
});

// POST /

// GET /poll
router.get('/poll/:pollId', function(req, res, next) {
	User.findOne({"polls._id": req.params.pollId}, { email: 0, password: 0, __v: 0 }, function(err, doc) {
		if (err) {
			var err = new Error('Database query for GET "/poll/:pollId" failed.');
			err.status = 500; // internal server error
			next(err);
		} else {	
			// remove the nested poll documents within the returned document 
			// that do not have the _id passed as a route param
			var unfilteredPolls = doc.polls;
			var filteredPoll = unfilteredPolls.filter(function(poll) {
				return poll._id == req.params.pollId;
			});			
			doc.polls = filteredPoll;
			res.render('poll', { title: 'Poll', poll: doc });
		}
	});
});

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
				password: req.body.password,
				polls: []
			};
			// use the schema's create method to insert a new document into database,
			// based on the model specified by the schema
			User.create(userData, function(err, user) {
				if (err) {
					next(err);
				} else {
					// this session assignment causes a person to automatically log in upon registration.
					req.session.userId = user._id;
					res.redirect('/profile');
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
					var currentHour = (new Date()).getHours();
					if (currentHour >= 5 && currentHour < 12) {
						var timeOfDay = 'this morning';
					} else if (currentHour >= 12 && currentHour < 17) {
						timeOfDay = 'this afternoon';
					} else if (currentHour >= 17 && currentHour < 20) {
						timeOfDay = 'this evening';
					} else {
						timeOfDay = 'tonight';
					}
					res.render('profile', {title: 'Profile', name: user.username, timeOfDay: timeOfDay });
				}
			});
});

// POST /profile
router.post('/profile', function(req, res) {
	var formKeys = Object.keys(req.body);
	var pollName = req.body[formKeys[0]];
	var pollOptions = [];
	for (var i = 1; i < formKeys.length; i++) {
		pollOptions.push(req.body[formKeys[i]]);
	}
	User.update({_id: req.session.userId}, {$push: {polls: {
		pollName: pollName,
		pollOptions: pollOptions
	}}}, function() {
		res.redirect('/');
	});		
});

module.exports = router;