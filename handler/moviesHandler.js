const fs = require("fs");

let movies = [];

try {
  const data = fs.readFileSync("./data/movies.json", "utf-8");
  movies = JSON.parse(data);
} catch (error) {
  console.error("Something went wrong", error.message);
}

const validateBody = (req, res, next) => {
  // guard against req.body being undefined
  if (!req.body || !req.body.name || !req.body.releaseYear) {
    return res.status(400).json({
      status: "fail",
      message: "Not a valid movie data",
    });
  }
  next();
};

const checkMovieId = (req, res, next, value) => {
  const id = Number(value);
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({
      status: "fail",
      message: `Movie with id ${id} not found`,
    });
  }

  req.movie = movie;
  req.movieId = id;
  next();
};

const getAllMovies = (req, res) => {
  res.status(200).json({
    status: "success",
    result: movies.length,
    data: {
      movies,
    },
  });
};

const getMovie = (req, res) => {
  res.status(200).json({
    status: "success",
    data: { movie: req.movie },
  });
};

const addMovie = (req, res) => {
  const newMovieId = movies.length ? movies[movies.length - 1].id + 1 : 1;
  const newMovie = Object.assign({ id: newMovieId }, req.body);
  movies.push(newMovie);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Could not save movie data.",
      });
    }
    res.status(201).json({
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  });
};

const updateMovie = (req, res) => {
  const movieIndex = movies.findIndex((m) => m.id === req.movieId);

  movies[movieIndex] = { ...movies[movieIndex], ...req.body };

  fs.writeFile("./data/movies.json", JSON.stringify(movies, null, 2), (err) => {
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Could not save movie data.",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        movie: movies[movieIndex],
      },
    });
  });
};

const deleteMovie = (req, res) => {
  const movieIndex = movies.findIndex((m) => m.id === req.movieId);

  movies.splice(movieIndex, 1);

  fs.writeFile("./data/movies.json", JSON.stringify(movies, null, 2), (err) => {
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Could not save movie data.",
      });
    }

    res.status(204).send();
  });
};

module.exports = {
  getAllMovies,
  getMovie,
  addMovie,
  updateMovie,
  deleteMovie,
  checkMovieId,
  validateBody,
};
