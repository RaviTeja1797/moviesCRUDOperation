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
  let movieObject = await databaseConnectionObject.get(getMovieQuery);
  
  let tempObject ={
        movieId : movieObject["movie_id"],
        directorId : movieObject['director_id'],
        movieName : movieObject["movie_name"],
        leadActor : movieObject["lead_actor"]
   }
    response.send(tempObject)
});

//API -4 updateMovie

expressAppInstance.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);

  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = "${movieName}", lead_actor = "${leadActor}" WHERE movie_id = ${movieId}`;
  try {
    await databaseConnectionObject.run(updateMovieQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(`SQL Error ${e.message}`);
  }
});

//API-5 deleteMovie

expressAppInstance.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);

  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  try {
    await databaseConnectionObject.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (e) {
    console.log(`Database Error ${e.message}`);
  }
});

//API-6 getDirectorsList

expressAppInstance.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  let directorsObjectsArray = await databaseConnectionObject.all(
    getDirectorsQuery
  );
  directorsObjectsArray = directorsObjectsArray.map((eachObject) => {
    let tempObject = {
      directorId: eachObject["director_id"],
      directorName: eachObject["director_name"],
    };
    return tempObject;
  });
  response.send(directorsObjectsArray);
});

//API-7 movieDirectorList

expressAppInstance.get("/directors/:directorId/movies/", async(request, response)=>{
    let {directorId} = request.params;
    directorId = parseInt(directorId);
    
    const movieDirectorListQuery = `SELECT * FROM 
    movie NATURAL JOIN director as movieDirector
    WHERE movieDirector.director_id = ${directorId}`

    let arrayOfMovies = await databaseConnectionObject.all(movieDirectorListQuery)
    arrayOfMovies = arrayOfMovies.map((eachMovieObject)=>{
        let tempObject = {
            movieName: eachMovieObject['movie_name'],
        }
        return tempObject
    })
    response.send(arrayOfMovies)
});

module.exports = expressAppInstance;
