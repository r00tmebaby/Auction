
//*==================| USER LOGIN |=================================*/
/** 
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login registered user  ✅
 *     description: Login user providing his/her email and password
 *     tags:
 *      [Authentication]
 *     requestBody:
 *      description: The username email address and password
 *      required: true
 *      content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       '200':
 *         description: A JSON object with an authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * */

//*==================| USER REGISTER |=================================*/
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user ✅
 *     description: Register a new user providing name, surname, email and password
 *     tags:
 *      [Authentication]
 *     requestBody:
 *      description: The new user name, surname, email and password
 *      required: true
 *      content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              surname:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       '200':
 *         description: A JSON object with a message
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * */

//*==================| USER DETAILS |=================================*/
/**
 * @openapi
 * /api/user/details:
 *   get:
 *     summary: Gets an information about the logged user ✅
 *     description: Get currently logged user details
 *     tags:
 *      [Users]
 *     responses:
 *       '200':
 *         description: A JSON object with the user details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * 
 * */

//*==================| USER AUCTION HISTORY |=================================*/
/**
 * @openapi
 * /api/user/history/{type}:
 *   get:
 *     summary: Gets information about the user auctions history ✅
 *     description: Gets information about the user auctions history
 *     tags:
 *      [Users]
 *     parameters:
 *      - in: path
 *        name: type
 *        schema:
 *          type: string
 *        required: true
 *        description: 'It accepts three values: [won, lost, sold]'   
 *     responses:
 *       '200':
 *         description: A JSON object with information about the user auctions history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * 
 * */


//*==================| GET ALL AUCTIONS |=================================*/
/**
 * @openapi
 * /api/auction/{type}:
 *   get:
 *     summary: Gets an information about all auctions ✅
 *     description: Gets an information about all auctions
 *     tags:
 *      [Auctions]
 *     parameters:
 *      - in: path
 *        name: type
 *        schema:
 *          type: string
 *        required: true
 *        description: 'It accepts three values: [all, noexpired, expired]'   
 *     responses:
 *       '200':
 *         description: A JSON object with the user details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * 
 * */

//*==================| AUCTION BID |=================================*/
/**
 * @openapi
 * /api/auction/bid:
 *   post:
 *     summary: Place a bid for specific item ✅
 *     description: Place a bid for a specific item
 *     tags:
 *      [Auctions]
 *     requestBody:
 *      description: Place a bid for a specific item, requires "item_id" and "bid" amount
 *      required: true
 *      content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              item_id:
 *                type: string
 *              bid:
 *                type: integer
 *     responses:
 *       '200':
 *         description: A JSON object with a message
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * 
 * */

//*==================| AUCTION ADD ITEM |=================================*/
/**
 * @openapi
 * /api/auction/add:
 *   post:
 *     summary: Add a new item for auction ✅
 *     description: Add a new item for auction
 *     tags:
 *      [Auctions]
 *     requestBody:
 *      description: Add a new item for auction  
 *      required: true
 *      content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              starting_price:
 *                type: integer
 *                default: 0
 *              exp_time:
 *                type: integer
 *                default: 5
 *              exp_type:
 *                type: string
 *                default: seconds   
 *              item:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                    default: New item for sale
 *                  condition:
 *                    type: string
 *                    default: New
 *                  description: 
 *                    type: string
 *                    default: My new item is great
 *     responses:       
 *       '200':
 *         description: A JSON object with a message
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * 
 * */
/*============================| MODELS |===================================== */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: David
 *         surname:
 *           type: string
 *           description: The user's surname.
 *           example: Beckham
 *         email:
 *           type: string
 *           description: The user's email address.
 *           example: dbeckham@gmail.com
 *         password:
 *           type: string
 *           description: The user's password.
 *           example: mypassw0rd
 *         registered_on:
 *           type: integer
 *           description: When the user was registered
 *           example: 1644792737         
 *     Auction:
 *         type: object
 *         properties:
 *            starting_price:
 *              type: integer
 *              description: The starting price that user will select
 *              example: 1
 *            reg_date:
 *              type: integer
 *              description: The date when the item ws posted for sell
 *              example: 1644792737 
 *            exp_date:
 *              type: integer
 *              description: The expiration time that user set when the item was posted
 *              example: 1644792737
 *            bids:
 *              type: json
 *              description: Contains all bids that have been made for this item
 *              example: '[
 *                          {
 *                              "bid": 5
 *                              "user": "6207f68b55e9ac2c725f9597"
 *                          },
 *                          {
 *                              "bid": 7
 *                              "user": "1707f68b55e9ac2c725f9524"
 *                          } 
 *                      ]'
 *            seller_id:
 *              type: string
 *              description: Contains the user id whoever is selling the item 
 *              example: 1 
 *     Item:
 *         type: object
 *         properties:
 *            title:
 *              type: string
 *              description: The item title
 *              example: Emporio Armani Gents Classic Watch
 *            condition:
 *              type: string
 *              description: The item conditon options [New, Used]
 *              example: Used
 *            description:
 *              type: string
 *              description: The item title
 *              example: '
 *                         Model no:     AR2448
 *                         Movement:     High Quality Battery Powered Quartz Movement
 *                         Display:     Analogue
 *                         Measurements:     20mm (Width) 41mm (Length) 10mm (Thickness)
 *                         Functions:      Second, Minute, Hour, Date and Chronograph
 *                         Dial:     Navy Blue Dial with Giorgio Armani Logo
 *                         Band:     Stainless Steel Bracelet
 *                         Metal:      High Quality Stainless Steel
 *                         Glass:     Scratch Resistant Mineral Glass
 *                         Clasp:     Deployment Clasp
 *                         Water Resistant:      Water Resistant up to 50 Metres
 *                         Condition:     Brand New in Armani Presentation Box with Complete Instructions
 *                         2 Year DPW Warranty'
 *            other_info:
 *              type: json
 *              description: Any other relevant information [Optional]
 *              example: Item has not been used, almost new 🤣
 * 
 */