const Movie = require("./../Models/movieModel.js");
const uploadToCloudinary = require("./../Utils/cloudinary.js");
const AppError = require("../Utils/appError.js");
const APIFeatures = require("../Utils/apiFeatures.js");

const getHighestRatedMovie = (req, res, next) => {
  // middleware for "/highest-rated route"
  // creating req.query object & asigning props sort: "-ratings", limit: "5"
  Object.defineProperty(req, "query", {
    value: { ...req.query, sort: "-ratings", limit: "5" },
    writable: true,
  });
  next();
};

const getAllMovies = async (req, res, next) => {
  try {
    const features = new APIFeatures(Movie, req.query, true)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const movies = await features.query.exec();

    res.status(200).json({
      status: "success",
      result: movies.length,
      data: { movies },
    });
  } catch (error) {
    next(error);
  }
};

const getMovieById = (req, res) => {
  try {
    const movie = req.doc;
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getMovieBySlug = (req, res) => {
  try {
    const movie = req.doc;
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const addMovie = async (req, res) => {
  try {
    // coverImage file buffer পাওয়া
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "Cover image required" });
    }

    // Cloudinary upload
    const result = await uploadToCloudinary(req.file.buffer, "movies");

    // Movie document create
    const movie = await Movie.create({
      ...req.body,
      coverImage: result.secure_url,
    });

    res.status(201).json({
      status: "success",
      data: { movie },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.doc._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.errors
        ? Object.values(error.errors)
            .map((el) => el.message)
            .join(",")
        : error.message,
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.doc._id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.errors
        ? Object.values(error.errors)
            .map((el) => el.message)
            .join(",")
        : error.message,
    });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieBySlug,
  getHighestRatedMovie,
};
