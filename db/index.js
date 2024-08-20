const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

async function connectDB() {
	try {
		const connection = await mongoose.connect(url);
		console.log("Connected to MongoDB ");
	} catch (error) {
		console.log("Error connecting to Mongodb ", error);
		process.exit(1);
	}
}

module.exports = connectDB;
