const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
    {
        resumeName: {
            type: String,
            required: true
        },

        jobDescription: {
            type: String,
            required: true
        },

        score: {
            type: Number,
            required: true
        },

        matchingSkills: {
            type: [String],
            default: []
        },

        missingSkills: {
            type: [String],
            default: []
        },

        resumeSkills: {
            type: [String],
            default: []
        },

        jobSkills: {
            type: [String],
            default: []
        },

        suggestions: {
            type: [String],
            default: []
        },

        resumeText: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ResumeAnalysis",
    resumeAnalysisSchema
);