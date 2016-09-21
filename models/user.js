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
	}
});

UserSchema.pre('save', function (next) {
	// mongoose assigns the db object to be inserted to 'this'
	var user = this;

	bcrypt.hash(user.password, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();	
	});
});

var User = mongoose.model('User', UserSchema);
module.exports = User;