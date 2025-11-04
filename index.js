const express = require("express");
const qs = require("qs");
const moviesRouter = require("./Routes/moviesRoutes.js");
const globalErrorHandler = require("./Middlewares/globalErrorHandler.js");
const AppError = require("./Utils/appError.js");

const app = express();

app.set("query parser", (str) => qs.parse(str));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
