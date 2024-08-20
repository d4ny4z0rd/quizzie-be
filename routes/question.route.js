const express = require("express");
const router = express.Router();
const {
	createQuestion,
	updateQuestion,
	deleteQuestion,
} = require("../controllers/question.controller");
const verifyJWT = require("../middleware/auth.middleware");

router.post("/", verifyJWT, createQuestion);
router.put("/:questionId", verifyJWT, updateQuestion);
router.delete("/:questionId", verifyJWT, deleteQuestion);

module.exports = router;
