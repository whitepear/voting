var express = require('express');
var router = express.Router();
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
router.get('/register', function(req, res, next) {
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
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

// POST /login

router.post('/login', function(req, res, next) {
	res.send('Logged in.');
});

module.exports = router;