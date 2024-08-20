const express = require("express");
const router = express.Router();
const {
	createQuiz,
	updateQuiz,
	getQuizById,
	deleteQuiz,
	shareQuiz,
	getAllQuizzes,
} = require("../controllers/quiz.controller");

const verifyJWT = require("../middleware/auth.middleware");

router.post("/create", verifyJWT, createQuiz);

router.get("/getquizzes", verifyJWT, getAllQuizzes);

router.get("/playquiz/:quizId", getQuizById);

router.delete("/:quizId", verifyJWT, deleteQuiz);

router.put("/updatequiz/:quizId", verifyJWT, updateQuiz);

router.get("/:quizId/share", verifyJWT, shareQuiz);

module.exports = router;
