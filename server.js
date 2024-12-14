const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser
const app = express();

app.use(cors()); // To enable Cross-Origin Resource Sharing (CORS) for the web client
app.use(bodyParser.json()); // Parse JSON bodies

// MySQL connection configuration using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'flights.cdiagk8o8g4x.ap-southeast-1.rds.amazonaws.com', // Your RDS endpoint
  user: process.env.DB_USER || 'admin', // Your RDS username
  password: process.env.DB_PASSWORD || 'xx6UM3oJEa72Hjo5TbmV', // Your RDS password
  database: process.env.DB_NAME || 'flights', // Your RDS database name
  port: 3306, // MySQL default port
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1); // Exit the application if DB connection fails
  } else {
    console.log('Connected to the database');
  }
});

// Endpoint to fetch all flights
app.get('/flight_info', (req, res) => {
  db.query('SELECT * FROM flight_info', (err, results) => {
    if (err) {
      console.error('Error fetching flight data:', err);
      res.status(500).send('Error fetching flight data');
    } else {
      res.json(results);
    }
  });
});

// Endpoint to fetch all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).send('Error fetching user data');
    } else {
      res.json(results);
    }
  });
});

// Endpoint to fetch bookings
app.get('/bookings', (req, res) => {
  db.query('SELECT * FROM bookings', (err, results) => {
    if (err) {
      console.error('Error fetching booking data:', err);
      res.status(500).send('Error fetching booking data');
    } else {
      res.json(results);
    }
  });
});

// Endpoint to fetch a specific flight by ID
app.get('/flight_info/:id', (req, res) => {
  const flightId = req.params.id;
  db.query('SELECT * FROM flight_info WHERE flight_id = ?', [flightId], (err, results) => {
    if (err) {
      console.error('Error fetching flight details:', err);
      res.status(500).send('Error fetching flight details');
    } else {
      res.json(results[0]);
    }
  });
});


// POST endpoint to save passenger information
app.post('/passengers', (req, res) => {
  const { passengers } = req.body; // Expecting an array of passengers
  const insertQueries = passengers.map(passenger => {
    return new Promise((resolve, reject) => {
      const { given_name, last_name, nationality, gender, email, birth_date, travel_class, flight_number, gate } = passenger;
      const query = 'INSERT INTO passengers (given_name, nationality, gender, email, birth_date, travel_class, flight_number, gate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [given_name, last_name, nationality, gender, email, birth_date, travel_class, flight_number, gate], (err, result) => {
        if (err) {
          console.error('Error inserting passenger data:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  Promise.all(insertQueries)
    .then(results => {
      res.status(201).send({ message: 'Passengers added successfully', results });
    })
    .catch(error => {
      res.status(500).send('Error inserting passenger data');
    });
});

// POST endpoint to save passenger information
app.post('/users', (req, res) => {
  const { passengers } = req.body; // Expecting an array of passengers
  const insertQueries = passengers.map(passenger => {
    return new Promise((resolve, reject) => {
      const { Name, Nationality, Gender, Email, Birthdate, Class } = passenger;
      const query = 'INSERT INTO users (Name, Nationality, Gender, Email, Birthdate, Class) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [Name, Nationality, Gender, Email, Birthdate, Class], (err, result) => {
        if (err) {
          console.error('Error inserting passenger data:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  Promise.all(insertQueries)
    .then(results => {
      res.status(201).send({ message: 'Passengers added successfully', results });
    })
    .catch(error => {
      res.status(500).send('Error inserting passenger data');
    });
});

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next(); // Pass the request to the next middleware
});

// Start the server
const PORT = process.env.PORT || 3660; // Use the PORT from Railway
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});