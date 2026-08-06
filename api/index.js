const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic API test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Kolekta API is running' });
});

// Fallback to index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Export the app for Vercel serverless function
module.exports = app;
