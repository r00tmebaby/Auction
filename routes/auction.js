const express = require('express')
const moment = require('moment')
const router = express.Router()
const Auction = require('../models/Auction')
const Item = require('../models/Item')
const mongoose = require('mongoose')
const { bidItemValidation, postAuctionValidation } = require('../validators')
const { auth, get_bids, get_money, pagination } = require('../modules')
const User = require('../models/User')



/************************************| GET |************************************************************
 *  
 * Display all available auctions
 * 
 * */
router.get("/:type", auth, async (req, res) => {
    let auctions = []
    if(req.params.type !== undefined){
        // Route api/auction/expired 
        if(req.params.type === "noexpired"){
            const not_expired  = {exp_date: {$gt:moment().unix()}}
            auctions = await Auction.find(not_expired)
        }
        else if(req.params.type === "expired"){
            const not_expired  = {exp_date: {$lt:moment().unix()}}
            auctions = await Auction.find(not_expired)
        }
        // Route api/auction/all 
        else if (req.params.type === "all"){
            auctions = await Auction.find()
        }
    }
    pagination(req, res, auctions)
})

/************************************| POST |************************************************************
 *  
 * Place a bid to item that is posted in an auction 
 * 
 * */
router.post("/bid", auth, async (req, res) => {


    // Validation 1 to check user input
    const { error } = bidItemValidation(req.body)
    if (error) {
        return res.status(400).send({ message: error['details'][0]['message'] })
    }


    // Checks whether the selected item exists in the auction
    if (!mongoose.Types.ObjectId.isValid(req.body.item_id)) {
        return res.send({
            message: "This auction does not exist"
        })
    }
    

    const found_auction = await Auction.findById({_id:req.body.item_id}) //Get the auction by id 

    // Checks if the auction is active
    if (!found_auction || parseInt(found_auction.exp_date) < moment().unix()) {
        return res.send({
            message: "This auction has expired or does not exist"
        })
    }

    // Whenever we are sure that the request data is valid structure we can proceed with the next steps
    const bids = get_bids(found_auction.bids)

    // Checks if the item belong to the currently logged user (very common mistake left by programmers by not checking this constraint)
    if (found_auction.seller_id == req.user._id)
        return res.send({
            message: "You can not bid for your own item"
    })

    // Checks if the bidder is trying to bid lower than asked amount
    else if (found_auction.starting_price >= req.body.bid) {
        return res.send({
            message: "Sorry, the seller has a starting price of " + get_money(found_auction.starting_price)
        })
    }

    // Checks if the bidder is trying to bid lower amount
    else if (Math.max(...bids) >= req.body.bid) {
        return res.send({
            message: "You can not underbid the current highest bid of " + get_money(Math.max(...bids))
        })
    }

    // Checks if the bidder is trying bid higher than the pre-set highest value (max int, makes no sense for higher than 5-10k per bid in real life anyway)
    else if (parseFloat(process.env.MAX_BID) < req.body.bid) {
        return res.send({
            message: "The highest posible value to bid is " + get_money(process.env.MAX_BID)
        })
    }

    else {
        // Parse the string to float to put the record as a real number (we can not trust the user inut)
        const actual_bid = parseFloat(req.body.bid)
        found_auction.bids.push({
            user: req.user._id,
            bid: actual_bid
        })

        try {
            found_auction.save()
            return res.send({
                message: "Your bid of " + get_money(actual_bid) + " was placed successfuly"
            })
        } catch (error) {
            return res.status(400).send({
                message: "There is an error contact the administrator"
            })
        }
    }
})

/************************************| POST |************************************************************
 *  
 * Add a new item to the auction
 * 
 * */
router.post("/add", auth, async (req, res) => {

    // Validation 1 to check user input
    const { error } = postAuctionValidation(req.body)
    if (error) {

        return res.status(400).send({ message: error['details'][0]['message'] })
    }

    const new_item = new Item({
        title: req.body.item.title,
        condition: req.body.item.condition,
        description: req.body.item.description,
    })

    /*
    We search for identical item title, description, condition and seller. 
    Each seller can have multiple items. Another good approach would be to
    hash/checksum multiple values on item submition and save it in the 
    database so that we minimize this checking here and compare the hashes instead.
    */
    const exist = await Auction.findOne({
        seller_id: req.user._id,
        "item.title": new_item.title,
        "item.condition": new_item.condition,
        "item.description": new_item.description
    })
    if (exist)
        return res.json({
            message: "This item is added already"
        })
    
    const new_auction = new Auction({
        // From the request exp_time and exp_type will be converted to timestamp
        exp_date: moment().add(req.body.exp_time, req.body.exp_type).unix(), 
        starting_price: req.body.starting_price,
        price: req.body.price,
        seller_id: req.user._id,
        item: new_item,
    })

    try {
        await new_auction.save()
        return res.json({
            message: "The new Item has been added to the auction"
        })
    } catch (err) {
        return res.json({
            message: err
        })
    }
})

module.exports = router