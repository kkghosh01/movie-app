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
  getUpcomingMovies,
} = require("../Controllers/moviesController.js");
const Movie = require("../Models/movieModel.js");
const { protect, restrictRole } = require("../Middlewares/authMiddleware.js");

const router = express.Router();

// Public Routes
router.get("/", getAllMovies);
router.route("/:id").get(checkIfExistsById(Movie), getMovieById);
router.route("/highest-rated").get(getHighestRatedMovie, getAllMovies);
router.route("/movies-by-genre/:genre").get(getMoviesByGenre);
router.route("/upcoming-movies").get(getUpcomingMovies);
router.route("/slug/:slug").get(checkIfExistsBySlug(Movie), getMovieBySlug);

// Protected Routes (all routes below require login)
router.use(protect);
router.route("/movies-stats").get(restrictRole("admin"), getMoviesStats);
router
  .route("/")
  .post(restrictRole("admin"), upload.single("coverImage"), addMovie);
router
  .route("/:id")
  .patch(restrictRole("admin"), checkIfExistsById(Movie), updateMovie)
  .delete(restrictRole("admin"), checkIfExistsById(Movie), deleteMovie);

module.exports = router;
