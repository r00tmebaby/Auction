const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validators");
const router = express.Router();
const User = require("../models/User");
const { auth } = require('../modules')


/************************************| POST |************************************************************
 * 
 * Register user / requires email and password
 * 
 * */
router.post("/login", async (req, res) => {
    const { error } = loginValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error["details"][0]["message"] });
    }

    // Validation 2 to check if user exists!
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }

    // Validation 3 to check user password
    const passwordValidation = await bcryptjs.compare(
      req.body.password,
      user.password
    );

    if (!passwordValidation) {
      return res.status(400).send({ message: "Password is wrong" });
    }

    // Generate an auth-token
    const token = jsonwebtoken.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send({ "auth-token": token });
  }
);


/************************************| POST |************************************************************
 * 
 * Register user / requires name, surname, email and password
 * 
 * */
router.post("/register", async (req, res) => {
  // Validation 1 to check user input
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error["details"][0]["message"] });
  }

  // Validation 2 to check if user exists!
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists) {
    return res.status(400).send({ message: "User already exists" });
  }

  const salt = await bcryptjs.genSalt(5);
  const hashedPassword = await bcryptjs.hash(req.body.password, salt);

  const new_user = new User({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    new_user.save();
    return res
      .status(200)
      .send({ message: `User ${new_user.email} has been added` });
  } catch (err) {
    return res.status(400).send({ message: err });
  }
});


module.exports = router;
