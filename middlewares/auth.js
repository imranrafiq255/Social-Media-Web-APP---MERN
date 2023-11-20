const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { usersModel } = require("../models/Users");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.use(cookieParser(process.env.SECRET_KEY));

exports.isAuthenticated = async (req, res, next) => {
  try {
    // Extract the token from the cookie named "token"
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first!",
      });
    }

    // Verify the token using the SECRET_KEY
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Check if the decoded user ID exists in the database
    const user = await usersModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User doesn't exist in the database",
      });
    }
    req.user = user;
    // If everything is fine, continue to the next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
