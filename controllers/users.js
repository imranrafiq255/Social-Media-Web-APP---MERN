const { usersModel } = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { postsModel } = require("../models/Posts");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await usersModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: `${email} is already registered!`,
      });
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new usersModel({
      name,
      email,
      password,
      avatar: { public_id: 12, url: req.file.filename },
    });

    // Generate a token for the new user
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY);

    // Add the token to the user's tokens array
    newUser.tokens.push({ token });

    // Save the user to the database
    await newUser.save();

    // Set cookie options
    const options = {
      httpOnly: true,
      maxAge: 100 * 24 * 60 * 60 * 1000, // 100 days
    };

    // Set the "token" cookie
    res.cookie("token", token, options);

    // Respond with a success message
    res.status(201).json({
      success: true,
      message: `${name} signed up successfully`,
      token, // Send the token in the response for client-side storage if needed
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersModel.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    // Generate a token for the authenticated user
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);

    // Add the token to the user's tokens array
    user.tokens.push({ token });

    // Save the user with the updated tokens array
    await user.save();

    // Set cookie options
    const options = {
      httpOnly: true,
      maxAge: 100 * 24 * 60 * 60 * 1000, // 100 days
    };

    // Set the "token" cookie
    res.cookie("token", token, options);

    // Respond with a success message
    res.status(200).json({
      success: true,
      user: await usersModel.findOne({ email }),
      message: "Logged in successfully",
      token, // Send the token in the response for client-side storage if needed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logOut = (req, res) => {
  res.clearCookie("token");
  res.status(401).json({
    success: true,
    message: "User is logged out",
  });
};

exports.followAndUnfollow = async (req, res) => {
  try {
    const userId = req.params.id;
    const signedInUserId = req.user._id;
    const user = await usersModel.findById(userId);
    if (req.user._id == req.params.id) {
      return res.status(500).json({
        success: false,
        message: "You can't follow yourself",
      });
    }
    const signedUser = await usersModel.findById(signedInUserId);
    if (signedUser.followings.includes(userId)) {
      const indexOfSignedUser = signedUser.followers.indexOf(userId);
      signedUser.followings.splice(indexOfSignedUser, 1);
      await signedUser.save();
      const indexOfUser = user.followers.indexOf(signedInUserId);
      user.followers.splice(indexOfUser, 1);
      await user.save();

      return res.status(200).json({
        success: true,
        message: `${user.name} unfollowed ${signedUser.name} successfully`,
      });
    }

    signedUser.followings.push(userId);
    await signedUser.save();
    user.followers.push(signedInUserId);
    await user.save();
    return res.status(200).json({
      success: true,
      message: `${signedUser.name} followed ${user.name} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changeProfileDP = async (req, res) => {
  try {
    const signedUser = await usersModel.findById(req.user._id);
    const url = req.file.filename;
    signedUser.avatar.url = url;
    await signedUser.save();
    return res.status(200).json({
      success: true,
      message: "Profile picture has been changed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword) {
      return res.status(500).json({
        success: false,
        message: "Please enter old password",
      });
    }
    if (!newPassword) {
      return res.status(500).json({
        success: true,
        message: "Please enter new password",
      });
    }
    if (!oldPassword && !newPassword) {
      return res.status(500).json({
        success: false,
        message: "Please enter old and new passwords",
      });
    }
    const signedUser = await usersModel
      .findById(req.user._id)
      .select("+password");
    const isMatch = await bcrypt.compare(oldPassword, signedUser.password);
    if (isMatch) {
      signedUser.password = newPassword;
      await signedUser.save();
      return res.status(200).json({
        success: true,
        message: "Congratulations! your password has been changed",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Your old password is incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const signedUser = await usersModel.findById(req.user._id);
    const posts = signedUser.userposts;
    for (let i = 0; i < posts.length; i++) {
      await postsModel.findByIdAndDelete(posts[i]);
    }
    const users = await usersModel.find();
    for (let j = 0; j < users.length; j++) {
      let followers = users[j].followers;
      let followings = users[j].followings;

      for (let k = 0; k < followers.length; k++) {
        if (req.user._id.toString() === followers[k]._id.toString()) {
          let currentFollowerIndex = followers.indexOf(req.user._id);
          users[j].followers.splice(currentFollowerIndex, 1);
          await users[j].save();
        }
      }
      for (let l = 0; l < followings.length; l++) {
        if (req.user._id.toString() === followings[l]._id.toString()) {
          let currentFollowingIndex = followings.indexOf(req.user._id);
          users[j].followings.splice(currentFollowingIndex, 1);
          await users[j].save();
        }
      }
    }
    const allposts = await postsModel.find();
    for (let i = 0; i < allposts.length; i++) {
      let likes = allposts[i].likes;
      for (let j = 0; j < likes.length; j++) {
        if (req.user._id.toString() === likes[j].toString()) {
          const likeIndex = likes.indexOf(req.user._id);
          allposts[i].likes.splice(likeIndex, 1);
          await allposts[i].save();
        }
      }
    }
    await usersModel.findByIdAndDelete(req.user._id);
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: `${signedUser.name} profile is deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await usersModel.findOne(req.user._id).populate("userposts");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await usersModel
      .findOne({ _id: req.params.id })
      .populate("userposts");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserFollowingPosts = async (req, res) => {
  try {
    const user = await usersModel.findOne({ _id: req.user._id }).populate({
      path: "followings",
      populate: {
        path: "userposts",
      },
    });
    if (user.followings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Your followings list is empty now, please follow someone",
      });
    }
    res.status(201).json({
      success: true,
      followingPosts: user.followings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
