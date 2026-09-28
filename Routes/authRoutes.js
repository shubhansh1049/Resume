const express = require("express");

const {
    signup,
    signin
} = require("../Controller/authController");

const router = express.Router();


// Signup
router.post("/signup", signup);


// Signin
router.post("/signin", signin);


module.exports = router;