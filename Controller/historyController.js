const ResumeAnalysis = require("../Model/ResumeAnalysis");


// Get all resume analysis history
const getHistory = async (req, res) => {

    try {

        const history = await ResumeAnalysis
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            count: history.length,

            history: history

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Error fetching resume history",

            error: error.message

        });

    }

};


// Get single analysis by ID
const getHistoryById = async (req, res) => {

    try {

        const analysis = await ResumeAnalysis.findById(
            req.params.id
        );

        if (!analysis) {

            return res.status(404).json({

                success: false,

                message: "Resume analysis not found"

            });

        }

        res.status(200).json({

            success: true,

            result: analysis

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Error fetching resume analysis",

            error: error.message

        });

    }

};


module.exports = {
    getHistory,
    getHistoryById
};