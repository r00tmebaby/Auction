const express = require('express')
const moment = require('moment')
const router = express.Router()
const Auction = require('../models/Auction')
const { auth, pagination, get_bids } = require('../modules')
const User = require('../models/User')


/************************************| GET |************************************************************
 * 
 *  Return user auctions history  | in which they have taken a part - bidding or selling
 *  parametres :type  - posible values [won, sold, lost]
 * 
 */
router.get("/history/:type", auth, async (req, res) => {

    const filter_exipred = { $lt: moment().unix() } // Select expired auctions only
    let auctions = []

    if (req.params.type === "sold") {

        auctions = await Auction.find(
            {
                seller_id: req.user._id, // when the seller is the currently logged user
                exp_date: filter_exipred, // when the time expired - aka. auction ended
                bids: { $ne: [] } // If there is at least one bid, then there is a winner
            }
        )
    }

    else if (req.params.type === "lost") {

        let tmp_auctions = await Auction.find({
            seller_id: { $ne: req.user._id }, // when the seller is the currently logged user
            exp_date: filter_exipred, // when the time has left
            bids: { $ne: [] } // If there is at least one bid, then there is a winner
            }
        )
        //Fill the array only with the actions that the currently logged user was not a winner
        for (let i = 0; i < tmp_auctions.length; i++) {
            //Get the winning bet
            let win_bid = get_bids(tmp_auctions[i].bids).slice(-1)[0]

            for (let j = 0; j < tmp_auctions[i].bids.length; j++) {
                //We check whether the current logged user has the winning bet, if not we add it to the list. The user bet but did not win
                if (tmp_auctions[i].bids[j].user === req.user._id && parseInt(win_bid) === parseInt(tmp_auctions[i].bids[j].bid)) {
                    auctions.push(tmp_auctions[i])
                }
            }
        }
    }
    else if (req.params.type === "won") {

        let tmp_auctions = await Auction.find({

            seller_id: { $ne: req.user._id }, // when the seller is NOT the currently logged user
            exp_date: filter_exipred, // when the time has left
            bids: { $ne: [] }  // If there is at least one bid, then there is a winner    
        },
            {
                bids: { $slice: -1 } //Get the last bid only (we are not interested in all bids only the winner)
            },
        )

        //Fill the array only with the actions that the currently logged user was a winner
        for (let i = 0; i < tmp_auctions.length; i++) {
            if (tmp_auctions[i].bids[0].user == req.user._id) {
                auctions.push(tmp_auctions[i])
            }
        }
    }
    pagination(req, res, auctions)
})

/************************************| GET |************************************************************
 * 
 * Get details about the currenlty logged user
 * 
 * */
 router.get("/details", auth, async (req, res) => {

    const user = await User.findById(req.user._id)
    return res.send({
      message: "Success",
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
        registered: user.registered_on,
      }
    })
  })

module.exports = router