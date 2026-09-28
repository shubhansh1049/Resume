const fs = require("fs");
const pdfParse = require("pdf-parse");

const ResumeAnalysis = require("../Model/ResumeAnalysis");

const analyzeResume = async (req, res) => {
    try {

        console.log("===== RESUME ANALYSIS STARTED =====");

        // Check PDF
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required"
            });
        }

        console.log("File received:", req.file.originalname);
        console.log("File path:", req.file.path);

        // Check job description
        const jobDescription = req.body.jobDescription;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });
        }

        console.log("Job description received");

        // Read PDF
        const pdfBuffer = fs.readFileSync(req.file.path);

        console.log("PDF size:", pdfBuffer.length);

        // ==========================================
        // PDF PARSING FOR pdf-parse 2.x
        // ==========================================

        const parser = new pdfParse.PDFParse({
            data: pdfBuffer
        });

        const pdfData = await parser.getText();

        await parser.destroy();

        const resumeText = pdfData.text || "";

        console.log(
            "Extracted resume text length:",
            resumeText.length
        );

        if (!resumeText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from PDF"
            });
        }

        // ==========================================
        // LOWERCASE TEXT
        // ==========================================

        const resumeLower = resumeText.toLowerCase();
        const jobLower = jobDescription.toLowerCase();

        // ==========================================
        // SKILLS
        // ==========================================

        const skills = [
            "javascript",
            "java",
            "python",
            "react",
            "react.js",
            "node.js",
            "express",
            "mongodb",
            "mysql",
            "sql",
            "html",
            "css",
            "git",
            "github",
            "docker",
            "aws",
            "android",
            "android studio",
            "kotlin",
            "spring boot",
            "rest api",
            "api",
            "playwright",
            "selenium",
            "testing",
            "manual testing"
        ];

        // ==========================================
        // FIND RESUME SKILLS
        // ==========================================

        const foundSkills = [];

        skills.forEach((skill) => {

            if (resumeLower.includes(skill.toLowerCase())) {

                if (!foundSkills.includes(skill)) {
                    foundSkills.push(skill);
                }

            }

        });

        console.log("Resume skills:", foundSkills);

        // ==========================================
        // FIND JOB SKILLS
        // ==========================================

        const jobSkills = [];

        skills.forEach((skill) => {

            if (jobLower.includes(skill.toLowerCase())) {

                if (!jobSkills.includes(skill)) {
                    jobSkills.push(skill);
                }

            }

        });

        console.log("Job skills:", jobSkills);

        // ==========================================
        // MATCHING SKILLS
        // ==========================================

        const matchingSkills = jobSkills.filter(
            (skill) => foundSkills.includes(skill)
        );

        // ==========================================
        // MISSING SKILLS
        // ==========================================

        const missingSkills = jobSkills.filter(
            (skill) => !foundSkills.includes(skill)
        );

        // ==========================================
        // SCORE
        // ==========================================

        let score = 0;

        if (jobSkills.length > 0) {

            score = Math.round(
                (matchingSkills.length / jobSkills.length) * 100
            );

        } else {

            score = 50;

        }

        console.log("Matching skills:", matchingSkills);
        console.log("Missing skills:", missingSkills);
        console.log("Score:", score);

        // ==========================================
        // SUGGESTIONS
        // ==========================================

        const suggestions = [];

        if (missingSkills.length > 0) {

            suggestions.push(
                "Add relevant skills from the job description if you genuinely have those skills."
            );

        }

        if (resumeText.length < 1000) {

            suggestions.push(
                "Consider adding more relevant projects, experience and achievements."
            );

        }

        if (!resumeLower.includes("experience")) {

            suggestions.push(
                "Consider adding an Experience section if you have relevant experience."
            );

        }

        if (!resumeLower.includes("project")) {

            suggestions.push(
                "Consider adding relevant projects."
            );

        }

        if (!resumeLower.includes("education")) {

            suggestions.push(
                "Consider adding an Education section."
            );

        }

        if (suggestions.length === 0) {

            suggestions.push(
                "Your resume contains the main keywords detected from the job description."
            );

        }

        // ==========================================
        // SAVE TO MONGODB
        // ==========================================

        const analysis = await ResumeAnalysis.create({

            resumeName: req.file.originalname,

            jobDescription: jobDescription,

            score: score,

            matchingSkills: matchingSkills,

            missingSkills: missingSkills,

            resumeSkills: foundSkills,

            jobSkills: jobSkills,

            suggestions: suggestions,

            resumeText: resumeText

        });

        console.log(
            "Analysis saved:",
            analysis._id
        );

        // ==========================================
        // DELETE TEMP PDF
        // ==========================================

        fs.unlink(req.file.path, (error) => {

            if (error) {

                console.log(
                    "File deletion error:",
                    error.message
                );

            } else {

                console.log("Temporary PDF deleted");

            }

        });

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Resume analyzed and saved successfully",

            result: {

                id: analysis._id,

                resumeName: analysis.resumeName,

                score: analysis.score,

                matchingSkills: analysis.matchingSkills,

                missingSkills: analysis.missingSkills,

                resumeSkills: analysis.resumeSkills,

                jobSkills: analysis.jobSkills,

                suggestions: analysis.suggestions

            }

        });

    } catch (error) {

        console.log("=================================");
        console.log("RESUME ANALYSIS ERROR");
        console.log("Error message:", error.message);
        console.log("Full error:", error);
        console.log("=================================");

        return res.status(500).json({

            success: false,

            message: "Error analyzing resume",

            error: error.message

        });

    }
};

module.exports = {
    analyzeResume
};