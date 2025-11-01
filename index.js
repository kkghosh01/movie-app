const express = require("express");
const moviesRouter = require("./Routes/moviesRoutes.js");
const globalErrorHandler = require("./Middlewares/globalErrorHandler.js");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);

app.use(globalErrorHandler);

module.exports = app;
