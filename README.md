# MotoWeather & Rider Safety Pro 🏍️🌦️

A complete, modern, professional Weather & Rider Safety Application built with HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and OpenWeather API.

Designed specifically for normal users, bike riders, delivery partners, long-distance travellers, and road-trip enthusiasts.

---

## 🚀 Key Features & Functionality

### 1. Core Weather Features
- **City Search & Geolocation:** Search weather by city name with auto-suggest recent searches or use browser geolocation to detect local weather instantly.
- **Comprehensive Metrics:** Displays temperature (Celsius / Fahrenheit toggle), feels-like temperature, humidity, wind speed, wind direction, atmospheric pressure, visibility, cloud coverage, and sunrise/sunset timings.
- **Forecasts:** Real-time current weather, 24-hour hourly forecast, and a 5-day extended meteorological forecast.

### 2. Special Features for Bike Riders & Delivery Partners
- **Riding Safety Indicator:** Dynamic safety status (Safe, Caution, or Unsafe) based on wind speed, precipitation, visibility, and temperature.
- **Hazard Alerts:** Automated warning checks for Rain, Heavy Rain, Strong Winds, Thunderstorms & Lightning, Fog & Low Visibility, and Extreme Heat/Cold.
- **Gear Recommendations:** Suggests waterproof jackets, thermal layers, high-visibility vests, and helmets according to real-time weather conditions.

### 3. Travel & Route Weather Planner
- **Route Comparison:** Enter starting and destination cities to analyze and compare weather conditions along your journey.
- **Travel Preparation Checklist:** Generates dynamic safety checklists (tire checks, waterproof suits, first aid, hydration) based on destination weather.

### 4. Smart Alerts & Notifications
- Color-coded dashboard badges (Green: Safe, Yellow: Caution, Red: Unsafe).
- Optional browser push notifications for sudden weather hazards or storms.

### 5. Additional Useful Features
- Favorite cities management with quick access.
- Multi-city weather comparison grid.
- Dark mode and light mode toggle.
- Responsive mobile-first dashboard design with dynamic weather-based background themes.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Custom variables, glassmorphism), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Weather Data:** OpenWeather API (Current Weather & 5-Day Forecast endpoints)
- **Containerization:** Docker & Docker Compose

---

## 📂 Project Folder Structure

```text
Weather-apps/
├── backend/
│   └── server/
│       └── server.js          # Express backend & API proxy
├── public/
│   ├── CSS/
│   │   └── style.css          # Premium dashboard styling
│   ├── JavaScript/
│   │   └── app.js             # Frontend logic & safety algorithms
│   └── index.html             # Main dashboard UI
├── .env                       # Environment variables (API keys)
├── .gitignore
├── .dockerignore
├── Dockerfile                 # Docker container configuration
├── docker-compose.yml         # Docker Compose setup
├── package.json               # Node.js dependencies & scripts
└── README.md                  # Project documentation
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **OpenWeather API Key** (Free tier available at [OpenWeatherMap](https://openweathermap.org/api))

### Step 1: Clone or Open Project
Ensure you are in the project root directory:
```bash
cd C:\Users\91705\Weather-apps
```

### Step 2: Configure Environment Variables
Open the `.env` file in the root directory and add your OpenWeather API key:
```env
PORT=3000
OPENWEATHER_API_KEY=your_actual_openweather_api_key_here
```

### Step 3: Install Dependencies
```bash
npm install
```

---

## ▶️ How to Run Without Docker

Start the Express backend server:
```bash
npm start
```
*(For development with auto-restart, use `npm run dev`)*

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🐳 How to Build and Run Using Docker

Make sure Docker Desktop is installed and running on your machine.

### Step 1: Build and start containers with Docker Compose
```bash
docker-compose up --build
```

### Step 2: Access the Application
Open your browser and navigate to:
```text
http://localhost:3000
```

To stop the containers, press `Ctrl + C` or run:
```bash
docker-compose down
```

---

## 🔍 Troubleshooting

1. **"OpenWeather API key is not configured" Error:**
   - Ensure your `.env` file contains a valid `OPENWEATHER_API_KEY=` without placeholder text.
2. **City Not Found Error:**
   - Verify the spelling of the city name or include the country code (e.g., `London, UK`).
3. **Geolocation Blocked:**
   - Allow location permissions in your browser address bar when clicking the target location button.
