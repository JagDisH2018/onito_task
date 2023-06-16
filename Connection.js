const express = require('express');
const mysql = require('mysql');
const app = express();


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'onito',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});



//1
// Getting the top 10 movies with the longest runtime
app.get('/api/v1/longest-duration-movies', (req, res) => {
    const query = `
      SELECT tconst, primaryTitle, runtimeMinutes, genres
      FROM movies
      ORDER BY runtimeMinutes DESC
      LIMIT 10;
    `;
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error executing MySQL query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });
  





//2 *****************************POST********************************
app.use(express.json());

app.post('/api/v1/new-movie', (req, res) => {
  const { tconst, titleType, primaryTitle, runtimeMinutes, genres } = req.body;

  if (!tconst || !titleType || !primaryTitle || !runtimeMinutes || !genres) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

 //Insert
  const query = `
    INSERT INTO movies (tconst, titleType, primaryTitle, runtimeMinutes, genres)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Execute the query
  connection.query(query, [tconst, titleType, primaryTitle, runtimeMinutes, genres], (err) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ message: 'success' });
  });
});





  //3*****************************************
  //  Getting top-rated movies
app.get('/api/v1/top-rated-movies', (req, res) => {
  const query = `
    SELECT m.tconst, m.primaryTitle, m.genres, r.averageRating
    FROM movies m
    JOIN ratings r ON m.tconst = r.tconst
    WHERE r.averageRating > 6.0
    ORDER BY r.averageRating DESC;
      `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});





//4*********************************************************************** */
// Getting genre-wise movies with subtotals
app.get('/api/v1/genre-movies-with-subtotals', (req, res) => {
  const query = `
  SELECT m.genres, COUNT(*) AS numMovies, SUM(r.numVotes) AS totalNumVotes
  FROM movies m
  JOIN ratings r ON m.tconst = r.tconst
  GROUP BY m.genres;
  
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});



// 5
app.use(express.json());

// Updating runtimeMinutes of movies
app.post('/api/v1/update-runtime-minutes', (req, res) => {
  const updateQuery = `
    UPDATE movies
    SET runtimeMinutes = 
      CASE
        WHEN genres = 'Documentary' THEN runtimeMinutes + 15
        WHEN genres = 'Animation' THEN runtimeMinutes + 30
        ELSE runtimeMinutes + 45
      END
  `;

  connection.query(updateQuery, (err) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ message: 'success' });
  });
});
  
  // Start the server
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });