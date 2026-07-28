const express = require("express");

const { Login, Signup, getMe, logout } = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/", userVerification);
router.get("/verify", userVerification);
router.get("/me", getMe);
router.post("/logout", logout);

module.exports = router;