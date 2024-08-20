const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
	{
		text: { type: String },
		imageUrl: { type: String },
	},
	{ _id: false }
);

const questionSchema = new mongoose.Schema({
	quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
	questionText: { type: String, required: true },
	options: [optionSchema],
	correctOption: { type: Number },
	timer: {
		type: Number,
		enum: [0, 5, 10],
		default: 0,
	},
});

module.exports = mongoose.model("Question", questionSchema);
