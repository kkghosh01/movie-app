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

    // Count total documents matching filter (without pagination)
    const totalDocs = await Movie.countDocuments(features.query.getFilter());

    // Page limit validation
    if (features.skip >= totalDocs && totalDocs !== 0) {
      return next(
        new AppError("Requested page exceeds total number of documents", 400)
      );
    }

    const movies = await features.query.exec();

    if (!movies.length) {
      return next(new AppError("No movies found for the given filters", 404));
    }

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
    // getting coverImage file buffer
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

const getMoviesStats = async (req, res, next) => {
  try {
    const stats = await Movie.aggregate([
      { $match: { ratings: { $gte: 8 } } },
      {
        $group: {
          _id: "$releaseYear",
          avgRating: { $avg: "$ratings" },
          avgPrice: { $avg: "$price" },
          maxRating: { $max: "$ratings" },
          minRating: { $min: "$ratings" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          totalPrice: { $sum: "$price" },
          movieCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          releaseYear: "$_id",
          avgRating: 1,
          avgPrice: 1,
          maxRating: 1,
          minRating: 1,
          maxPrice: 1,
          minPrice: 1,
          totalPrice: 1,
          movieCount: 1,
        },
      },
    ]);

    if (!stats.length) {
      return next(
        new AppError("No movie statistics found for the given filter", 404)
      );
    }

    res.status(200).json({
      status: "success",
      count: stats.length,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

const getMoviesByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;

    // Common aggregation pipeline
    const pipeline = [
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          movieCount: { $sum: 1 },
          movies: { $push: "$title" },
          avgRating: { $avg: "$ratings" },
          avgPrice: { $avg: "$price" },
        },
      },
      { $addFields: { genre: "$_id" } },
      { $project: { _id: 0 } },
      { $sort: { movieCount: -1 } },
    ];

    // If specific genre provided, filter it
    if (genre) {
      pipeline.push({ $match: { genre: genre } });
    }

    const result = await Movie.aggregate(pipeline);

    if (!result.length) {
      return next(
        new AppError(
          genre
            ? `No movies found for genre: ${genre}`
            : "No genre summary found",
          404
        )
      );
    }

    res.status(200).json({
      status: "success",
      count: result.length,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
};
const getUpcomingMovies = async (req, res, next) => {
  try {
    const upcomingMovies = await Movie.find({
      releaseDate: { $gt: Date.now() },
    });

    res.status(200).json({
      status: "success",
      results: upcomingMovies.length,
      data: { upcomingMovies },
    });
  } catch (error) {
    next(error);
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
  getMoviesStats,
  getMoviesByGenre,
  getUpcomingMovies,
};
