const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
const user = require("../server/routes/users");
const post = require("../server/routes/posts");
// User Api
app.use("/api/v1", user);

// Post Api
app.use("/api/v1", post);
module.exports = app;
