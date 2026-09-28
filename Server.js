const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const resumeRoutes = require("./Routes/ResumeAnalysisRoutes");
const historyRoutes = require("./Routes/historyRoutes");
const authRoutes = require("./Routes/authRoutes");

dotenv.config();

const app = express();

app.use(express.json());


// Resume routes
app.use("/api/resume", resumeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/auth", authRoutes);



mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log(error);
    });


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});