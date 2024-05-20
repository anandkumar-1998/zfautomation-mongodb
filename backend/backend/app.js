const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middleware/error");
const helmet = require("helmet");

app.use(express.json());
app.use(cors({
  origin: '*'
}));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

//route imports
const systemRoute = require("./routes/systemRoute");
const userRoute = require("./routes/userRoute");
const ticketRoute = require("./routes/ticketRoute");
app.use("/api/v1", userRoute);;
app.use("/api/v1", systemRoute);
app.use("/api/v1", ticketRoute);

// Middleware for Errors
app.use(errorMiddleware);
module.exports = app;
