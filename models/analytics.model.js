const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
	quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
	questionIndex: { type: Number, required: true },
	optionSelected: { type: Number, required: false }, 
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
	isCorrect: { type: Boolean, required: true },
	isAnonymous: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
