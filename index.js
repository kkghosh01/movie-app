const express = require("express");
const moviesRouter = require("./Routes/moviesRoutes.js");

const app = express();

app.use(express.json());

// mount movies router
app.use("/api/v1/movies", moviesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "fail",
    message: err.message,
  });
});

module.exports = app;
