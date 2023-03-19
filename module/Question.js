const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
	data : {
        type: Object,
        required: true
    },

    date : {
        type: Date,
        default: Date.now
    },

    creatorId: {
        type: String,
        required: true
    }
});

const Question = mongoose.model('Question', questionSchema);


module.exports = Question;
