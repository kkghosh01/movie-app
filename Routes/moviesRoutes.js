const express = require("express");
const upload = require("./../Middlewares/upload.js");
const {
  checkIfExistsById,
  checkIfExistsBySlug,
} = require("./../Middlewares/checkIfExists.js");
const {
  getAllMovies,
  addMovie,
  getMovieById,
  updateMovie,
  deleteMovie,
  getMovieBySlug,
  getHighestRatedMovie,
  getMoviesStats,
  getMoviesByGenre,
} = require("../Controllers/moviesController.js");
const Movie = require("../Models/movieModel.js");

const router = express.Router();

router.route("/highest-rated").get(getHighestRatedMovie, getAllMovies);
router.route("/movies-stats").get(getMoviesStats);
router.route("/movies-by-genre/:genre").get(getMoviesByGenre);
router.route("/").get(getAllMovies).post(upload.single("coverImage"), addMovie);
router
  .route("/:id")
  .get(checkIfExistsById(Movie), getMovieById)
  .patch(checkIfExistsById(Movie), updateMovie)
  .delete(checkIfExistsById(Movie), deleteMovie);
router.route("/slug/:slug").get(checkIfExistsBySlug(Movie), getMovieBySlug);

module.exports = router;
