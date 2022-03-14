require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require("swagger-jsdoc");
const {swagger_options} = require("./swagger.js");

mongoose.connect(process.env.DB, (error, connect) => {
  if (error) {
    return console.log(error);
  }
  console.log("Connected to Database");
});

const apidoc = swaggerDoc(swagger_options);

app.use(require("body-parser").json());
app.use("/api/auction", require("./routes/auction"));
app.use("/api/user", require("./routes/user"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(apidoc));

/**
 * Redirect all url queries to API docs page. The endpoints are not not affected.
 */
app.all('*', function(req, res) {
  res.redirect("/api/docs");
});


app.listen(
  process.env.SERVER_PORT,
  console.log("Auction server is running...")
);
