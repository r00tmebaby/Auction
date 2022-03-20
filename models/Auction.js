const mongoose = require('mongoose')
const Item = require('../models/Item')
const moment = require('moment')
const AuctionModel = mongoose.Schema({
    starting_price:{
        type: Number,
        default: 0,
    },
    reg_date:{
        type: Number,
        default: moment().unix()
    },
    exp_date:{
         type: Number,
         required:true, 
    },
    bids:{
        type: Array,
        default: []
    },
    seller_id:{
        type: String
    },
    seller_name:{
        type: String
    },
    item: Item.schema.obj,

})

module.exports = mongoose.model('Auction', AuctionModel)