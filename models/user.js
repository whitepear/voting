var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({	
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	polls: [{
		pollName: String,
		pollOptions: [{
			optionName: String,
			votes: {
				type: Number,
				default: 0
			}
		}], 
		createdOn: { type: Date, default: Date.now }
	}]
});

UserSchema.statics.authenticate = function(username, password, callback) {
	// authenticate using username
	User.findOne({ username: username })
			.exec(function(err, user) {				
				if (err) {
					return callback(err);
				} else if (!user) {					
					var err = new Error('User not found.');
					err.status = 401;
					return callback(err);
				}
				// if no errors, use .compare to compare supplied pass with hashed ver.
				bcrypt.compare(password, user.password, function(err, result) {					
					if (result) {
						return callback(null, user);						
					} else {
						return callback();
					}
				});
			});
}

UserSchema.statics.authenticateWithId = function(userId, password, callback) {
	// authenticate using userId
	User.findOne({ _id: userId })
			.exec(function(err, user) {				
				if (err) {
					return callback(err);
				} else if (!user) {					
					var err = new Error('User not found.');
					err.status = 401;
					return callback(err);
				}
				// if no errors, use .compare to compare supplied pass with hashed ver.
				bcrypt.compare(password, user.password, function(err, result) {					
					if (result) {
						return callback(null, user);						
					} else {
						return callback();
					}
				});
			});
}

UserSchema.pre('save', function (next) {
	// mongoose assigns the db object to be inserted to 'this'
	var user = this;

	bcrypt.hash(user.password, 12, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();	
	});
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
