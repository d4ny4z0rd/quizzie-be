const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;
		const response = await cloudinary.v2.uploader.upload(localFilePath, {
			resource_type: "auto",
		});
		console.log("Cloudinary response ", response);
		console.log("File uploaded on cloudinary ", response.url);
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		console.log("Failed to upload the file on cloudinary ", error);
		return null;
	}
};

module.exports = uploadOnCloudinary;
