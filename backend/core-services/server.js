require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import Routes
const userRoutes = require('./src/routes/userRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const venuRoutes = require('./src/routes/venuRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);
app.use('/booking', bookingRoutes);
app.use('/venu', venuRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});