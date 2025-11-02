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
    // Deep copy of queryString
    let queryStr = JSON.stringify(this.queryString);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let queryObj = JSON.parse(queryStr);

    // Remove non-filter fields
    ["sort", "fields", "page", "limit"].forEach((key) => delete queryObj[key]);

    // Optional: Array fields case-insensitive handling
    if (this.caseInsensitiveArrays) {
      const arrayFields = ["genres", "director", "casts", "language"];
      arrayFields.forEach((field) => {
        if (queryObj[field]) {
          const values = Array.isArray(queryObj[field])
            ? queryObj[field]
            : queryObj[field].split(",");

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
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
