const User = require("../models/user.model");
const uploadOnCloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();
		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong while generating refresh and access token",
		});
	}
};

const registerUser = async (req, res) => {
	try {
		const { email, password, fullName } = req.body;
		console.log(req.body);

		if (
			[fullName, email, password].some((el) => el?.trim() === "") ||
			!fullName ||
			!email ||
			!password
		) {
			return res.status(400).json({
				message: "All fields are required",
			});
		}

		const userExists = await User.findOne({
			email,
		});

		if (userExists) {
			return res.status(409).json({
				message: "User already exists",
			});
		}

		const newUser = await User.create({
			fullName,
			email,
			password,
		});

		const createdUser = await User.findById(newUser._id).select(
			"-password -refreshToken"
		);

		return res.status(201).json({
			message: "User created successfully",
			createdUser,
		});
	} catch (error) {
		res.status(500).json({
			message: "An error occured while registering the user",
			error: error.message,
			error: error,
		});
		console.log(error);
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log(req.body);

		if (!email) {
			return res.status(400).json({
				message: "Email is required",
			});
		}

		const userExists = await User.findOne({
			email,
		});

		if (!userExists) {
			return res.status(404).json({
				message: "User does not exist",
			});
		}

		const isPasswordValid = await userExists.isPasswordCorrect(password);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: "Invalid user credentials",
			});
		}

		const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
			userExists._id
		);

		const toLogInUser = await User.findById(userExists._id).select(
			"-password -refeshToken"
		);

		const options = {
			httpOnly: true,
		};

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", refreshToken, options)
			.json({
				message: "User logged in successfully",
				user: toLogInUser,
				accessToken,
				refreshToken,
			});
	} catch (error) {
		res.status(400).json({
			message: "Error logging in",
			error: error.message,
			error,
		});
		console.log(error);
	}
};

const logoutUser = async (req, res) => {
	try {
		await User.findByIdAndUpdate(
			req.user._id,
			{
				$set: {
					refreshToken: undefined,
				},
			},
			{ new: true }
		);

		const options = {
			httpOnly: true,
		};

		return res
			.status(200)
			.clearCookie("accessToken", options)
			.clearCookie("refreshToken", options)
			.json({
				message: "User logged out successfully",
			});
	} catch (error) {
		res.status(400).json({
			message: "Error logging out",
			error: error.message,
			error,
		});
	}
};

const refreshAccessToken = async (req, res) => {
	try {
		const incomingRefreshToken =
			req.cookies.refreshToken || req.body.refreshToken;

		if (!incomingRefreshToken) {
			return res.status(401).json({
				message: "Unauthorized request",
			});
		}

		const decodedToken = await jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		const user = await User.findById(decodedToken?._id);
		if (!user) {
			return res.status(401).json({
				message: "Invalid refresh token",
			});
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			return res.status(401).json({
				message: "Refresh token is expired or used",
			});
		}

		const options = {
			httpOnly: true,
		};

		const { accessToken, newRefreshToken } =
			await generateAccessAndRefreshToken(user._id);

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", refreshToken, options)
			.json({
				message: "Access token refreshed",
				accessToken,
				newRefreshToken,
			});
	} catch (error) {
		return res.status(401).json({
			message: "Error occured while refreshing the token",
			error: error.message,
		});
	}
};

const getCurrentUser = async (req, res) => {
	return res.status(200).json({
		message: "Current user fetched successfully",
		currentUser: req.user,
	});
};

module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getCurrentUser,
};
