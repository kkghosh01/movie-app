const express = require("express");
const qs = require("qs");
const moviesRouter = require("./Routes/moviesRoutes.js");
const globalErrorHandler = require("./Middlewares/globalErrorHandler.js");

const app = express();

app.set("query parser", (str) => qs.parse(str));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);

app.use(globalErrorHandler);

module.exports = app;
