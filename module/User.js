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
    datecreated : {
        type: Date,
    },
    school : {
        type : String
    },
    
    achievements : {
        type : String
    },

    about : {
        type : String
    },

    score : {
        type : Number,
    },

    dateupdated : {
        type : Date,
        default : Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;