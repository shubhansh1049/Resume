const fs = require("fs");
const pdfParse = require("pdf-parse");

const ResumeAnalysis = require("../Model/ResumeAnalysis");


const analyzeResume = async (req, res) => {

    try {

        // Check resume
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required"
            });
        }


        // Check job description
        const jobDescription = req.body.jobDescription;

        if (!jobDescription) {

            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });

        }


        // Read PDF
        const pdfBuffer = fs.readFileSync(req.file.path);


        // Extract PDF text
        const pdfData = await pdfParse(pdfBuffer);

        const resumeText = pdfData.text;


        // Convert to lowercase
        const resumeLower = resumeText.toLowerCase();

        const jobLower = jobDescription.toLowerCase();


        // Skills list
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


        // Find resume skills
        const foundSkills = [];


        skills.forEach((skill) => {

            if (resumeLower.includes(skill.toLowerCase())) {

                if (!foundSkills.includes(skill)) {

                    foundSkills.push(skill);

                }

            }

        });


        // Find job skills
        const jobSkills = [];


        skills.forEach((skill) => {

            if (jobLower.includes(skill.toLowerCase())) {

                if (!jobSkills.includes(skill)) {

                    jobSkills.push(skill);

                }

            }

        });


        // Matching skills
        const matchingSkills = jobSkills.filter(
            (skill) => foundSkills.includes(skill)
        );


        // Missing skills
        const missingSkills = jobSkills.filter(
            (skill) => !foundSkills.includes(skill)
        );


        // Calculate score
        let score = 0;


        if (jobSkills.length > 0) {

            score = Math.round(
                (matchingSkills.length / jobSkills.length) * 100
            );

        } else {

            score = 50;

        }


        // Suggestions
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


        // Save result to MongoDB
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


        // Delete uploaded PDF
        fs.unlink(req.file.path, (error) => {

            if (error) {
                console.log(
                    "File deletion error:",
                    error.message
                );
            }

        });


        // Response
        res.status(200).json({

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

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Error analyzing resume",

            error: error.message

        });

    }

};


module.exports = {
    analyzeResume
};