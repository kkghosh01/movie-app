const Movie = require("./../Models/movieModel.js");
const uploadToCloudinary = require("./../Utils/cloudinary.js");
const AppError = require("../Utils/appError.js");

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
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const queryObj = JSON.parse(queryStr);

    ["sort", "fields", "page", "limit"].forEach((key) => delete queryObj[key]);

    let query = Movie.find(queryObj);

    // SORTING LOGIC
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // LIMITING FIELDS
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    // PAGINATION
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const skip = (page - 1) * limit;
    const moviesCount = await Movie.countDocuments();
    if (skip >= moviesCount && moviesCount !== 0) {
      return next(
        new AppError("Requested page exceeds total number of documents", 400)
      );
    }

    query = query.skip(skip).limit(limit);

    const movies = await query;

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
