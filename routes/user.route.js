const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getCurrentUser,
} = require("../controllers/user.controller");
const upload = require("../middleware/multer.middleware");
const verifyJWT = require("../middleware/auth.middleware");

router.post("/register", registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);

module.exports = router;
