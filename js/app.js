// Requirements ES6+: const, arrow functions, template literals
const API_KEY = 'd75edd65d709e8f95f4ba078496dc01d'; // Ganti dengan API Key OpenWeatherMap Anda
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const forecastContainer = document.getElementById('forecast-container');
const forecastList = document.getElementById('forecast-list');

// Data UI Elements
const cityNameEl = document.getElementById('city-name');
const weatherDateEl = document.getElementById('weather-date');
const weatherIconEl = document.getElementById('weather-icon');
const weatherTempEl = document.getElementById('weather-temp');
const weatherDescEl = document.getElementById('weather-desc');
const weatherHumidityEl = document.getElementById('weather-humidity');
const weatherWindEl = document.getElementById('weather-wind');

// History & Unit Elements
const searchHistoryContainer = document.getElementById('search-history-container');
const searchHistoryList = document.getElementById('search-history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const unitCBtn = document.getElementById('unit-c');
const unitFBtn = document.getElementById('unit-f');

// App States
let currentUnit = 'metric'; // 'metric' (°C) or 'imperial' (°F)
let currentCity = '';
let searchHistory = JSON.parse(localStorage.getItem('weather_search_history')) || [];

// Format Date Helper
const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date * 1000).toLocaleDateString('id-ID', options);
};

// Requirement 2: async/await + Fetch API untuk Cuaca Saat Ini
const fetchCurrentWeather = async (city) => {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=id`;
    const response = await fetch(url);
    
    // Requirement 4: Error Handling 404
    if (response.status === 404) {
        throw new Error(`Kota "${city}" tidak ditemukan. Silakan periksa kembali nama kota.`);
    }
    
    if (!response.ok) {
        throw new Error('Gagal mengambil data cuaca dari server.');
    }

    return await response.json();
};

// Bonus: Fetch Forecast 5 Hari
const fetchForecast = async (city) => {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=id`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
};

// Main Function Get Weather Data
const getWeatherData = async (city) => {
    // Show Loading, Hide Cards & Error
    loadingState.classList.remove('d-none');
    errorState.classList.add('d-none');
    weatherCard.classList.add('d-none');
    forecastContainer.classList.add('d-none');

    try {
        const data = await fetchCurrentWeather(city);
        const forecastData = await fetchForecast(city);
        
        displayCurrentWeather(data);
        if (forecastData) displayForecast(forecastData);

        currentCity = city;
        saveToHistory(city);
    } catch (error) {
        // Requirement 5: Error Handling (Network Error / 404)
        errorMessage.textContent = error.message || 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.';
        errorState.classList.remove('d-none');
    } finally {
        loadingState.classList.add('d-none');
    }
};

// Display Current Weather
const displayCurrentWeather = (data) => {
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    weatherDateEl.textContent = formatDate(data.dt);
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.alt = data.weather[0].description;
    weatherTempEl.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
    weatherDescEl.textContent = data.weather[0].description;
    weatherHumidityEl.textContent = `${data.main.humidity}%`;
    weatherWindEl.textContent = `${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;

    weatherCard.classList.remove('d-none');
};

// Display Forecast using Requirement 7: Minimal 1 Array Method (filter & map)
const displayForecast = (forecastData) => {
    forecastList.innerHTML = '';

    // Requirement 7: Filter data untuk mengambil 1 jam per hari (jam 12:00)
    const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'));

    // Requirement 7: Map array data forecast menjadi HTML elements
    const forecastHTML = dailyForecasts.map(item => {
        const dateObj = new Date(item.dt * 1000);
        const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const temp = Math.round(item.main.temp);
        const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

        return `
            <div class="col">
                <div class="forecast-card shadow-sm h-100">
                    <span class="d-block fw-bold text-info">${dayName}</span>
                    <span class="d-block small text-light mb-1">${dateStr}</span>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}" width="40">
                    <span class="d-block fw-bold mt-1">${temp}${unitSymbol}</span>
                    <span class="d-block small text-capitalize text-warning" style="font-size: 0.75rem;">${item.weather[0].main}</span>
                </div>
            </div>
        `;
    }).join('');

    forecastList.innerHTML = forecastHTML;
    forecastContainer.classList.remove('d-none');
};

// Bonus Point: LocalStorage Search History
const saveToHistory = (city) => {
    const formattedCity = city.trim();
    if (!formattedCity) return;

    // Filter duplikat (Requirement 7: filter)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== formattedCity.toLowerCase());
    searchHistory.unshift(formattedCity);

    // Limasi maksimal 5 riwayat
    if (searchHistory.length > 5) searchHistory.pop();

    localStorage.setItem('weather_search_history', JSON.stringify(searchHistory));
    renderHistory();
};

const renderHistory = () => {
    if (searchHistory.length === 0) {
        searchHistoryContainer.classList.add('d-none');
        return;
    }

    // Requirement 7: Array Method Map
    searchHistoryList.innerHTML = searchHistory.map(city => 
        `<button class="btn btn-outline-secondary text-white btn-history" onclick="getWeatherData('${city}')">${city}</button>`
    ).join('');

    searchHistoryContainer.classList.remove('d-none');
};

// Event Listeners
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    }
});

clearHistoryBtn.addEventListener('click', () => {
    searchHistory = [];
    localStorage.removeItem('weather_search_history');
    renderHistory();
});

// Bonus Point: Unit Toggle (°C / °F)
unitCBtn.addEventListener('click', () => {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        unitCBtn.classList.add('active');
        unitFBtn.classList.remove('active');
        if (currentCity) getWeatherData(currentCity);
    }
});

unitFBtn.addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        unitFBtn.classList.add('active');
        unitCBtn.classList.remove('active');
        if (currentCity) getWeatherData(currentCity);
    }
});

// Initial Setup
renderHistory();
getWeatherData('Medan'); // Default city
