// ============================================================================
// WEATHER APP - FUNCTIONAL & INTERACTIVE CORE
// Written with a beginner-friendly code structure.
// Uses async/await, HTML5 Geolocation, and Chart.js.
// Every single line is explained with comments to help beginners understand.
// ============================================================================

// OpenWeatherMap API details: store the credentials and endpoints
const API_KEY = "6720730aaaf93d71ae649f1fbc8c24b7"; // Dedicated OpenWeatherMap account key
const BASE_URL = "https://api.openweathermap.org/data/2.5"; // Base address for request calls

// Select HTML input elements from the DOM
const cityInput = document.getElementById("city-input"); // The text input box where users type the city name
const searchBtn = document.getElementById("search-btn"); // The search submit button
const locationBtn = document.getElementById("location-btn"); // The 📍 GPS geolocation locator button

// Select HTML container elements from the DOM
const weatherCard = document.getElementById("weather-card"); // Wrapper card containing the weather dashboard
const errorMessage = document.getElementById("error-message"); // Notification alert box for errors
const unitToggle = document.getElementById("unit-toggle"); // Button that toggles Celsius vs Fahrenheit
const searchHistoryContainer = document.getElementById("search-history"); // Wrapper holding recent searches

// Select text/image elements in Column 1 (Main panel)
const cityName = document.getElementById("city-name"); // Holds searched city and country name text
const favoriteBtn = document.getElementById("favorite-btn"); // The star button to bookmark/unbookmark cities
const favoritesSection = document.getElementById("favorites-section"); // Favorites wrapper section
const favoritesListContainer = document.getElementById("favorites-list"); // Holds bookmarked badge elements

// Select weather statistics labels in Column 1
const temperature = document.getElementById("temperature"); // Main temperature number text
const tempUnit = document.getElementById("temp-unit"); // Temperature unit symbol (e.g. °C or °F)
const feelsLike = document.getElementById("feels-like"); // Perceived temperature number text
const weatherIcon = document.getElementById("weather-icon"); // Current condition illustration image
const weatherDescription = document.getElementById("weather-description"); // Condition descriptor (e.g. "rainy")
const humidity = document.getElementById("humidity"); // Humidity percentage value text
const windSpeed = document.getElementById("wind-speed"); // Wind speed speed meter value text
const sunriseText = document.getElementById("sunrise"); // Sunrise time text representation
const sunsetText = document.getElementById("sunset"); // Sunset time text representation
const weatherQuote = document.getElementById("weather-quote"); // Floating suggestion quote block

// Select Daylight Progress elements in Column 2
const daylightSunriseTime = document.getElementById("daylight-sunrise-time"); // Sunrise time at the start of progress bar
const daylightSunsetTime = document.getElementById("daylight-sunset-time"); // Sunset time at the end of progress bar
const daylightBar = document.getElementById("daylight-bar"); // Elapsed daylight width indicator bar
const daylightSun = document.getElementById("daylight-sun"); // Floating sun emoji icon that slides horizontal
const daylightRemaining = document.getElementById("daylight-remaining"); // Countdown text indicating remaining sunlight hours

// Select forecast widgets elements in Column 3
const hourlyContainer = document.getElementById("hourly-container"); // Holds 3-hourly forecast items
const forecastContainer = document.getElementById("forecast-container"); // Holds 5-day daily forecast cards

// Global App State variables
let currentUnit = "C"; // Keep track of current metric selection: Celsius ("C") or Fahrenheit ("F")
let currentWeather = null; // Store fetched current weather JSON object payload
let currentForecast = null; // Store fetched 5-day forecast JSON object payload
let searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || []; // Query search logs array
let favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || []; // Bookmarked favorite cities array
let tempChartInstance = null; // Chart.js reference to easily reset/clear graph state on new search queries

// ============================================================================
// WEATHER DATA FETCH SERVICES (City Name & Coordinates)
// ============================================================================

// Helper to fetch weather data by URL query parameters (DRY approach)
async function fetchWeatherData(urlParams) {
    try {
        // Hide error message before starting the API fetch
        errorMessage.classList.add("hidden");

        // 1. Fetch current weather data from OpenWeatherMap endpoint using url coordinates or city parameters
        const currentRes = await fetch(`${BASE_URL}/weather?${urlParams}&appid=${API_KEY}&units=metric`);
        
        // If the request fails (e.g., city name doesn't exist), throw an error to trigger the catch block
        if (!currentRes.ok) throw new Error("Oops, city not found!");
        
        // Wait for the response and parse the JSON payload data
        currentWeather = await currentRes.json();

        // 2. Fetch 5-day forecast data from OpenWeatherMap endpoint using the same url parameters
        const forecastRes = await fetch(`${BASE_URL}/forecast?${urlParams}&appid=${API_KEY}&units=metric`);
        
        // If the forecast request is successful, parse the JSON payload, otherwise default to null
        currentForecast = forecastRes.ok ? await forecastRes.json() : null;

        // Save the successfully queried city name to the search history array
        saveSearchToHistory(currentWeather.name);
        
        // Render all the fresh data values onto the DOM elements
        renderWeather();
    } catch (error) {
        // Call the showError helper function if an error occurred during fetch calls
        showError(error.message);
    }
}

// Trigger weather search using a typed city name string
function getWeather(city) {
    // Call the unified fetch helper, formatting query string parameters for city search
    fetchWeatherData(`q=${encodeURIComponent(city)}`);
}

// Trigger weather search using GPS coordinates
function getWeatherByCoords(lat, lon) {
    // Call the unified fetch helper, formatting query string parameters for latitude/longitude coordinate search
    fetchWeatherData(`lat=${lat}&lon=${lon}`);
}

// ============================================================================
// UI RENDERING ENGINE
// ============================================================================

// Orchestrates rendering of loaded statistics, progress bars, and line graphs
function renderWeather() {
    // Prevent rendering if the weather data object is empty or null
    if (!currentWeather) return;

    // Apply specific color theme gradient classes on body tag matching weather states
    updateDynamicBackground();

    // Set City and Country text header content
    cityName.textContent = `${currentWeather.name}, ${currentWeather.sys.country}`;
    
    // Update the star favorite bookmark button UI active color matching status
    updateFavoriteBtnUI();
    
    // Perform temperature calculations and display current values
    updateTemperatures();

    // Capitalize the first letter of description text
    const desc = currentWeather.weather[0].description; // Extract description string
    weatherDescription.textContent = desc.charAt(0).toUpperCase() + desc.slice(1); // Set uppercase representation
    
    // Build the weather icon URL using the API icon code and load it into the image tag
    weatherIcon.src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
    weatherIcon.alt = desc; // Set alt description text for screen readers

    // Set the humidity percentage text
    humidity.textContent = `${currentWeather.main.humidity}%`;
    
    // Set the wind speed text representation in meters per second
    windSpeed.textContent = `${currentWeather.wind.speed} m/s`;

    // Convert sunrise and sunset Unix timestamps into standard HH:MM AM/PM strings
    const localSunrise = formatTime(currentWeather.sys.sunrise, currentWeather.timezone);
    const localSunset = formatTime(currentWeather.sys.sunset, currentWeather.timezone);
    
    // Populate sunrise and sunset text boxes
    sunriseText.textContent = localSunrise;
    sunsetText.textContent = localSunset;

    // Calculate elapsed daylight percentage and move the sun bar progress indicator
    renderDaylightProgressBar(localSunrise, localSunset);
    
    // Load dynamic suggestion quote text matching current temperatures and conditions
    generateWeatherQuote(currentWeather.main.temp, currentWeather.weather[0].main.toLowerCase());

    // Generate chronological hourly timelines and 5-Day forecast cards
    renderHourlyTimeline();
    renderForecast();
    
    // Render the curvy temperature trend chart using Chart.js
    drawTempChart();

    // Reveal the main weather dashboard card by removing the hidden utility class
    weatherCard.classList.remove("hidden");
}

// ============================================================================
// LOGICAL HELPER FUNCTIONS (Animations, Calculations, and Timezones)
// ============================================================================

// Converts Celsius value to the selected Unit dynamically (DRY approach)
function convertTemp(tempC) {
    // If the unit is Celsius, return the rounded value
    if (currentUnit === "C") return Math.round(tempC);
    // Otherwise, convert it to Fahrenheit using the standard conversion formula and return rounded value
    return Math.round((tempC * 9) / 5 + 32); 
}

// Updates current temperatures shown on page
function updateTemperatures() {
    // Prevent execution if current weather object is empty
    if (!currentWeather) return;
    
    // Load converted current temperature and perceived feels like temperature values
    temperature.textContent = convertTemp(currentWeather.main.temp);
    feelsLike.textContent = convertTemp(currentWeather.main.feels_like);
    
    // Set text symbol indicators (e.g. °C or °F)
    tempUnit.textContent = `°${currentUnit}`;
    
    // Select all perceived unit labels on page and update their text value
    document.querySelectorAll(".feels-like-unit").forEach(el => el.textContent = `°${currentUnit}`);
    
    // Update the unit toggle button label text to display the next toggle option
    unitToggle.textContent = currentUnit === "C" ? "°F" : "°C";
}

// Set themed background classes dynamically based on weather main keyword
function updateDynamicBackground() {
    // Clear all existing active background theme classes from the body tag
    document.body.className = "";
    
    // Extract the weather condition keyword string in lowercase
    const condition = currentWeather.weather[0].main.toLowerCase();

    // Add classes corresponding to matching weather categories
    if (condition.includes("clear")) {
        document.body.classList.add("weather-clear"); // Set sunny orange/yellow theme
    } else if (condition.includes("cloud")) {
        document.body.classList.add("weather-clouds"); // Set cloudy gray/dark theme
    } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
        document.body.classList.add("weather-rain"); // Set rainy dark blue theme
    } else if (condition.includes("snow")) {
        document.body.classList.add("weather-snow"); // Set snowy light blue theme
    }
}

// Calculate daylight progress bar elapsed percentage & hours left
function renderDaylightProgressBar(sunriseStr, sunsetStr) {
    const now = Math.floor(Date.now() / 1000); // Get current timestamp in Unix seconds
    const sunrise = currentWeather.sys.sunrise; // Extract sunrise Unix timestamp
    const sunset = currentWeather.sys.sunset; // Extract sunset Unix timestamp

    // Set sunrise and sunset labels at both sides of progress bar
    daylightSunriseTime.textContent = sunriseStr;
    daylightSunsetTime.textContent = sunsetStr;

    if (now <= sunrise) {
        // If current time is before sunrise, set progress bar and sun position to 0%
        daylightBar.style.width = "0%";
        daylightSun.style.left = "0%";
        daylightRemaining.textContent = "Before Sunrise 🌅";
    } else if (now >= sunset) {
        // If current time is after sunset, set progress bar and sun position to 100%
        daylightBar.style.width = "100%";
        daylightSun.style.left = "100%";
        daylightRemaining.textContent = "Sun has set 🌙";
    } else {
        // Sun is up! Calculate elapsed percentage using (now - sunrise) / (sunset - sunrise)
        const progress = ((now - sunrise) / (sunset - sunrise)) * 100;
        
        // Apply percentage to progress bar width and horizontal sun position style properties
        daylightBar.style.width = `${progress}%`;
        daylightSun.style.left = `${progress}%`;

        // Calculate hours and minutes remaining until sunset
        const secondsLeft = sunset - now; // Total seconds until sunset
        const hoursLeft = Math.floor(secondsLeft / 3600); // Convert seconds to whole hours
        const minsLeft = Math.floor((secondsLeft % 3600) / 60); // Get remaining minutes
        
        // Update countdown text label contents on dashboard
        daylightRemaining.textContent = `${hoursLeft}h ${minsLeft}m of daylight remaining ☀️`;
    }
}

// Converts Unix timestamps (seconds) + offsets into HH:MM AM/PM strings
function formatTime(unixSecs, offsetSecs) {
    // Create Date object by adding local offset timezone seconds to Unix seconds and converting to milliseconds
    const date = new Date((unixSecs + offsetSecs) * 1000);
    
    // Extract hours in UTC coordinate standard
    let hours = date.getUTCHours();
    
    // Extract minutes in UTC coordinate standard, padding with a leading zero if single digit
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    
    // Determine AM/PM marker based on hour value
    const ampm = hours >= 12 ? "PM" : "AM";
    
    // Convert 24h format to 12h format
    hours = hours % 12 || 12; // Midnight (0) becomes 12
    
    // Return formatted time representation string
    return `${hours}:${minutes} ${ampm}`;
}

// Contextual text suggestions matching loaded weather conditions
function generateWeatherQuote(tempC, weatherMain) {
    let quote = "Enjoy your day! 🌈"; // Default quote
    
    // Select specific text advice strings matching current temperature and condition categories
    if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
        quote = "Carry an umbrella today! 🌂";
    } else if (weatherMain.includes("snow")) {
        quote = "It's snowing! Bundle up warm ❄️";
    } else if (tempC > 30) {
        quote = "Stay hydrated! It's hot outside 💧";
    } else if (tempC < 10) {
        quote = "Bundle up, it is chilly today! 🧥";
    } else if (weatherMain.includes("clear")) {
        quote = "Perfect weather for a walk outdoors! 🌻";
    } else if (weatherMain.includes("cloud")) {
        quote = "A bit cloudy today, a good day for reading ☁️";
    }
    
    // Insert quote text in HTML block quotes
    weatherQuote.textContent = `"${quote}"`;
}

// ============================================================================
// TIMELINE & GRAPH GENERATION
// ============================================================================

// Populate horizontal list containing 5 hourly updates (15 hours total)
function renderHourlyTimeline() {
    // Clear previous items from the container
    hourlyContainer.innerHTML = "";
    
    // Exit if forecast data fails to load
    if (!currentForecast) return;

    // Slice the first 5 weather entries (3-hour intervals representing the next 15 hours)
    currentForecast.list.slice(0, 5).forEach(item => {
        // Format local hour label using city's timezone offset
        const localTime = formatTime(item.dt, currentForecast.city.timezone);
        
        // Build item card div container element
        const hourlyItem = document.createElement("div");
        hourlyItem.className = "hourly-item";
        
        // Populate hourly metrics structure inside item container
        hourlyItem.innerHTML = `
            <div class="hourly-time">${localTime.split(" ")[0]} ${localTime.split(" ")[1]}</div>
            <img class="hourly-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
            <div class="hourly-temp">${convertTemp(item.main.temp)}°${currentUnit}</div>
        `;
        
        // Insert card container to parent list
        hourlyContainer.appendChild(hourlyItem);
    });
}

// Filter 5 forecast points at 12:00 PM (noon) to render 5-Day forecast cards
function renderForecast() {
    // Clear previous items from the container
    forecastContainer.innerHTML = "";
    
    // Exit if forecast data fails to load
    if (!currentForecast) return;

    // Filter forecast list to pick only entries recorded at 12:00 PM standard noon local time daily
    currentForecast.list.filter(item => item.dt_txt.includes("12:00:00")).forEach(day => {
        // Convert timestamp to Date object and extract abbreviated name of the weekday (e.g. "Mon")
        const dayName = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
        
        // Create daily card wrapper element
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        
        // Populate daily card elements structure
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <div class="forecast-temp">${convertTemp(day.main.temp)}°${currentUnit}</div>
        `;
        
        // Append card element to forecast card container parent list
        forecastContainer.appendChild(forecastCard);
    });
}

// Create or update Chart.js line graph canvas data
function drawTempChart() {
    // Exit if forecast data is missing
    if (!currentForecast) return;
    
    // Get 2D rendering canvas context from canvas tag
    const ctx = document.getElementById("temp-chart").getContext("2d");
    
    // Destroy previous Chart instance if active to clear canvas and prevent overlap issues on hover
    if (tempChartInstance) tempChartInstance.destroy();

    // Slice first 8 timeline elements representing temperature values for next 24 hours
    const next24HoursData = currentForecast.list.slice(0, 8);
    
    // Extract formatted time string labels (e.g. "3 PM", "6 PM")
    const labels = next24HoursData.map(item => formatTime(item.dt, currentForecast.city.timezone).replace(":00", ""));
    
    // Convert temperature data values matching current selected unit
    const temps = next24HoursData.map(item => convertTemp(item.main.temp));

    // Instantiate fresh line chart configuration using Chart.js options
    tempChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels, // Set hours labels on x-axis
            datasets: [{
                data: temps, // Set temperatures data on y-axis
                borderColor: "#ff4a68", // Line border color (crimson red)
                backgroundColor: "rgba(255, 74, 104, 0.15)", // Shaded canvas color fill
                borderWidth: 2, // Line thickness
                fill: true, // Enable filling space below line
                tension: 0.4, // Curvy line interpolation factor
                pointRadius: 3, // Point dot size
                pointBackgroundColor: "#ff4a68" // Point dot color
            }]
        },
        options: {
            responsive: true, // Automatically stretch chart on page resizing
            maintainAspectRatio: false, // Allow custom height constraints
            plugins: { legend: { display: false } }, // Hide legend to save spacing
            scales: {
                x: { 
                    grid: { display: false }, // Hide vertical grid lines
                    ticks: { color: "rgba(255, 255, 255, 0.7)", font: { family: "Outfit", size: 9 } } 
                },
                y: { 
                    grid: { color: "rgba(255, 255, 255, 0.1)" }, // Light horizontal grid lines
                    ticks: { color: "rgba(255, 255, 255, 0.7)", font: { family: "Outfit", size: 9 } } 
                }
            }
        }
    });
}

// ============================================================================
// FAVORITES & STORAGE CONTROLLER
// ============================================================================

// Reusable helper to render lists of badges (history & favorites) (DRY approach)
function renderBadgeList(container, list, isFavorite) {
    // Clear existing badge elements in container
    container.innerHTML = "";
    
    // Loop through list values and construct span badges
    list.forEach(city => {
        const badge = document.createElement("span");
        
        // Add class styling based on badge type
        badge.className = isFavorite ? "favorite-badge" : "history-badge";
        
        // Append star icon to favorite badges
        badge.textContent = isFavorite ? `★ ${city}` : city;
        
        // Bind click event listener to search city weather immediately when clicked
        badge.onclick = () => {
            cityInput.value = city; // Set input value text
            getWeather(city); // Run search weather API request
        };
        
        // Append badge element to parent container
        container.appendChild(badge);
    });
}

// Render recent searches history list badges
function renderSearchHistory() {
    renderBadgeList(searchHistoryContainer, searchHistory, false);
}

// Render bookmarked favorite cities list badges
function renderFavorites() {
    // Hide favorites section wrapper if list is empty
    if (favorites.length === 0) {
        favoritesSection.classList.add("hidden");
        return;
    }
    
    // Reveal favorites section wrapper
    favoritesSection.classList.remove("hidden");
    
    // Generate favorite badge elements
    renderBadgeList(favoritesListContainer, favorites, true);
}

// Add or remove target city from bookmarks favorites array list
function toggleFavorite() {
    // Exit if current weather object is empty
    if (!currentWeather) return;
    
    const city = currentWeather.name; // Extract current city name
    
    // If city is already bookmarked, remove it, otherwise add it to array list
    favorites = favorites.includes(city) ? favorites.filter(c => c !== city) : [...favorites, city];
    
    // Save updated favorites array serialized as JSON string inside LocalStorage
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
    
    // Reset star buttons icons active styling state
    updateFavoriteBtnUI();
    
    // Redraw updated favorites badges
    renderFavorites();
}

// Updates star icon styles matching favorited arrays
function updateFavoriteBtnUI() {
    // Exit if weather data is empty
    if (!currentWeather) return;
    
    // Check if current city name is stored inside favorites array
    const isFav = favorites.includes(currentWeather.name);
    
    // Set star character icon: solid star (★) or hollow outline star (☆)
    favoriteBtn.textContent = isFav ? "★" : "☆";
    
    // Apply active class style rules if city is bookmarked
    favoriteBtn.className = isFav ? "favorite-btn active" : "favorite-btn";
}

// Add search query to history list, retaining max of 3 items
function saveSearchToHistory(city) {
    // Append city to start of array, removing any previous duplicate entries
    searchHistory = [city, ...searchHistory.filter(c => c !== city)].slice(0, 3);
    
    // Save updated history logs serialized as JSON inside LocalStorage
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    
    // Redraw updated history badges on screen
    renderSearchHistory();
}

// Displays UI warnings if errors occur
function showError(message) {
    // Hide weather dashboard container card
    weatherCard.classList.add("hidden");
    
    // Set warning message contents (clean output if city was not found)
    errorMessage.textContent = message.includes("404") ? "Oops, city not found! Please check spelling." : message;
    
    // Reveal error notification box element
    errorMessage.classList.remove("hidden");
}

// ============================================================================
// GEOLOCATION SERVICES
// ============================================================================

// GPS coordinates fetching chain
function getCurrentLocationWeather() {
    // Check if Geolocation browser API is supported
    if (navigator.geolocation) {
        // Request current coordinates from browser GPS
        navigator.geolocation.getCurrentPosition(
            (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude), // Call weather on success
            () => getIPLocation() // Fallback to IP address geolocation estimation if GPS is blocked
        );
    } else {
        // Fallback to IP address geolocation estimation if unsupported
        getIPLocation(); 
    }
}

// IP Geolocation fetch endpoint fallback
async function getIPLocation() {
    try {
        // Request location info relative to client IP address
        const res = await fetch("https://ipapi.co/json/");
        
        // Parse JSON coordinates data if fetch succeeds, otherwise set empty object
        const info = res.ok ? await res.json() : {};
        
        if (info.latitude && info.longitude) {
            // Trigger weather search by coordinates
            getWeatherByCoords(info.latitude, info.longitude);
        } else {
            // Throw error if coordinates are missing
            throw new Error();
        }
    } catch {
        // Absolute fallback city (Bahir Dar) if both GPS and IP geolocation fail
        getWeather("Bahir Dar"); 
    }
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================

// Bind click event trigger to the Search button
searchBtn.onclick = () => {
    const city = cityInput.value.trim(); // Get trimmed input text value
    if (city) getWeather(city); // Run weather search if text is not empty
};

// Bind Keyup event trigger to search when pressing "Enter" key inside input text field
cityInput.onkeyup = (e) => {
    const city = cityInput.value.trim();
    if (e.key === "Enter" && city) getWeather(city);
};

// Bind click event trigger to GPS Location button
locationBtn.onclick = getCurrentLocationWeather;

// Bind click event trigger to Favorites star button
favoriteBtn.onclick = toggleFavorite;

// Bind click event trigger to metric toggle button to switch C/F units
unitToggle.onclick = () => {
    // Switch unit value
    currentUnit = currentUnit === "C" ? "F" : "C";
    
    // Update temperatures, forecast lists, and chart scales
    updateTemperatures();
    renderForecast();
    renderHourlyTimeline();
    drawTempChart();
};

// Initial launch execution when page loading completes
window.onload = () => {
    renderSearchHistory(); // Render search history logs badges
    renderFavorites(); // Render bookmarked favorite badges
    getCurrentLocationWeather(); // Auto-detect user coordinates weather
};
