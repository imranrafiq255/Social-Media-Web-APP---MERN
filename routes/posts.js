const express = require("express");
const {
  createPost,
  likeAndUnlikePosts,
  deletePost,
  sendComment,
  deleteComment,
} = require("../controllers/posts");
const { isAuthenticated } = require("../middlewares/auth");
const image = require("../config/uploads");
const Router = express.Router();

Router.route("/post/create-post").post(
  isAuthenticated,
  image.single("image"),
  createPost
);

Router.route("/post/like-dislike/:id").get(isAuthenticated, likeAndUnlikePosts);

Router.route("/post/delete-post/:id").delete(isAuthenticated, deletePost);

Router.route("/post/send-comment/:id").post(isAuthenticated, sendComment);

Router.route("/post/delete-comment/:postId/:commentId").delete(
  isAuthenticated,
  deleteComment
);

module.exports = Router;
