const express = require("express");
const multer = require("multer");

const { analyzeResume } = require("../Controller/resumeController");

const router = express.Router();


// Multer storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }

});


// File filter
const fileFilter = (req, file, cb) => {

    if (file.mimetype === "application/pdf") {

        cb(null, true);

    } else {

        cb(new Error("Only PDF files are allowed"), false);

    }

};


// Multer upload
const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }

});


// Analyze Resume
router.post(
    "/analyze",
    upload.single("resume"),
    analyzeResume
);


module.exports = router;