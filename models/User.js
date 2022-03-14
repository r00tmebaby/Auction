const mongoose = require('mongoose')
const moment = require('moment')

const UserModel = mongoose.Schema({
    name:{
        type: String,
        required: true,
        min:3,
        max:255,
    },
    surname:{
        type: String, 
        required: true,
        min:3,
        max:255,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        min:6,
        max:255
    },
    password:{
        type: String,
        required: true,
        min:6, 
        max:255
    },
    registered_on:{
        type: Number,
         default: moment().unix()
    }
})

module.exports = mongoose.model('User', UserModel)