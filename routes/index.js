var express = require('express');
var router = express.Router();

// GET /:poll
router.get('/:poll', function(req, res, next) {
  if (req.params.poll) {
		// call database with poll ID provided
		// pass in info via locals object
		// render poll template 
  } else {  	
  	res.render('index', { title: 'Home' });
  }
});

// POST /

// GET /register
router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Register' });
});

// POST /register

// GET /login
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

// POST /login



module.exports = router;