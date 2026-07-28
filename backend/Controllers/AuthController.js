const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcrypt");

const getUserFromToken = async (req) => {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  const jwt = require("jsonwebtoken");

  try {
    const data = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(data.id);
    return user || null;
  } catch (error) {
    return null;
  }
};

module.exports.Signup = async (req, res, next) => {

  // checkinf redirect
  console.log("Signup API called");
  console.log(req.body);
  
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    //for redirect
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // for localhost
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.getMe = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ status: false });
    }

    return res.status(200).json({
      status: true,
      fullName: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return res.status(500).json({ status: false });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Failed to logout:", error);
    return res.status(500).json({ success: false, message: "Failed to logout" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: 'All fields are required' })
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Incorrect password or email' })
    }
    const auth = await bcrypt.compare(password, user.password)
    if (!auth) {
      return res.json({ message: 'Incorrect password or email' })
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(201).json({ message: "User logged in successfully", success: true });
    next()
  } catch (error) {
    console.error(error);
  }
}