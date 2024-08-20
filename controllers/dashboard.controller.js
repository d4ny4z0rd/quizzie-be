const User = require("../models/user.model");
const Quiz = require("../models/quiz.model");
const Question = require("../models/question.model");

const getDashboardMetrics = async (req, res) => {
	try {
		const userId = req.user._id; 

		const questionCount = await Question.countDocuments({ createdBy: userId });

		const quizCount = await Quiz.countDocuments({ createdBy: userId });

		const quizzes = await Quiz.find({ createdBy: userId });
		const impressions = quizzes.reduce(
			(total, quiz) => total + quiz.impressions,
			0
		);

		return res.status(200).json({
			message: "Dashboard metrics retrieved successfully",
			data: {
				questionsCreated: questionCount,
				quizzesCreated: quizCount,
				impressions: impressions,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving dashboard metrics",
			error: error.message,
		});
	}
};

module.exports = {
	getDashboardMetrics,
};
