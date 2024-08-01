const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());


const corsOptions = {
    origin: 'https://stock-inventory-tracker-fe.vercel.app',
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));


// Database connection
// Database connection
mongoose.connect('mongodb+srv://jethro:s5Fj0X0FWfg8g5mG@stocktrack.xjifwsj.mongodb.net/?retryWrites=true&w=majority&appName=StockTrack', {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Routes
const rentals = require('./routes/rentals');
app.use('/api/rentals', rentals);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
