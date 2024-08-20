const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyJWT = async (req, res, next) => {
	try {
		const token =
			req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

		console.log(token);

		if (!token)
			return res.status(403).json({
				message: "Unauthorized request",
			});

		const decodedToken = await jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET
		);

		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken"
		);

		if (!user) {
			return res.status(401).json({
				message: "Invalid access token",
			});
		}

		req.user = user;
		next();
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			message: "Error verifying the user",
			error: error.message,
			error,
		});
	}
};

module.exports = verifyJWT;
