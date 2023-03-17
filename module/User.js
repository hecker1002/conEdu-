const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        default: Date.now
    },
});

const questionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	options: {
		type: [String],
		required: true
	},
	correct: {
		type: String,
		required: true
	}
});

const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', questionSchema);

module.exports = User;
module.exports = Question;