const express = require("express");
const router = express.Router();
const {
	createAnalytics,
	getQuizAnalytics,
} = require("../controllers/analytic.controller");

router.post("/create", createAnalytics);

router.get("/get/:quizId", getQuizAnalytics);

module.exports = router;
