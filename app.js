const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const getmoviesquery = `
    SELECT
      *
    FROM
      movie
    ORDER BY
      movie_id;`
  const moviesArray = await db.all(getmoviesquery)
  response.send(moviesArray)
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {movie_id, director_id, movie_name, lead_actor} = movieDetails
  const addmovieDetails = `
    INSERT INTO
      book (movie_id,director_id,movie_name,lead_actor)
    VALUES
      (
        ${movie_id},
         ${director_id},
         ${movie_name},
         ${lead_actor},
      );`

  const dbResponse = await db.run(addmovieDetails)
  const movieId = dbResponse.lastID
  response.send({movieId: movieId})
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movieId = ${movieId};`
  const movie = await db.get(getMovieQuery)
  response.send(movie)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId} = request.params
  const movieDetails = request.body
  const {movieName, leadActor} = movieDetails
  const updateTheMovie = `
    UPDATE
      movie
    SET
      movieName='${movieName}',
      leadActor=${leadActor},
    WHERE
      directorId = ${directorId};`
  await db.run(updateTheMovie)
  response.send('Movie Details Updated')
})

app.get(' /movies/:movieId/', async (request, response) => {
  const {movie_id} = request.params
  const getTheMovie = `
    SELECT
     *
    FROM
     movie
    WHERE
      movie_id = ${movie_id};`
  const movieDelete = await db.all(getTheMovie)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getdirectorMovie = `
    SELECT
      *
    FROM
      director 
    ORDER BY
      directorId;`
  const moviesArray = await db.all(getdirectorMovie)
  response.send(moviesArray)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {director_id} = request.params
  const getMoviesByDirector = `
    SELECT
      *
    FROM
      director 
    WHERE
      director_id = ${director_id};`
  const movie = await db.get(getMoviesByDirector)
  response.send(movie)
})

module.exports=app
