const express = require("express");

const {
    getHistory,
    getHistoryById
} = require("../Controller/historyController");

const router = express.Router();


// Get all history
router.get("/", getHistory);


// Get single history
router.get("/:id", getHistoryById);


module.exports = router;