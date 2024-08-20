const mongoose = require("mongoose");
const Analytics = require("../models/analytics.model");
const Quiz = require("../models/quiz.model");

const createAnalytics = async (req, res) => {
	try {
		const { quizId, questionIndex, isCorrect, isAnonymous, optionSelected } =
			req.body;

		const quiz = await Quiz.findById(quizId);
		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		const analytics = new Analytics({
			quiz: quizId,
			questionIndex,
			isCorrect,
			isAnonymous,
			optionSelected: quiz.type === "poll" ? optionSelected : undefined, 
		});
		await analytics.save();

		return res.status(201).json({
			message: "Analytics record created successfully",
			analytics,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error creating analytics record",
			error: error.message,
		});
	}
};

const getQuizAnalytics = async (req, res) => {
	try {
		const { quizId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(quizId)) {
			return res.status(400).json({ message: "Invalid quiz ID" });
		}

		const quiz = await Quiz.findById(quizId).select("questions type");
		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		let analytics = [];
		const quizType = quiz.type.toLowerCase();

		if (quizType === "poll") {
			analytics = await Analytics.aggregate([
				{ $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
				{
					$group: {
						_id: {
							questionIndex: "$questionIndex",
							optionSelected: "$optionSelected",
						},
						count: { $sum: 1 },
					},
				},
				{
					$group: {
						_id: "$_id.questionIndex",
						options: {
							$push: {
								option: "$_id.optionSelected",
								count: "$count",
							},
						},
					},
				},
				{
					$project: {
						questionIndex: "$_id",
						options: 1,
						_id: 0,
					},
				},
			]);

			analytics = analytics.map((question) => {
				const totalOptions =
					quiz.questions[question.questionIndex].options.length;

				const options = Array.from({ length: totalOptions }, (_, i) => {
					const found = question.options.find((opt) => opt.option === i);
					return { option: i, count: found ? found.count : 0 };
				});

				return {
					...question,
					options,
				};
			});
		} else {
			analytics = await Analytics.aggregate([
				{ $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
				{
					$group: {
						_id: { questionIndex: "$questionIndex", isCorrect: "$isCorrect" },
						count: { $sum: 1 },
					},
				},
				{
					$group: {
						_id: "$_id.questionIndex",
						correct: {
							$sum: { $cond: [{ $eq: ["$_id.isCorrect", true] }, "$count", 0] },
						},
						incorrect: {
							$sum: {
								$cond: [{ $eq: ["$_id.isCorrect", false] }, "$count", 0],
							},
						},
					},
				},
				{
					$project: {
						questionIndex: "$_id",
						attempted: { $add: ["$correct", "$incorrect"] },
						correct: 1,
						incorrect: 1,
						_id: 0,
					},
				},
			]);
		}

		if (!analytics.length) {
			return res
				.status(404)
				.json({ message: "No analytics found for this quiz" });
		}

		const result = analytics.map((item) => ({
			...item,
			questionText:
				quiz.questions[item.questionIndex]?.question ||
				`Question ${item.questionIndex + 1}`,
		}));

		return res.status(200).json({
			message: "Analytics fetched successfully",
			analytics: result,
			isPoll: quizType === "poll",
		});
	} catch (error) {
		console.error("Error fetching analytics:", error.stack || error);
		res
			.status(500)
			.json({ message: "Error fetching analytics", error: error.message });
	}
};

module.exports = {
	createAnalytics,
	getQuizAnalytics,
};
