const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	telegramId: String,
	login: String,
	fullName: String,
	active: {
		type: Boolean,
		default: false
	},
	created: { 
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;