const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Movie duration required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    releaseYear: {
      type: Number,
      required: [true, "Movie release year required"],
    },
    ratings: {
      type: Number,
      min: [1, "Rating must be at least 1.0"],
      max: [10, "Rating cannot exceed 10.0"],
    },
    totalRatings: Number,
    releaseDate: {
      type: Date,
      required: [true, "Movie releaseDate required"],
    },
    genres: {
      type: [String],
      required: [true, "Movie genres required"],
    },
    director: {
      type: [String],
      required: [true, "Movie director name required"],
    },
    casts: {
      type: [String],
      required: [true, "Movie casts required"],
    },
    coverImage: {
      type: String,
      required: [true, "Movie coverImage required"],
    },
  },
  { timestamps: true }
);

movieSchema.pre("save", function (next) {
  if (!this.title) return next();

  let slug = this.title.toLowerCase();

  // 1. Remove special characters (keep letters, numbers, and spaces)
  slug = slug.replace(/[^a-z0-9\s]/g, "");

  // 2. Replace one or more spaces with single dash
  slug = slug.replace(/\s+/g, "-");

  // 3. Remove multiple consecutive dashes (if any)
  slug = slug.replace(/-+/g, "-");

  // 4. Trim leading/trailing dash
  slug = slug.replace(/^-+|-+$/g, "");

  this.slug = slug;

  next();
});

const Movie = mongoose.model("Movie", movieSchema);

// update all old data without slug
/*
async function addSlugToExistingMovies() {
  const movies = await Movie.find({ slug: { $exists: false } }); // যাদের slug নেই
  for (let movie of movies) {
    movie.slug = movie.title.toLowerCase().replace(/\s+/g, "-");
    await movie.save();
  }
  console.log("All old movies updated with slug!");
}

addSlugToExistingMovies();
*/
module.exports = Movie;
