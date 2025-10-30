const express = require("express");
const moviesRouter = require("./Routes/moviesRoutes.js");

const app = express();

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);

module.exports = app;
