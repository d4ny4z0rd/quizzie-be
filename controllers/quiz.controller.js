const Quiz = require("../models/quiz.model");
const Question = require("../models/question.model");
const Analytics = require("../models/analytics.model");

const createQuiz = async (req, res) => {
	try {
		const { title, type, questions } = req.body;
		console.log(req.body);

		if (questions.length > 5) {
			return res
				.status(400)
				.json({ message: "A quiz can have a maximum of 5 questions." });
		}

		for (const question of questions) {
			if (question.options.length < 2) {
				return res
					.status(400)
					.json({ message: "Each question must have at least 2 options." });
			}
			if (question.correctOption >= question.options.length) {
				return res
					.status(400)
					.json({ message: "Correct option index is out of bounds." });
			}
		}

		const newQuiz = await Quiz.create({
			title,
			type,
			creator: req.user._id,
			questions,
		});

		return res.status(201).json({
			message: "Quiz created successfully",
			quiz: newQuiz,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Error creating quiz",
			error: error.message,
		});
	}
};

const updateQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;
		const { questions } = req.body;

		console.log("Request body:", req.body);

		const quiz = await Quiz.findById(quizId);

		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		if (req.body.title || req.body.type) {
			return res
				.status(400)
				.json({ message: "Quiz title and type cannot be edited" });
		}

		const questionMap = new Map();
		questions.forEach((question) => {
			if (question._id) {
				const id = question._id.toString();
				questionMap.set(id, question);
			}
		});

		console.log("Existing quiz questions:", quiz.questions);

		quiz.questions.forEach((existingQuestion) => {
			const existingQuestionId = existingQuestion._id
				? existingQuestion._id.toString()
				: null;
			if (!existingQuestionId) {
				console.error("Found a question without _id:", existingQuestion);
				return;
			}

			const updatedQuestion = questionMap.get(existingQuestionId);

			if (updatedQuestion) {
				existingQuestion.question =
					updatedQuestion.question || existingQuestion.question;
				existingQuestion.timer =
					updatedQuestion.timer || existingQuestion.timer;
				existingQuestion.correctOption =
					updatedQuestion.correctOption || existingQuestion.correctOption;

				const optionMap = new Map();
				updatedQuestion.options.forEach((option) => {
					if (option._id) {
						const id = option._id.toString();
						optionMap.set(id, option);
					}
				});

				existingQuestion.options.forEach((existingOption) => {
					const existingOptionId = existingOption._id
						? existingOption._id.toString()
						: null;
					if (!existingOptionId) {
						console.error("Found an option without _id:", existingOption);
						return;
					}

					console.log("Existing option ID:", existingOptionId);
					const updatedOption = optionMap.get(existingOptionId);
					if (updatedOption) {
						existingOption.text = updatedOption.text || existingOption.text;
						existingOption.imageUrl =
							updatedOption.imageUrl || existingOption.imageUrl;
						optionMap.delete(existingOptionId);
					}
				});

				optionMap.forEach((option) => existingQuestion.options.push(option));
			} else {
				quiz.questions.id(existingQuestion._id).remove();
			}
		});

		questions.forEach((question) => {
			if (question._id) {
				const questionId = question._id.toString();
				if (!quiz.questions.id(questionId)) {
					quiz.questions.push(question);
				}
			}
		});

		await quiz.save();

		return res.status(200).json({
			message: "Quiz updated successfully",
			quiz,
		});
	} catch (error) {
		console.error("Error updating quiz:", error);
		res.status(500).json({
			message: "Error updating quiz",
			error: error.message,
		});
	}
};

const getQuizById = async (req, res) => {
	try {
		const { quizId } = req.params;
		const quiz = await Quiz.findById(quizId).populate("questions");

		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		quiz.impressions += 1;
		await quiz.save();

		return res.status(200).json({
			message: "Quiz fetched successfully",
			quiz,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error fetching quiz",
			error: error.message,
		});
	}
};

const deleteQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;
		console.log(quizId);

		const result = await Quiz.deleteOne({ _id: quizId });

		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		console.log("Quiz deleted successfully");

		return res.status(200).json({
			message: "Quiz deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting quiz:", error);
		res.status(500).json({
			message: "Error deleting quiz",
			error: error.message,
		});
	}
};

const shareQuiz = async (req, res) => {
	try {
		const { quizId } = req.params;
		const quiz = await Quiz.findById(quizId);

		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		const shareLink = `${req.protocol}://${req.get("host")}/quizzes/${quizId}`;

		return res.status(200).json({
			message: "Quiz shared successfully",
			shareLink,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error sharing quiz",
			error: error.message,
		});
	}
};

const getAllQuizzes = async (req, res) => {
	try {
		const quizzes = await Quiz.find({ creator: req.user._id });
		const numberOfQuestions = quizzes.reduce(
			(total, quiz) => total + quiz.questions.length,
			0
		);
		const numberOfImpressions = quizzes.reduce(
			(total, quiz) => total + quiz.impressions,
			0
		);

		return res.status(200).json({
			quizzes,
			numberOfQuizzes: quizzes.length,
			numberOfQuestions,
			numberOfImpressions,
		});
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		return res
			.status(500)
			.json({ message: "Error fetching quizzes", error: error.message });
	}
};

module.exports = {
	createQuiz,
	updateQuiz,
	getQuizById,
	deleteQuiz,
	shareQuiz,
	getAllQuizzes,
};
