const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const userRouter = require("./routes/user.route");
const quizRouter = require("./routes/quiz.route");
const questionRouter = require("./routes/question.route");
const analyticRouter = require("./routes/analytic.route");
const dashboardRouter = require("./routes/dashboard.route");

const corsOptions = {
	origin: "https://quizzie-fe.vercel.app",
	credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/analytics", analyticRouter);
app.use("/api/v1/dashboard", dashboardRouter);

module.exports = app;
