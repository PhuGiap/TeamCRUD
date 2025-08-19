// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database
const pool = require('./db');

// Routes
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require("./routes/teamRoutes");
const userTeamRoutes = require('./routes/userTeamRoutes');

app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/user-teams', userTeamRoutes);

// PORT
const PORT = process.env.PORT || 5000;

// Test DB connection trước khi start server
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB connection error:', err);
    process.exit(1); // dừng server nếu DB fail
  } else {
    console.log('DB connected:', res.rows[0]);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
});
