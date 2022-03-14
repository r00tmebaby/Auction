const joi = require('@hapi/joi')

// Validate post data on register request
const registerValidation = data => {
    const registerSchema = joi.object({
        name:joi.string().required().min(3).max(256),
        surname:joi.string().required().min(3).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return registerSchema.validate(data)
}

// Validate post data on login request
const loginValidation = data => {
    const loginSchema = joi.object({
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return loginSchema.validate(data)
}

// Validate user auction history
const historyValidation = data => {
    const historySchema = joi.object({
        history_type:joi.string().valid("sold", "won", "lost", "all").required(),
    })
    return historySchema.validate(data)
}

// Validate post data on adding new auction request
const postAuctionValidation = data => {

    //Create a mandatory item object
    const itemSchema= {
        title: joi.string().min(10).required(),
        condition: joi.string().valid('Used', 'New').required(), // Per the specification we should have strict item conditions
        description: joi.string().min(10).required()
    }
    
    const auctionSchema = joi.object({

        //Currently we asume that 365 days should be the maximum (configurable in .env)
        starting_price: joi.number().min(0).max(parseInt(process.env.MAX_BID)).required(),
        exp_time: joi.number().min(0).max(parseInt(process.env.MAX_AUCTION_TIME)).required(),
        exp_type: joi.string().valid("minutes", "hours", "days").required(),
        item: joi.object(itemSchema).required() //Add to the item object to the auction
    })  
    return auctionSchema.validate(data)
}


//Pagination validaiton
const pagiValidation = data => {

    const pagiSchema = joi.object({
        page: joi.number().integer().min(1),
        limit: joi.number().integer(),
        history_type: joi.string().optional()
    })
    return pagiSchema.validate(data)
}

// Validate post data on adding auction bid request
const bidItemValidation = data => {

    const bidSchema = joi.object({

        // MongoDB ID's are 24 alphanum characters
        item_id: joi.string().alphanum().required().min(24).max(24).required(),

        // We can not place bid bigger than max posible integer 
        bid: joi.number().integer().min(1).max(parseInt(process.env.MAX_BID)).required()

    })
    return bidSchema.validate(data)
}

module.exports.pagiValidation = pagiValidation
module.exports.historyValidation = historyValidation
module.exports.bidItemValidation = bidItemValidation
module.exports.postAuctionValidation = postAuctionValidation
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation