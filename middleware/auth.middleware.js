const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyJWT = async (req, res, next) => {
	try {
		// Log cookies and Authorization header
		console.log("Cookies:", req.cookies);
		console.log("Authorization header:", req.header("Authorization"));

		// Extract token from cookies or Authorization header
		const token =
			req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

		// Check if the token is missing
		if (!token) {
			console.log("Token missing!");
			return res.status(403).json({
				message: "Unauthorized request",
			});
		}

		// Verify the token
		const decodedToken = await jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET
		);

		// Find the user associated with the token
		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken"
		);

		// Check if the user exists
		if (!user) {
			return res.status(401).json({
				message: "Invalid access token",
			});
		}

		// Attach the user to the request object
		req.user = user;
		next();
	} catch (error) {
		console.log("Error verifying the token:", error.message);
		return res.status(400).json({
			message: "Error verifying the user",
			error: error.message,
		});
	}
};

module.exports = verifyJWT;
