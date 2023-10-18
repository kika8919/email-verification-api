"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        [
          "http://localhost:4200",
          "https://email-verification-webapp.vercel.app",
        ].indexOf(origin) !== -1 ||
        !origin
      ) {
        callback(null, true);
      } else {
        console.log("cors err");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// user routes - for /api/users and /api/user
app.use("/api", require("./routes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
