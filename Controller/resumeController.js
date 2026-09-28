const fs = require("fs");
const pdfParse = require("pdf-parse");

const ResumeAnalysis = require("../Model/ResumeAnalysis");

const analyzeResume = async (req, res) => {

    try {

        console.log("========== RESUME ANALYSIS START ==========");

        // ==============================
        // 1. CHECK FILE
        // ==============================

        console.log("File:", req.file);

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Resume PDF is required"
            });

        }


        // ==============================
        // 2. CHECK JOB DESCRIPTION
        // ==============================

        console.log("Body:", req.body);

        const jobDescription =
            req.body.jobDescription;

        if (
            !jobDescription ||
            jobDescription.trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });

        }


        // ==============================
        // 3. READ PDF
        // ==============================

        console.log(
            "Reading PDF:",
            req.file.path
        );

        const pdfBuffer =
            fs.readFileSync(req.file.path);

        console.log(
            "PDF size:",
            pdfBuffer.length
        );


        // ==============================
        // 4. EXTRACT PDF TEXT
        // ==============================

        console.log("Parsing PDF...");

        const pdfData =
            await pdfParse(pdfBuffer);

        console.log("PDF parsed successfully");

        const resumeText =
            pdfData.text || "";

        console.log(
            "Resume text length:",
            resumeText.length
        );


        if (resumeText.trim() === "") {

            return res.status(400).json({
                success: false,
                message:
                    "Could not extract text from PDF. Please upload a text-based PDF."
            });

        }


        // ==============================
        // 5. LOWERCASE TEXT
        // ==============================

        const resumeLower =
            resumeText.toLowerCase();

        const jobLower =
            jobDescription.toLowerCase();


        // ==============================
        // 6. SKILLS
        // ==============================

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


        // ==============================
        // 7. FIND RESUME SKILLS
        // ==============================

        const foundSkills = [];

        skills.forEach((skill) => {

            if (
                resumeLower.includes(
                    skill.toLowerCase()
                )
            ) {

                if (
                    !foundSkills.includes(skill)
                ) {

                    foundSkills.push(skill);

                }

            }

        });


        console.log(
            "Resume Skills:",
            foundSkills
        );


        // ==============================
        // 8. FIND JOB SKILLS
        // ==============================

        const jobSkills = [];

        skills.forEach((skill) => {

            if (
                jobLower.includes(
                    skill.toLowerCase()
                )
            ) {

                if (
                    !jobSkills.includes(skill)
                ) {

                    jobSkills.push(skill);

                }

            }

        });


        console.log(
            "Job Skills:",
            jobSkills
        );


        // ==============================
        // 9. MATCHING SKILLS
        // ==============================

        const matchingSkills =
            jobSkills.filter(
                (skill) =>
                    foundSkills.includes(skill)
            );


        // ==============================
        // 10. MISSING SKILLS
        // ==============================

        const missingSkills =
            jobSkills.filter(
                (skill) =>
                    !foundSkills.includes(skill)
            );


        console.log(
            "Matching Skills:",
            matchingSkills
        );

        console.log(
            "Missing Skills:",
            missingSkills
        );


        // ==============================
        // 11. CALCULATE SCORE
        // ==============================

        let score = 0;

        if (jobSkills.length > 0) {

            score = Math.round(
                (
                    matchingSkills.length /
                    jobSkills.length
                ) * 100
            );

        } else {

            score = 50;

        }


        console.log(
            "Score:",
            score
        );


        // ==============================
        // 12. SUGGESTIONS
        // ==============================

        const suggestions = [];


        if (
            missingSkills.length > 0
        ) {

            suggestions.push(
                "Add relevant skills from the job description if you genuinely have those skills."
            );

        }


        if (
            resumeText.length < 1000
        ) {

            suggestions.push(
                "Consider adding more relevant projects, experience and achievements."
            );

        }


        if (
            !resumeLower.includes(
                "experience"
            )
        ) {

            suggestions.push(
                "Consider adding an Experience section if you have relevant experience."
            );

        }


        if (
            !resumeLower.includes(
                "project"
            )
        ) {

            suggestions.push(
                "Consider adding relevant projects."
            );

        }


        if (
            !resumeLower.includes(
                "education"
            )
        ) {

            suggestions.push(
                "Consider adding an Education section."
            );

        }


        if (
            suggestions.length === 0
        ) {

            suggestions.push(
                "Your resume contains the main keywords detected from the job description."
            );

        }


        // ==============================
        // 13. SAVE TO MONGODB
        // ==============================

        console.log(
            "Saving result to MongoDB..."
        );

        const analysis =
            await ResumeAnalysis.create({

                resumeName:
                    req.file.originalname,

                jobDescription:
                    jobDescription,

                score:
                    score,

                matchingSkills:
                    matchingSkills,

                missingSkills:
                    missingSkills,

                resumeSkills:
                    foundSkills,

                jobSkills:
                    jobSkills,

                suggestions:
                    suggestions,

                resumeText:
                    resumeText

            });


        console.log(
            "Saved successfully:",
            analysis._id
        );


        // ==============================
        // 14. DELETE PDF
        // ==============================

        fs.unlink(
            req.file.path,
            (error) => {

                if (error) {

                    console.log(
                        "File deletion error:",
                        error.message
                    );

                } else {

                    console.log(
                        "PDF deleted"
                    );

                }

            }
        );


        // ==============================
        // 15. RESPONSE
        // ==============================

        return res.status(200).json({

            success: true,

            message:
                "Resume analyzed and saved successfully",

            result: {

                id:
                    analysis._id,

                resumeName:
                    analysis.resumeName,

                score:
                    analysis.score,

                matchingSkills:
                    analysis.matchingSkills,

                missingSkills:
                    analysis.missingSkills,

                resumeSkills:
                    analysis.resumeSkills,

                jobSkills:
                    analysis.jobSkills,

                suggestions:
                    analysis.suggestions

            }

        });


    } catch (error) {

        // ==============================
        // ERROR
        // ==============================

        console.log(
            "========== RESUME ANALYSIS ERROR =========="
        );

        console.log(
            "Error message:",
            error.message
        );

        console.log(
            "Full error:",
            error
        );

        console.log(
            "==========================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Error analyzing resume",

            error:
                error.message

        });

    }

};


module.exports = {
    analyzeResume
};