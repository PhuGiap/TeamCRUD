const express = require('express'); 
const dotenv = require('dotenv'); 
const userRoutes = require('./routes/userRoutes'); 
const teamRoutes = require("./routes/teamRoutes"); 
const swaggerUi = require("swagger-ui-express"); 
const YAML = require("yamljs"); 
const swaggerDocument = YAML.load("./swagger.yaml"); dotenv.config(); 
const app = express(); const cors = require("cors"); 
const userTeamRoutes = require('./routes/userTeamRoutes'); 
app.use('/api/user-teams', userTeamRoutes); app.use(cors()); 
app.use(express.json()); 
// Routes 
app.use('/api/users', userRoutes); 
app.use("/api/teams", teamRoutes); 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log('Server running on port', {PORT}));