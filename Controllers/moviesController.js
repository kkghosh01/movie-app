const Movie = require("./../Models/movieModel.js");
const uploadToCloudinary = require("./../Utils/cloudinary.js");
const AppError = require("../Utils/appError.js");

const getAllMovies = async (req, res, next) => {
  try {
    const allowedFilters = [
      "genres",
      "genre",
      "director",
      "casts",
      "language",
      "ratings",
      "price",
      "releaseYear",
      "sort",
      "fields",
      "page",
      "limit",
    ];

    // Validate query keys
    for (const key of Object.keys(req.query)) {
      // Check for comparison operators
      const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
      const field = match ? match[1] : key;

      if (!allowedFilters.includes(field)) {
        return next(new AppError(`Invalid query parameter: ${key}`, 400));
      }
    }

    // Copy query
    let queryObj = { ...req.query };

    // Alias: genre → genres
    if (queryObj.genre && !queryObj.genres) {
      queryObj.genres = queryObj.genre;
      delete queryObj.genre;
    }

    // Handle comparison operators for numbers/dates
    Object.keys(queryObj).forEach((key) => {
      const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
      if (match) {
        const field = match[1];
        const operator = `$${match[2]}`;

        if (!queryObj[field]) queryObj[field] = {};
        queryObj[field][operator] = isNaN(queryObj[key])
          ? queryObj[key]
          : Number(queryObj[key]);

        delete queryObj[key];
      }
    });

    // Handle array fields with case-insensitive regex
    const arrayFields = ["genres", "director", "casts", "language"];
    arrayFields.forEach((field) => {
      if (queryObj[field]) {
        const values = Array.isArray(queryObj[field])
          ? queryObj[field]
          : queryObj[field].split(",");

        queryObj[field] = {
          $in: values.map((v) => new RegExp(`^${v}$`, "i")), // exact, case-insensitive
        };
      }
    });

    // Sorting
    let sortBy;
    if (queryObj.sort) {
      sortBy = queryObj.sort.split(",").join(" ");
      delete queryObj.sort;
    }

    // Field limiting
    let selectedFields;
    if (queryObj.fields) {
      selectedFields = queryObj.fields.split(",").join(" ");
      delete queryObj.fields;
    }

    // Pagination
    const page = parseInt(queryObj.page) || 1;
    const limit = parseInt(queryObj.limit) || 10;
    delete queryObj.page;
    delete queryObj.limit;

    if (page <= 0 || limit <= 0) {
      return next(new AppError("Page and limit must be positive numbers", 400));
    }

    const skip = (page - 1) * limit;

    // Execute query
    let query = Movie.find(queryObj);

    if (sortBy) query = query.sort(sortBy);
    else query = query.sort("-createdAt");

    if (selectedFields) query = query.select(selectedFields);

    const moviesCount = await Movie.countDocuments(queryObj);

    if (skip >= moviesCount && moviesCount !== 0) {
      return next(
        new AppError("Requested page exceeds total number of documents", 400)
      );
    }

    query = query.skip(skip).limit(limit);

    const movies = await query;

    if (!movies.length) {
      return next(
        new AppError("No movies found for the given filters or query", 404)
      );
    }

    res.status(200).json({
      status: "success",
      result: movies.length,
      total: moviesCount,
      page,
      limit,
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
};
