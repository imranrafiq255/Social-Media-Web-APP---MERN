const { postsModel } = require("../models/Posts");
const { usersModel } = require("../models/Users");
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const newPost = {
      caption,
      image: {
        public_id: "",
        url: req.file ? req.file.filename : "",
      },
      owner: req.user._id,
    };
    const createdPost = await postsModel.create(newPost);
    const user = await usersModel.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User did not find",
      });
    }
    await user.userposts.push(createdPost._id);
    await user.save();
    return res.status(201).json({
      success: true,
      newPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikePosts = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await postsModel.findById(postId);
    const user = await usersModel.findById(userId);

    if (!post) {
      return res.status(500).json({
        success: false,
        message: "User not found",
      });
    }
    if (post.likes.includes(userId)) {
      const likeIndex = post.likes.indexOf({ userId });
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(201).json({
        success: true,
        message: "Post Unliked",
      });
    }
    await post.likes.push(userId);
    await post.save();
    return res.status(201).json({
      success: true,
      message: "Post Liked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await postsModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "User unauthorized!",
      });
    }
    await postsModel.deleteOne({ _id: postId }); // Use an object to specify the post to delete
    const user = await usersModel.findById(req.user._id);
    const indexOfPostInUser = user.userposts.indexOf(postId);
    if (indexOfPostInUser !== -1) {
      user.userposts.splice(indexOfPostInUser, 1);
      await user.save();
    }
    return res.status(201).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sendComment = async (req, res) => {
  try {
    const comment = req.body.comment;
    const post = await postsModel.findById(req.params.id);
    // const user = await usersModel.findById(req.user._id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (comment) {
      post.comments.push({
        user: req.user._id,
        comment: comment,
      });
      post.save();
      return res.status(201).json({
        success: true,
        message: "Your comment sent ...",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "comment is empty",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await postsModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    for (let i = 0; i < post.comments.length; i++) {
      if (post.comments[i]._id.toString() === commentId.toString()) {
        const commentIndex = post.comments.indexOf(commentId);
        post.comments.splice(commentIndex, 1);
        await post.save();
        return res.status(201).json({
          success: true,
          message: "Comment has been deleted",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
