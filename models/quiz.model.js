const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
	{
		text: { type: String },
		imageUrl: { type: String },
	},
	{ _id: false }
);

const quizSchema = new mongoose.Schema({
	title: { type: String, required: true },
	type: {
		type: String,
		enum: ["Q&A", "Poll"],
		required: true,
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	questions: [
		{
			question: { type: String, required: true },
			options: [optionSchema], 
			timer: { type: Number, default: 0 },
			correctOption: { type: Number, required: true },
		},
	],
	impressions: { type: Number, default: 0 },
	isTrending: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", quizSchema);
