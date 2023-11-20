const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: String,
  image: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

exports.postsModel = mongoose.model("posts", postSchema);
