const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables from configuration or root .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../../public')));

// Helper function to handle OpenWeather API requests
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch weather data from OpenWeather API');
        }
        return data;
    } catch (error) {
        throw new Error(error.message || 'Network error while contacting weather service');
    }
}

// API Routes

// 1. Get current weather and 5-day forecast by city name
app.get('/api/weather/city', async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
        return res.status(500).json({ error: 'OpenWeather API key is not configured on the server.' });
    }

    try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

        const [currentData, forecastData] = await Promise.all([
            fetchWeatherData(currentUrl),
            fetchWeatherData(forecastUrl)
        ]);

        res.json({ current: currentData, forecast: forecastData });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// 2. Get current weather and 5-day forecast by geographic coordinates (lat/lon)
app.get('/api/weather/coords', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
        return res.status(500).json({ error: 'OpenWeather API key is not configured on the server.' });
    }

    try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        const [currentData, forecastData] = await Promise.all([
            fetchWeatherData(currentUrl),
            fetchWeatherData(forecastUrl)
        ]);

        res.json({ current: currentData, forecast: forecastData });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// 3. Route weather comparison (Start and Destination)
app.get('/api/weather/route', async (req, res) => {
    const { start, destination } = req.query;
    if (!start || !destination) {
        return res.status(400).json({ error: 'Both start and destination cities are required' });
    }

    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
        return res.status(500).json({ error: 'OpenWeather API key is not configured on the server.' });
    }

    try {
        const startUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(start)}&units=metric&appid=${API_KEY}`;
        const destUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(destination)}&units=metric&appid=${API_KEY}`;
        const destForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&units=metric&appid=${API_KEY}`;

        const [startData, destData, destForecastData] = await Promise.all([
            fetchWeatherData(startUrl),
            fetchWeatherData(destUrl),
            fetchWeatherData(destForecastUrl)
        ]);

        res.json({
            start: startData,
            destination: destData,
            destinationForecast: destForecastData
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Fallback route to serve index.html for SPA navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Weather & Rider Safety Server running on http://localhost:${PORT}`);
});
