const jsonwebtoken = require('jsonwebtoken')
const {pagiValidation} = require('./validators')

//Get all bids made to the item. Expects item 
const get_bids = bids => {  
    let bidding = new Array()
    for (let i = 0; i < bids.length; i++) {
        bidding.push(parseFloat(bids[i].bid))
    }
    return bidding.sort()
}

//Wrap the results in a pagination
async function pagination (req, res, array){
    const {error} = pagiValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }
    const check_page = isNaN(req.body.page) || parseInt(req.body.page) < 0 // We expect a positive integer value for page 
    const page = req.body.page === undefined || check_page ? 1 : parseInt(req.body.page) // Return 1 if false otherways the requested page
    const limit = req.body.limit === undefined || check_page ? 10 : parseInt(req.body.limit) // Return 10 if false otherways the requested limit
    try {
        start = limit * (page - 1)
        res.send({
            message: "Success",
            data: array.slice(start, start + limit), // start-end 
            metadata: {
                current_page: page,
                current_limit: limit,
                total_records: array.length,
                total_pages: Math.ceil(array.length / limit),
                has_more: page * limit < array.length
            }
        })
    } catch (error) {
        res.send({
            message: error
        })
    }
}

//Format an integer or float number to money with their currency
const get_money = (money, locale = "en-UK", currency = "GBP") => {
    return money.toLocaleString(locale, {
        style: 'currency',
        currency: currency,
    });
}

// Auth function will veryfy the token and return 
function auth(req, res, next){
    const  token = req.header('auth-token')
    if(!token){
        return res.status(401).send({message: "Not authenticated"})
    }
    try{
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    }
    catch{
        return res.status(401).send({message: "Invalid token"})
    }
}

module.exports.auth = auth
module.exports.pagination = pagination
module.exports.get_bids = get_bids
module.exports.get_money = get_money