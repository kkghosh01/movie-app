const AppError = require("../Utils/appError.js");

class APIFeatures {
  /**
   * @param {Object} query - Mongoose query object (e.g., Movie.find())
   * @param {Object} queryString - req.query object
   * @param {Boolean} caseInsensitiveArrays - Optional, default true
   */
  constructor(query, queryString, caseInsensitiveArrays = true) {
    this.query = query;
    this.queryString = queryString;
    this.caseInsensitiveArrays = caseInsensitiveArrays;
  }

  filter() {
    const allowedFilters = [
      "genres",
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
      "duration",
    ];

    // Deep copy of queryString
    let queryStr = JSON.stringify(this.queryString);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let queryObj = JSON.parse(queryStr);

    // Validate all keys
    Object.keys(queryObj).forEach((key) => {
      const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
      const field = match ? match[1] : key;

      if (!allowedFilters.includes(field)) {
        throw new AppError(`Invalid query parameter: ${key}`, 400);
      }
    });
    // Remove non-filter fields
    ["sort", "fields", "page", "limit"].forEach((key) => delete queryObj[key]);

    // Optional: Array fields case-insensitive handling
    if (this.caseInsensitiveArrays) {
      const arrayFields = ["genres", "director", "casts", "language"];
      arrayFields.forEach((field) => {
        if (queryObj[field]) {
          const values = Array.isArray(queryObj[field])
            ? queryObj[field]
            : queryObj[field].toString().split(",");

          queryObj[field] = {
            $in: values.map((v) => new RegExp(`^${v}$`, "i")),
          };
        }
      });
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;

      if (Array.isArray(sortBy)) {
        sortBy = sortBy.join(" ");
      } else if (typeof sortBy === "string") {
        sortBy = sortBy.split(",").join(" ");
      }

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields;
      if (Array.isArray(fields)) fields = fields.join(" ");
      else if (typeof fields === "string") fields = fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;

    if (page <= 0 || limit <= 0) {
      throw new AppError("Page and limit must be positive numbers", 400);
    }

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.skip = skip;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
