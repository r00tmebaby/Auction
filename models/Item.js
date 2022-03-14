const mongoose = require('mongoose')

const ItemsModel = mongoose.Schema({
    title:{
        type: String,
        required: true,
        min: 4
    },
    condition:{
        type: String,
        enum: ["New", "Used"],
        required: true,
        min: 3
    },
    description:{
        type: String,
        required: true,
        min: 10
    },
    other_info:{
        type: JSON
    }
})

module.exports = mongoose.model('Item', ItemsModel, "Item")