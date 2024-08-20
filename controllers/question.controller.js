const Question = require("../models/question.model");
const Quiz = require("../models/quiz.model");

const createQuestion = async (req, res) => {
	try {
		const { quizId, text, options, answer, timer } = req.body;

		if (!quizId || !text || !options) {
			return res
				.status(400)
				.json({ message: "Quiz ID, text, and options are required" });
		}

		const quiz = await Quiz.findById(quizId);
		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		if (quiz.questions.length >= 5) {
			return res
				.status(400)
				.json({ message: "Cannot add more than 5 questions" });
		}

		const newQuestion = new Question({
			quiz: quizId,
			text,
			options,
			answer,
			timer: timer || 0,
		});

		await newQuestion.save();
		quiz.questions.push(newQuestion._id);
		await quiz.save();

		return res.status(201).json({
			message: "Question created successfully",
			question: newQuestion,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error creating question",
			error: error.message,
		});
	}
};

const updateQuestion = async (req, res) => {
	try {
		const { questionId } = req.params;
		const { text, options, answer, timer } = req.body;

		const question = await Question.findById(questionId);
		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}

		if (options) {
			if (options.length > 4) {
				return res
					.status(400)
					.json({ message: "Cannot have more than 4 options" });
			}
			question.options = options;
		}

		if (text) question.text = text;
		if (answer !== undefined) question.answer = answer;
		if (timer !== undefined) question.timer = timer;

		await question.save();

		return res.status(200).json({
			message: "Question updated successfully",
			question,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error updating question",
			error: error.message,
		});
	}
};

const deleteQuestion = async (req, res) => {
	try {
		const { questionId } = req.params;

		const question = await Question.findById(questionId);
		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}

		await Question.findByIdAndDelete(questionId);

		const quiz = await Quiz.findById(question.quiz);
		if (quiz) {
			quiz.questions.pull(questionId);
			await quiz.save();
		}

		return res.status(200).json({
			message: "Question deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Error deleting question",
			error: error.message,
		});
	}
};

module.exports = {
	createQuestion,
	updateQuestion,
	deleteQuestion,
};
