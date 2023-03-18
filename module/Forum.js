const mongoose = require('mongoose');

const userForum = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    content : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        default: Date.now
    },
});

const Forum = mongoose.model('Forum', userForum);

module.exports = Forum;