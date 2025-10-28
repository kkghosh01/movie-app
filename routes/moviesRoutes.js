const express = require("express");
const {
  getAllMovies,
  addMovie,
  getMovie,
  updateMovie,
  deleteMovie,
  checkMovieId,
  validateBody,
} = require("../handler/moviesHandler.js");

const router = express.Router();

router.param("id", checkMovieId);

router.route("/").get(getAllMovies).post(validateBody, addMovie);
router.route("/:id").get(getMovie).patch(updateMovie).delete(deleteMovie);

module.exports = router;
