var express = require('express');
var router = express.Router();
var mid = require('../middleware');
var User = require('../models/user.js');

// GET /
router.get('/', function(req, res, next) {	
	var itemsPerPage = 10;
	var page = req.query.page ? parseInt(req.query.page) : 0;
	User.aggregate([
		{ $match: { polls: { $gt: [] } } },			
		{ $unwind: "$polls" },
		{ $group: { 
			_id: null,
			polls: { $push: { pollName: "$polls.pollName", createdOn: "$polls.createdOn", _id: "$polls._id" } },
			totalDocs: { $sum: 1 }
		} },
		{ $unwind: "$polls" },					
		{ $sort: { "polls.createdOn": -1 } },
		{ $skip: page * itemsPerPage },
		{ $limit: itemsPerPage },
		{ $project: {
			_id: 0,
			pollName: "$polls.pollName",
			pollId: "$polls._id",
			totalDocs: 1		
		} }
	], function(err, docs) {
		if (err) {
			var err = new Error('Database query for GET "/" failed.');
			err.status = 500; // internal server error
			next(err);
		} else {			
			res.render('index', { title: 'Home', userPolls: docs, pageNumber: page, itemsPerPage: itemsPerPage, totalDocs: docs[0].totalDocs });
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
			// that do not possess the _id specified in the route param
			var unfilteredPolls = doc.polls;
			var filteredPoll = unfilteredPolls.filter(function(poll) {
				return poll._id == req.params.pollId;
			});			
			doc.polls = filteredPoll;
			res.render('poll', { title: 'Poll', userDoc: doc, logInStatus: req.session.userId, userJSON: JSON.stringify(doc) });
		}
	});
});

// POST /poll/:pollId
router.post('/poll/:pollId', function(req, res, next) {		
	var selectedOption = req.body.pollSelect;
	var userDocId = req.query.userId;
	var pollId = req.params.pollId;	

	User.findOne({ _id: userDocId }, { polls: 1, _id: 0 }, function(err, doc) {
		if (err) {
			var err = new Error('"/poll/:pollId" findOne error.');
			err.status = 500; // internal server error
			next(err);
		} else {
			// the var pollId (above) has the _id of a particular document.
			// use that _id to find the index of this document within the doc.polls array.
			for (var i = 0; i < (doc.polls).length; i++) {
				if ((doc.polls[i]._id).toString() === pollId) {
					var pollDocIndex = i;
					break;
				}
			}
			// the var selectedOption (above) has the _id of a particular document.
			// use that _id to find the index of this document within the
			// doc.polls[pollDocIndex].pollOptions array.
			for (i = 0; i < (doc.polls[pollDocIndex].pollOptions).length; i++) {
				if (doc.polls[pollDocIndex].pollOptions[i].optionName === selectedOption) {
					var optionDocIndex = i;
					break;
				}
			}
			
			// call update to ensure atomic update (rather than .save)
			// this inefficiency can be solved in future projects by better designed schemas
			// and/or multiple collections		

			// update document is programmatically constructed using the indices obtained
			// via the for loops above.
			var updateDocument = {};
			updateDocument.$inc = {};
			updateDocument.$inc['polls.' + pollDocIndex + '.pollOptions.' + optionDocIndex + '.votes'] = 1;
			
			User.update({ _id: userDocId }, updateDocument, function(err) {
				if (err) {
					var err = new Error('An error occurred while submitting your vote.');
					err.status = 500; // internal server error
					next(err);
				} else {					
					res.redirect('/poll/' + pollId);
				}
			});
		}
	});
});

// POST /addOption/:pollId
router.post('/addOption/:pollId', mid.loggedIn, function(req, res, next) {
	User.update({ "polls._id": req.params.pollId }, { $push: { "polls.$.pollOptions": { optionName: req.body.newOption } } }, function(err) {
		if (err) {
			var err = new Error('An error occurred while adding your option to the database.');
			err.status = 500; // internal server error
			next(err);
		} else {
			res.redirect('/poll/' + req.params.pollId);
		}		
	}); 
});

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
					res.render('profile', {title: 'Profile', userDoc: user, timeOfDay: timeOfDay });
				}
			});
});

// POST /profile
router.post('/profile', mid.loggedIn, function(req, res, next) {
	var formKeys = Object.keys(req.body);
	var trimmedTitle = (req.body[formKeys[0]]).trim();

	formKeys = formKeys.slice(1); // remove poll title from formKeys array

	// trim keys, filter out empty strings
	var trimmedFormKeys = formKeys.map(function(key) {
		key = (req.body[key]).trim();
		return key;		
	}).filter(function(key) {
		return key.length > 0;
	});
	
	// filter out duplicate array entries, then place each entry
	// within an object in order to match the schema
	var seen = {};
  var uniqueFormKeys = trimmedFormKeys.filter(function(key) {
      return seen.hasOwnProperty(key) ? false : (seen[key] = true);
  }).map(function(key) {
  	return {
			optionName: key
  	};
  });

	if (trimmedTitle.length === 0 || uniqueFormKeys.length <= 1) {
		// if trimmed title is an empty string or there isn't more
		// than one voting option, call next(err)
		var err = new Error('Please make sure title and options fields are filled out correctly.\n Duplicate poll options will be ignored.');
		err.status = 400; // bad request
		next(err);
	} else {				
		User.update({_id: req.session.userId}, {$push: {polls: {
			pollName: trimmedTitle,
			pollOptions: uniqueFormKeys
		}}}, function() {
			res.redirect('/profile');
		});		
	}
});

module.exports = router;