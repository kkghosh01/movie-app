const express = require("express");
const cookieParser = require("cookie-parser");
const qs = require("qs");
const moviesRouter = require("./Routes/moviesRoutes.js");
const authRouter = require("./Routes/authRouter.js");
const userRouter = require("./Routes/userRouter.js");
const adminRouter = require("./Routes/adminRouter.js");
const contactRouter = require("./Routes/contactRoutes.js");
const globalErrorHandler = require("./Middlewares/globalErrorHandler.js");
const AppError = require("./Utils/appError.js");

const app = express();

app.use(cookieParser());

app.set("query parser", (str) => qs.parse(str));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/contact", contactRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
