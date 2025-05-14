const weatherInfo = document.getElementById('weather-info');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const uvIndex = document.getElementById('uv-index');
const errorMessage = document.getElementById('error-message');
const loadingAnimation = document.getElementById('loading-animation');
const forecastContainer = document.getElementById('forecast-container');

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                resolve(`${latitude},${longitude}`);
            },
            error => {
                reject(new Error('Unable to get your location'));
            }
        );
    });
}

async function getLocationWeather() {
    try {
        loadingAnimation.style.display = 'block';
        weatherInfo.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const location = await getCurrentLocation();
        await getWeatherData(location);
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
        weatherInfo.style.display = 'none';
    } finally {
        loadingAnimation.style.display = 'none';
    }
}

async function getWeatherData(city) {
    try {
        loadingAnimation.style.display = 'block';
        weatherInfo.style.display = 'none';
        errorMessage.style.display = 'none';

        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=073438fda988495d876164227251405&q=${city}&days=3&aqi=yes`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeatherData(data);
        displayForecast(data.forecast.forecastday);
        errorMessage.style.display = 'none';
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
        weatherInfo.style.display = 'none';
    } finally {
        loadingAnimation.style.display = 'none';
    }
}

function displayWeatherData(data) {
    cityName.textContent = data.location.name;
    temperature.textContent = `${data.current.temp_c}°C`;
    weatherDescription.textContent = data.current.condition.text;
    weatherIcon.src = data.current.condition.icon;
    feelsLike.textContent = `${data.current.feelslike_c}°C`;
    humidity.textContent = `${data.current.humidity}%`;
    windSpeed.textContent = `${data.current.wind_kph} km/h`;
    uvIndex.textContent = data.current.uv;
    weatherInfo.style.display = 'block';

    // Update background based on time of day and weather
    const isDay = data.current.is_day;
    const condition = data.current.condition.text.toLowerCase();
    updateBackground(isDay, condition);
}

function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    forecastData.forEach(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${formattedDate}</div>
            <img src="${day.day.condition.icon}" alt="Weather Icon" class="forecast-icon">
            <div class="forecast-temp">${day.day.avgtemp_c}°C</div>
            <div class="forecast-description">${day.day.condition.text}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function updateBackground(isDay, condition) {
    let gradient;
    if (isDay) {
        if (condition.includes('rain') || condition.includes('drizzle')) {
            gradient = 'linear-gradient(135deg, #405C6B, #2C3E50)';
        } else if (condition.includes('cloud')) {
            gradient = 'linear-gradient(135deg, #8E9EAB, #5C6B73)';
        } else if (condition.includes('snow')) {
            gradient = 'linear-gradient(135deg, #E6DADA, #274046)';
        } else {
            gradient = 'linear-gradient(135deg, #00b4d8, #0077b6)';
        }
    } else {
        gradient = 'linear-gradient(135deg, #2C3E50, #1A1A2E)';
    }
    document.body.style.background = gradient;
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Get weather for current location on page load
getLocationWeather();

// Hide weather info initially
weatherInfo.style.display = 'none';