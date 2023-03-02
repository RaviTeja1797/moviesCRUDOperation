const express = require("express");
const expressAppInstance = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
console.log(dbPath);

let databaseConnectionObject = null;

expressAppInstance.use(express.json());

const getDbConnectionObjectAndInitializeServer = async () => {
  try {
    databaseConnectionObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    expressAppInstance.listen(3000, () => {
      console.log("Server is listening on the http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Database error ${e.message}`);
  }
};

getDbConnectionObjectAndInitializeServer();

//API-1 getMovieList

expressAppInstance.get("/movies/", async (request, response) => {
  const getMovieListQuery = `SELECT movie_name FROM movie`;
  const moviesListArray = await databaseConnectionObject.all(getMovieListQuery);
  console.log(moviesListArray);
  const moviesListArrayWithCamelCaseProperty = [];
  moviesListArray.forEach((eachMovieObject, len, arr) => {
    let tempMovieObject = {
      movieName: eachMovieObject["movie_name"],
    };
    moviesListArrayWithCamelCaseProperty.push(tempMovieObject);
  });

  response.send(moviesListArrayWithCamelCaseProperty);
});

//API-2  addMovie

expressAppInstance.post("/movies/", async (request, response) => {
  const movieObjectFromClient = request.body;
  const { directorId, movieName, leadActor } = movieObjectFromClient;
  const addMovieQuery = `INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES(${directorId}, '${movieName}', '${leadActor}')`;

  const addMovieResponse = await databaseConnectionObject.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3 getMovie

expressAppInstance.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  let getMovieResponse = await databaseConnectionObject.get(getMovieQuery);
  console.log(getMovieResponse);
});
