/* ==========================================================================
   MotoWeather & Rider Safety Pro - Frontend Application JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let currentWeatherData = null;
    let forecastWeatherData = null;
    let currentCityName = 'London'; // Default initial city
    let temperatureUnit = 'C'; // 'C' or 'F'
    let isDarkMode = true;
    let favoriteCities = JSON.parse(localStorage.getItem('moto_weather_favorites')) || [];
    let recentSearches = JSON.parse(localStorage.getItem('moto_weather_recent')) || ['London', 'New York', 'Tokyo', 'Sydney'];
    let comparisonCitiesData = [];
    let browserNotificationsEnabled = false;

    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const geoBtn = document.getElementById('geo-btn');
    const recentSearchesContainer = document.getElementById('recent-searches');
    const recentChipsContainer = document.getElementById('recent-chips');
    const notificationToggleBtn = document.getElementById('notification-toggle-btn');
    const unitToggleBtn = document.getElementById('unit-toggle-btn');
    const unitLabel = document.getElementById('unit-label');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorBanner = document.getElementById('error-banner');
    const errorMessage = document.getElementById('error-message');
    const errorClose = document.getElementById('error-close');
    const favoriteBtn = document.getElementById('favorite-btn');

    // Dashboard Elements
    const dashboardAlertSection = document.getElementById('dashboard-alert-section');
    const dashboardAlertIcon = document.getElementById('dashboard-alert-icon');
    const dashboardAlertTitle = document.getElementById('dashboard-alert-title');
    const dashboardAlertBadge = document.getElementById('dashboard-alert-badge');
    const dashboardAlertDesc = document.getElementById('dashboard-alert-desc');

    const currentCityEl = document.getElementById('current-city');
    const currentDateEl = document.getElementById('current-date');
    const currentTempEl = document.getElementById('current-temp');
    const feelsLikeEl = document.getElementById('feels-like');
    const weatherIconEl = document.getElementById('weather-icon');
    const weatherConditionEl = document.getElementById('weather-condition');

    const highlightHumidity = document.getElementById('highlight-humidity');
    const highlightWind = document.getElementById('highlight-wind');
    const highlightPressure = document.getElementById('highlight-pressure');
    const highlightVisibility = document.getElementById('highlight-visibility');

    const hourlyContainer = document.getElementById('hourly-container');
    const forecastContainer = document.getElementById('forecast-container');

    const sunSunrise = document.getElementById('sun-sunrise');
    const sunSunset = document.getElementById('sun-sunset');
    const windDirectionText = document.getElementById('wind-direction-text');
    const windDeg = document.getElementById('wind-deg');
    const cloudCoverage = document.getElementById('cloud-coverage');
    const tempMax = document.getElementById('temp-max');
    const tempMin = document.getElementById('temp-min');

    // Rider Safety Elements
    const riderSafetyCardBg = document.getElementById('rider-safety-card-bg');
    const riderSafetyBadge = document.getElementById('rider-safety-badge');
    const riderSafetyIcon = document.getElementById('rider-safety-icon');
    const riderSafetyStatusText = document.getElementById('rider-safety-status-text');
    const riderCityTitle = document.getElementById('rider-city-title');
    const riderPrimaryAdvice = document.getElementById('rider-primary-advice');
    const riderRecommendationAction = document.getElementById('rider-recommendation-action');
    const hazardListContainer = document.getElementById('hazard-list-container');
    const gearGridContainer = document.getElementById('gear-grid-container');

    // Travel Planner Elements
    const routeForm = document.getElementById('route-form');
    const routeStartInput = document.getElementById('route-start');
    const routeDestInput = document.getElementById('route-dest');
    const routeSwapBtn = document.getElementById('route-swap-btn');
    const routeResultsContainer = document.getElementById('route-results-container');
    const routeStartName = document.getElementById('route-start-name');
    const routeStartIcon = document.getElementById('route-start-icon');
    const routeStartTemp = document.getElementById('route-start-temp');
    const routeStartCond = document.getElementById('route-start-cond');
    const routeStartWind = document.getElementById('route-start-wind');
    const routeStartHum = document.getElementById('route-start-hum');
    const routeDestName = document.getElementById('route-dest-name');
    const routeDestIcon = document.getElementById('route-dest-icon');
    const routeDestTemp = document.getElementById('route-dest-temp');
    const routeDestCond = document.getElementById('route-dest-cond');
    const routeDestWind = document.getElementById('route-dest-wind');
    const routeDestHum = document.getElementById('route-dest-hum');
    const routeSafetyBadge = document.getElementById('route-safety-badge');
    const routeAdvisoryText = document.getElementById('route-advisory-text');
    const checklistItems = document.getElementById('checklist-items');

    // Comparison Elements
    const comparisonForm = document.getElementById('comparison-form');
    const comparisonInput = document.getElementById('comparison-input');
    const comparisonGrid = document.getElementById('comparison-grid');

    // Favorites Elements
    const favoritesGrid = document.getElementById('favorites-grid');
    const noFavorites = document.getElementById('no-favorites');

    // Navigation Tabs Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            if (targetTab === 'favorites') {
                renderFavorites();
            }
        });
    });

    // Initialize Application
    initApp();

    function initApp() {
        setupEventListeners();
        renderRecentSearches();
        fetchWeatherByCity(currentCityName);
    }

    function setupEventListeners() {
        // Search submit
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = searchInput.value.trim();
            if (city) {
                fetchWeatherByCity(city);
                addRecentSearch(city);
                searchInput.value = '';
                recentSearchesContainer.classList.add('hidden');
            }
        });

        // Search input focus / blur for recent searches
        searchInput.addEventListener('focus', () => {
            if (recentSearches.length > 0) {
                renderRecentChips();
                recentSearchesContainer.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target) && !recentSearchesContainer.contains(e.target)) {
                recentSearchesContainer.classList.add('hidden');
            }
        });

        // Geolocation button
        geoBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                showLoading(true);
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        fetchWeatherByCoords(lat, lon);
                    },
                    (error) => {
                        showLoading(false);
                        showError('Geolocation access denied or unavailable. Please search manually.');
                    },
                    { timeout: 10000 }
                );
            } else {
                showError('Geolocation is not supported by your browser.');
            }
        });

        // Unit Toggle (°C / °F)
        unitToggleBtn.addEventListener('click', () => {
            temperatureUnit = temperatureUnit === 'C' ? 'F' : 'C';
            unitLabel.textContent = `°D` === '°D' ? `°${temperatureUnit}` : `°${temperatureUnit}`;
            if (currentWeatherData && forecastWeatherData) {
                updateDashboardUI(currentWeatherData, forecastWeatherData);
            }
        });

        // Theme Toggle (Dark / Light)
        themeToggleBtn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
            themeToggleBtn.innerHTML = isDarkMode ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });

        // Refresh Button
        refreshBtn.addEventListener('click', () => {
            if (currentCityName) {
                fetchWeatherByCity(currentCityName);
            }
        });

        // Error close
        errorClose.addEventListener('click', () => {
            errorBanner.classList.add('hidden');
        });

        // Favorite Toggle Button
        favoriteBtn.addEventListener('click', () => {
            toggleFavorite(currentCityName);
        });

        // Route Planner Swap
        routeSwapBtn.addEventListener('click', () => {
            const temp = routeStartInput.value;
            routeStartInput.value = routeDestInput.value;
            routeDestInput.value = temp;
        });

        // Route Form Submit
        routeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const start = routeStartInput.value.trim();
            const dest = routeDestInput.value.trim();
            if (start && dest) {
                fetchRouteWeather(start, dest);
            }
        });

        // Comparison Form Submit
        comparisonForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = comparisonInput.value.trim();
            if (city) {
                addComparisonCity(city);
                comparisonInput.value = '';
            }
        });

        // Browser Notification Toggle
        notificationToggleBtn.addEventListener('click', () => {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notifications.");
                return;
            }

            if (Notification.permission === "granted") {
                browserNotificationsEnabled = true;
                notificationToggleBtn.classList.add('active');
                new Notification("MotoWeather Pro", { body: "Browser notifications are enabled for safety alerts!" });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        browserNotificationsEnabled = true;
                        notificationToggleBtn.classList.add('active');
                        new Notification("MotoWeather Pro", { body: "Browser notifications enabled successfully!" });
                    }
                });
            } else {
                alert("Notifications are blocked in your browser settings.");
            }
        });
    }

    // API Fetch Functions
    async function fetchWeatherByCity(city) {
        showLoading(true);
        errorBanner.classList.add('hidden');
        try {
            const response = await fetch(`/api/weather/city?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data');
            }

            currentWeatherData = data.current;
            forecastWeatherData = data.forecast;
            currentCityName = data.current.name;

            updateDashboardUI(data.current, data.forecast);
            updateRiderSafetyHub(data.current, data.forecast);
            checkAndTriggerNotification(data.current);
            showLoading(false);
        } catch (error) {
            showLoading(false);
            showError(error.message || 'City not found or network error occurred.');
        }
    }

    async function fetchWeatherByCoords(lat, lon) {
        showLoading(true);
        errorBanner.classList.add('hidden');
        try {
            const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data for location');
            }

            currentWeatherData = data.current;
            forecastWeatherData = data.forecast;
            currentCityName = data.current.name;

            updateDashboardUI(data.current, data.forecast);
            updateRiderSafetyHub(data.current, data.forecast);
            checkAndTriggerNotification(data.current);
            showLoading(false);
        } catch (error) {
            showLoading(false);
            showError(error.message || 'Unable to retrieve location weather.');
        }
    }

    async function fetchRouteWeather(start, dest) {
        showLoading(true);
        try {
            const response = await fetch(`/api/weather/route?start=${encodeURIComponent(start)}&destination=${encodeURIComponent(dest)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch route weather');
            }

            renderRouteResults(data);
            showLoading(false);
        } catch (error) {
            showLoading(false);
            showError(error.message || 'Error fetching route weather. Please check city names.');
        }
    }

    // UI Updates & Calculations
    function updateDashboardUI(current, forecast) {
        // Background theme adaptation
        updateWeatherTheme(current.weather[0].main);

        // Location & Date
        currentCityEl.textContent = `${current.name}, ${current.sys.country}`;
        currentDateEl.textContent = formatDate(new Date(current.dt * 1000));

        // Temperature conversion
        const temp = convertTemp(current.main.temp);
        const feelsLike = convertTemp(current.main.feels_like);
        const tMax = convertTemp(current.main.temp_max);
        const tMin = convertTemp(current.main.temp_min);

        currentTempEl.textContent = Math.round(temp);
        feelsLikeEl.textContent = Math.round(feelsLike);
        tempMax.textContent = `${Math.round(tMax)}°${temperatureUnit}`;
        tempMin.textContent = `${Math.round(tMin)}°${temperatureUnit}`;

        // Weather Condition & Icon
        const condition = current.weather[0].description;
        weatherConditionEl.textContent = condition;
        weatherIconEl.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;

        // Mini Highlights
        highlightHumidity.textContent = `${current.main.humidity}%`;
        highlightWind.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`; // m/s to km/h
        highlightPressure.textContent = `${current.main.pressure} hPa`;
        highlightVisibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;

        // Detailed Metrics
        sunSunrise.textContent = formatTime(new Date(current.sys.sunrise * 1000));
        sunSunset.textContent = formatTime(new Date(current.sys.sunset * 1000));
        windDeg.textContent = `Direction: ${current.wind.deg || 0}°`;
        windDirectionText.textContent = getWindDirectionText(current.wind.deg);
        cloudCoverage.textContent = `${current.clouds.all}%`;

        // Favorite button state
        updateFavoriteButtonState(current.name);

        // Hourly forecast (next 8 items = 24 hours)
        renderHourlyForecast(forecast.list);

        // 5-Day forecast
        render5DayForecast(forecast.list);
    }

    function updateRiderSafetyHub(current, forecast) {
        riderCityTitle.textContent = `${current.name}, ${current.sys.country}`;
        
        const safetyScore = calculateRiderSafety(current, forecast);
        
        // Update Safety Badge & Banner
        riderSafetyCardBg.className = `weather-card safety-status-card ${safetyScore.level}`;
        riderSafetyBadge.className = `safety-badge-large ${safetyScore.level}`;
        riderSafetyIcon.className = `fa-solid ${safetyScore.icon}`;
        riderSafetyStatusText.textContent = safetyScore.statusText;
        riderPrimaryAdvice.textContent = safetyScore.advice;
        riderRecommendationAction.textContent = safetyScore.action;

        // Dashboard Top Alert Banner
        dashboardAlertSection.className = `alert-banner-section ${safetyScore.level}`;
        dashboardAlertIcon.className = `fa-solid ${safetyScore.dashboardIcon}`;
        dashboardAlertTitle.textContent = `Riding Conditions: ${safetyScore.statusText}`;
        dashboardAlertBadge.className = `badge ${safetyScore.level}`;
        dashboardAlertBadge.textContent = safetyScore.badgeText;
        dashboardAlertDesc.textContent = safetyScore.advice;

        // Render Hazards
        renderHazardsList(current, forecast);

        // Render Gear Suggestions
        renderGearSuggestions(current);
    }

    function calculateRiderSafety(current, forecast) {
        const windSpeedKmh = current.wind.speed * 3.6;
        const condition = current.weather[0].main.toLowerCase();
        const visibilityKm = current.visibility / 1000;
        const tempC = current.main.temp;
        const rain3h = current.rain ? current.rain['3h'] || 0 : 0;

        let level = 'safe';
        let statusText = 'SAFE TO RIDE';
        let badgeText = 'Safe';
        let icon = 'fa-shield-check';
        let dashboardIcon = 'fa-shield-check';
        let advice = 'Weather conditions are optimal for riding, delivery, and travel. Enjoy a smooth and safe trip!';
        let action = 'Standard riding gear is sufficient. Maintain defensive driving habits.';

        // Check for Dangerous Conditions (Red)
        if (condition.includes('thunderstorm') || windSpeedKmh > 55 || visibilityKm < 1.0 || rain3h > 15 || tempC > 40 || tempC < -5) {
            level = 'danger';
            statusText = 'UNSAFE TO RIDE';
            badgeText = 'Unsafe / Hazard';
            icon = 'fa-triangle-exclamation';
            dashboardIcon = 'fa-triangle-exclamation';
            advice = 'Severe weather hazards detected! Riding is strongly discouraged due to extreme safety risks.';
            action = 'Postpone your trip or use enclosed four-wheel transport immediately.';
        } 
        // Check for Caution Conditions (Yellow)
        else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('snow') || condition.includes('mist') || condition.includes('fog') || windSpeedKmh > 35 || visibilityKm < 4.0 || tempC > 35 || tempC < 5) {
            level = 'caution';
            statusText = 'RIDE WITH CAUTION';
            badgeText = 'Caution Required';
            icon = 'fa-circle-exclamation';
            dashboardIcon = 'fa-circle-exclamation';
            advice = 'Moderate weather risks detected. Exercise heightened vigilance and reduce speed.';
            action = 'Wear waterproof gear, increase braking distance, and keep headlights on.';
        }

        return { level, statusText, badgeText, icon, dashboardIcon, advice, action };
    }

    function renderHazardsList(current, forecast) {
        const windSpeedKmh = current.wind.speed * 3.6;
        const condition = current.weather[0].main.toLowerCase();
        const visibilityKm = current.visibility / 1000;
        const tempC = current.main.temp;

        const hazards = [
            {
                title: 'Rain & Wet Roads',
                active: condition.includes('rain') || condition.includes('drizzle'),
                severe: (current.rain && current.rain['3h'] > 10),
                desc: 'Slippery road surfaces and reduced tire traction.'
            },
            {
                title: 'Strong Winds',
                active: windSpeedKmh > 30,
                severe: windSpeedKmh > 50,
                desc: `Wind speed is at ${Math.round(windSpeedKmh)} km/h.`
            },
            {
                title: 'Thunderstorm & Lightning',
                active: condition.includes('thunderstorm'),
                severe: true,
                desc: 'Extreme electrical storms and gusty winds.'
            },
            {
                title: 'Fog & Low Visibility',
                active: visibilityKm < 4.0 || condition.includes('fog') || condition.includes('mist'),
                severe: visibilityKm < 1.5,
                desc: `Visibility is restricted to ${visibilityKm.toFixed(1)} km.`
            },
            {
                title: 'Extreme Temperatures',
                active: tempC > 34 || tempC < 8,
                severe: tempC > 40 || tempC < 0,
                desc: `Current temperature is ${Math.round(tempC)}°C.`
            }
        ];

        hazardListContainer.innerHTML = hazards.map(h => {
            let statusClass = 'safe';
            let badgeText = 'Normal';
            let iconClass = 'fa-circle-check';

            if (h.active) {
                if (h.severe) {
                    statusClass = 'danger';
                    badgeText = 'Warning / Severe';
                    iconClass = 'fa-triangle-exclamation';
                } else {
                    statusClass = 'warning';
                    badgeText = 'Caution';
                    iconClass = 'fa-circle-exclamation';
                }
            }

            return `
                <div class="hazard-item">
                    <div class="hazard-info ${statusClass}-check">
                        <i class="fa-solid ${iconClass}"></i>
                        <div>
                            <span class="hazard-title">${h.title}</span>
                            <small class="text-secondary" style="display:block; font-size:11px;">${h.desc}</small>
                        </div>
                    </div>
                    <span class="hazard-status-badge ${statusClass}">${badgeText}</span>
                </div>
            `;
        }).join('');
    }

    function renderGearSuggestions(current) {
        const tempC = current.main.temp;
        const condition = current.weather[0].main.toLowerCase();
        const windSpeedKmh = current.wind.speed * 3.6;

        const gearList = [];

        if (condition.includes('rain') || condition.includes('drizzle')) {
            gearList.push({ icon: 'fa-shirt', title: 'Waterproof Raincoat', desc: 'Essential to keep dry during rainfall.' });
            gearList.push({ icon: 'fa-shoe-prints', title: 'Waterproof Boots', desc: 'Prevent soaked footwear while riding.' });
        } else {
            gearList.push({ icon: 'fa-vest', title: 'Riding Jacket', desc: 'Standard protective abrasion-resistant jacket.' });
        }

        if (tempC < 15) {
            gearList.push({ icon: 'fa-mitten', title: 'Thermal Inner Layers & Gloves', desc: 'Protect hands and core from cold wind chills.' });
        } else if (tempC > 32) {
            gearList.push({ icon: 'fa-bottle-water', title: 'Hydration Pack', desc: 'Prevent dehydration under extreme heat.' });
        }

        if (visibilityKmCheck(current) < 3.0 || condition.includes('fog')) {
            gearList.push({ icon: 'fa-lightbulb', title: 'High-Visibility Vest & Clear Visor', desc: 'Ensure you are visible to motorists in fog.' });
        }

        if (windSpeedKmh > 40) {
            gearList.push({ icon: 'fa-helmet-safety', title: 'Full-Face Aerodynamic Helmet', desc: 'Secure helmet firmly against strong crosswinds.' });
        }

        // Default gear if none triggered
        if (gearList.length < 2) {
            gearList.push({ icon: 'fa-helmet-safety', title: 'DOT Certified Helmet', desc: 'Mandatory head protection.' });
            gearList.push({ icon: 'fa-hands', title: 'Riding Gloves', desc: 'For firm handlebar grip and knuckle protection.' });
        }

        gearGridContainer.innerHTML = gearList.map(g => `
            <div class="gear-card">
                <i class="fa-solid ${g.icon}"></i>
                <div class="gear-info">
                    <h4>${g.title}</h4>
                    <p>${g.desc}</p>
                </div>
            </div>
        `).join('');
    }

    function visibilityKmCheck(current) {
        return current.visibility / 1000;
    }

    function renderHourlyForecast(list) {
        // Next 8 timestamps (24 hours)
        const hourlyItems = list.slice(0, 8).map(item => {
            const time = formatHour(new Date(item.dt * 1000));
            const temp = Math.round(convertTemp(item.main.temp));
            const icon = item.weather[0].icon;
            return `
                <div class="hourly-item">
                    <div class="hourly-time">${time}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Icon" class="hourly-icon">
                    <div class="hourly-temp">${temp}°${temperatureUnit}</div>
                </div>
            `;
        }).join('');

        hourlyContainer.innerHTML = hourlyItems;
    }

    function render5DayForecast(list) {
        // Filter forecast list for daily items (approx 12:00 PM each day)
        const dailyMap = {};
        list.forEach(item => {
            const dateStr = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyMap[dateStr] && item.dt_txt.includes('12:00:00')) {
                dailyMap[dateStr] = item;
            }
        });

        const dailyArray = Object.values(dailyMap).slice(0, 5);

        forecastContainer.innerHTML = dailyArray.map(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const maxTemp = Math.round(convertTemp(item.main.temp_max));
            const minTemp = Math.round(convertTemp(item.main.temp_min));
            const cond = item.weather[0].description;
            const icon = item.weather[0].icon;

            return `
                <div class="forecast-card">
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-date">${dateFormatted}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Icon" class="forecast-icon">
                    <div class="forecast-cond">${cond}</div>
                    <div class="forecast-temps">
                        <span class="forecast-max">${maxTemp}°</span>
                        <span class="forecast-min">${minTemp}°</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderRouteResults(data) {
        routeResultsContainer.classList.remove('hidden');

        const start = data.start;
        const dest = data.destination;

        routeStartName.textContent = `${start.name}, ${start.sys.country}`;
        routeStartIcon.src = `https://openweathermap.org/img/wn/${start.weather[0].icon}@2x.png`;
        routeStartTemp.textContent = `${Math.round(convertTemp(start.main.temp))}°${temperatureUnit}`;
        routeStartCond.textContent = start.weather[0].description;
        routeStartWind.textContent = `${Math.round(start.wind.speed * 3.6)} km/h`;
        routeStartHum.textContent = `${start.main.humidity}%`;

        routeDestName.textContent = `${dest.name}, ${dest.sys.country}`;
        routeDestIcon.src = `https://openweathermap.org/img/wn/${dest.weather[0].icon}@2x.png`;
        routeDestTemp.textContent = `${Math.round(convertTemp(dest.main.temp))}°${temperatureUnit}`;
        routeDestCond.textContent = dest.weather[0].description;
        routeDestWind.textContent = `${Math.round(dest.wind.speed * 3.6)} km/h`;
        routeDestHum.textContent = `${dest.main.humidity}%`;

        // Route safety summary calculation
        const destCond = dest.weather[0].main.toLowerCase();
        const destWind = dest.wind.speed * 3.6;
        let badgeClass = 'safe';
        let badgeText = 'Safe Travel Conditions';
        let advisory = 'Weather conditions across both departure and destination points are stable and clear. Safe travels!';

        if (destCond.includes('thunderstorm') || destWind > 50 || dest.visibility < 1000) {
            badgeClass = 'danger';
            badgeText = 'Hazardous Destination Weather';
            advisory = 'Severe weather warnings at your destination! Consider postponing your trip or securing heavy gear.';
        } else if (destCond.includes('rain') || destWind > 30) {
            badgeClass = 'caution';
            badgeText = 'Caution Advised on Route';
            advisory = 'Rain or strong wind expected along the route or destination. Ride with increased caution.';
        }

        routeSafetyBadge.className = `badge ${badgeClass}`;
        routeSafetyBadge.textContent = badgeText;
        routeAdvisoryText.textContent = advisory;

        // Travel checklist based on destination
        renderTravelChecklist(dest);
    }

    function renderTravelChecklist(dest) {
        const temp = dest.main.temp;
        const cond = dest.weather[0].main.toLowerCase();
        const wind = dest.wind.speed * 3.6;

        const items = [
            'Vehicle inspection (tire pressure, brakes, oil & coolant)',
            'Valid driver license, registration, and insurance papers',
            'First aid kit and emergency tool set'
        ];

        if (cond.includes('rain')) {
            items.push('Waterproof riding suit / raincoat & shoe covers');
            items.push('Anti-fog helmet visor spray');
        }
        if (temp < 15) {
            items.push('Thermal inner wear & windproof riding gloves');
        }
        if (temp > 32) {
            items.push('Sunscreen lotion & electrolyte water bottles');
        }
        if (wind > 35) {
            items.push('Heavy touring jacket for stability against crosswinds');
        }

        checklistItems.innerHTML = items.map(item => `
            <div class="checklist-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>${item}</span>
            </div>
        `).join('');
    }

    // Comparison Logic
    async function addComparisonCity(cityName) {
        try {
            const response = await fetch(`/api/weather/city?city=${encodeURIComponent(cityName)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Check if already in array
            if (!comparisonCitiesData.some(c => c.name.toLowerCase() === data.current.name.toLowerCase())) {
                comparisonCitiesData.push(data.current);
                renderComparisonGrid();
            }
        } catch (error) {
            alert(`Could not add city: ${error.message}`);
        }
    }

    function renderComparisonGrid() {
        if (comparisonCitiesData.length === 0) {
            comparisonGrid.innerHTML = `<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">No cities added for comparison yet. Use the search bar above.</p>`;
            return;
        }

        comparisonGrid.innerHTML = comparisonCitiesData.map((city, index) => {
            const temp = Math.round(convertTemp(city.main.temp));
            const wind = Math.round(city.wind.speed * 3.6);
            const icon = city.weather[0].icon;
            const cond = city.weather[0].description;
            const safety = city.wind.speed * 3.6 > 45 || city.weather[0].main.toLowerCase().includes('thunderstorm') ? 'Unsafe' : (city.weather[0].main.toLowerCase().includes('rain') ? 'Caution' : 'Safe');

            return `
                <div class="comparison-card">
                    <div class="comparison-card-top">
                        <h3>${city.name}, ${city.sys.country}</h3>
                        <button class="comparison-remove" onclick="removeComparisonCity(${index})">&times;</button>
                    </div>
                    <div class="comparison-body">
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Icon">
                        <div>
                            <h4>${temp}°${temperatureUnit}</h4>
                            <p>${cond}</p>
                        </div>
                    </div>
                    <ul class="comparison-stats">
                        <li><span>Wind Speed:</span> <strong>${wind} km/h</strong></li>
                        <li><span>Humidity:</span> <strong>${city.main.humidity}%</strong></li>
                        <li><span>Pressure:</span> <strong>${city.main.pressure} hPa</strong></li>
                        <li><span>Rider Safety:</span> <strong style="color: var(--${safety.toLowerCase() === 'safe' ? 'safe-color' : (safety.toLowerCase() === 'caution' ? 'caution-color' : 'danger-color')});">${safety}</strong></li>
                    </ul>
                </div>
            `;
        }).join('');
    }

    window.removeComparisonCity = function(index) {
        comparisonCitiesData.splice(index, 1);
        renderComparisonGrid();
    }

    // Favorites Logic
    function toggleFavorite(cityName) {
        const index = favoriteCities.findIndex(c => c.toLowerCase() === cityName.toLowerCase());
        if (index > -1) {
            favoriteCities.splice(index, 1);
        } else {
            favoriteCities.push(cityName);
        }
        localStorage.setItem('moto_weather_favorites', JSON.stringify(favoriteCities));
        updateFavoriteButtonState(cityName);
    }

    function updateFavoriteButtonState(cityName) {
        const isFav = favoriteCities.some(c => c.toLowerCase() === cityName.toLowerCase());
        if (isFav) {
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #ef4444;"></i>';
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
    }

    async function renderFavorites() {
        if (favoriteCities.length === 0) {
            favoritesGrid.innerHTML = '';
            noFavorites.classList.remove('hidden');
            return;
        }

        noFavorites.classList.add('hidden');
        favoritesGrid.innerHTML = '';

        for (const city of favoriteCities) {
            try {
                const response = await fetch(`/api/weather/city?city=${encodeURIComponent(city)}`);
                const data = await response.json();
                if (response.ok) {
                    const c = data.current;
                    const temp = Math.round(convertTemp(c.main.temp));
                    const icon = c.weather[0].icon;

                    const card = document.createElement('div');
                    card.className = 'favorite-city-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <div>
                                <h3>${c.name}, ${c.sys.country}</h3>
                                <p style="font-size:12px; color:var(--text-secondary); text-transform:capitalize;">${c.weather[0].description}</p>
                            </div>
                            <span style="font-size:24px; font-weight:800;">${temp}°${temperatureUnit}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:12px; color:var(--text-secondary);">
                            <span>Wind: ${Math.round(c.wind.speed * 3.6)} km/h</span>
                            <span>Humidity: ${c.main.humidity}%</span>
                        </div>
                    `;
                    card.addEventListener('click', () => {
                        fetchWeatherByCity(c.name);
                        document.querySelector('[data-tab="dashboard"]').click();
                    });
                    favoritesGrid.appendChild(card);
                }
            } catch (err) {
                console.error(`Failed to load favorite city: ${city}`);
            }
        }
    }

    // Recent Searches Logic
    function addRecentSearch(city) {
        const filtered = recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
        filtered.unshift(city);
        recentSearches = filtered.slice(0, 5); // Keep top 5
        localStorage.setItem('moto_weather_recent', JSON.stringify(recentSearches));
        renderRecentSearches();
    }

    function renderRecentSearches() {
        // Render in dropdown chips
    }

    function renderRecentChips() {
        recentChipsContainer.innerHTML = recentSearches.map(city => `
            <span class="recent-chip" onclick="searchRecentCity('${city}')">${city}</span>
        `).join('');
    }

    window.searchRecentCity = function(city) {
        fetchWeatherByCity(city);
        recentSearchesContainer.classList.add('hidden');
    }

    // Helpers
    function convertTemp(tempC) {
        if (temperatureUnit === 'F') {
            return (tempC * 9/5) + 32;
        }
        return tempC;
    }

    function updateWeatherTheme(condition) {
        const cond = condition.toLowerCase();
        document.body.className = 'weather-theme-default';
        if (cond.includes('clear')) document.body.className = 'weather-theme-clear';
        else if (cond.includes('cloud')) document.body.className = 'weather-theme-clouds';
        else if (cond.includes('rain') || cond.includes('drizzle')) document.body.className = 'weather-theme-rain';
        else if (cond.includes('thunder')) document.body.className = 'weather-theme-thunderstorm';
        else if (cond.includes('snow')) document.body.className = 'weather-theme-snow';
    }

    function getWindDirectionText(deg) {
        if (deg === undefined) return 'Variable';
        const directions = ['North', 'North-Northeast', 'Northeast', 'East-Northeast', 'East', 'East-Southeast', 'Southeast', 'South-Southeast', 'South', 'South-Southwest', 'Southwest', 'West-Southwest', 'West', 'West-Northwest', 'Northwest', 'North-Northwest'];
        const val = Math.floor((deg / 22.5) + 0.5);
        return directions[(val % 16)];
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function formatHour(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    }

    function showLoading(show) {
        if (show) loadingOverlay.classList.remove('hidden');
        else loadingOverlay.classList.add('hidden');
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorBanner.classList.remove('hidden');
    }

    function checkAndTriggerNotification(current) {
        if (browserNotificationsEnabled && Notification.permission === "granted") {
            const windKmh = current.wind.speed * 3.6;
            const cond = current.weather[0].main.toLowerCase();
            if (cond.includes('thunderstorm') || windKmh > 50 || cond.includes('rain')) {
                new Notification("MotoWeather Rider Alert!", {
                    body: `Alert for ${current.name}: ${current.weather[0].description} with wind at ${Math.round(windKmh)} km/h. Ride with caution!`
                });
            }
        }
    }
});
