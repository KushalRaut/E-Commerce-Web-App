const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const errorMiddleware = require("./middlewares/errors");
const cookieParser= require("cookie-parser");

app.use(express.json());
app.use(cookieParser())
//Import all routes
const products = require("./routes/product");
const auth = require("./routes/auth");
const order = require("./routes/order");

// app.use(bodyParser())
app.use("/api/v1", products);
app.use("/api/user", auth);
app.use("/api/v1", order);




module.exports = app;
