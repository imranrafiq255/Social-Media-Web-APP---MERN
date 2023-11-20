const {
  createUser,
  signInUser,
  logOut,
  followAndUnfollow,
  changeProfileDP,
  changePassword,
  deleteProfile,
  getMyProfile,
  getUserProfile,
  getUserFollowingPosts,
} = require("../controllers/users");
const { isAuthenticated } = require("../middlewares/auth");
const express = require("express");

const Router = express.Router();

const image = require("../config/uploads");

Router.route("/user/create-user").post(image.single("image"), createUser);

Router.route("/user/signin-user").post(signInUser);

Router.route("/user/logout").post(isAuthenticated, logOut);

Router.route("/user/follow-unfollow/:id").post(
  isAuthenticated,
  followAndUnfollow
);

Router.route("/user/change-dp").put(
  image.single("image"),
  isAuthenticated,
  changeProfileDP
);
Router.route("/user/change-password").post(isAuthenticated, changePassword);

Router.route("/user/delete-profile").delete(isAuthenticated, deleteProfile);

Router.route("/user/get-myprofile").get(isAuthenticated, getMyProfile);

Router.route("/user/get-userprofile/:id").get(isAuthenticated, getUserProfile);

Router.route("/user/get-followings-posts").get(
  isAuthenticated,
  getUserFollowingPosts
);

module.exports = Router;
