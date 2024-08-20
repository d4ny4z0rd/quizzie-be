require("dotenv").config();
const dbFunction = require("./db/index");
const app = require("./app");
const port = process.env.PORT || 3000;

dbFunction()
	.then(() => {
		app.listen(port, () => {
			console.log(`App listening on port ${port}`);
		});
	})
	.catch((error) => {
		console.log("Error connecting to the database ", error);
	});
