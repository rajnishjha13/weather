const API_KEY = '319d0a6ace6884c10c91ec9e82551118';

function fetchWeatherByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found or API error');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Weather fetch error:', error);
            alert('Could not fetch weather data. Please try again.');
        });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Forecast fetch error:', error);
        });
}

function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = data.name;

    document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°C`;

    document.getElementById('weather-description').textContent = data.weather[0].description;

    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;

    document.getElementById('humidity').textContent = `${data.main.humidity}%`;

    document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;

    const precipitation = getPrecipitation(data);
    document.getElementById('precipitation').textContent = `${precipitation}%`;

    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function getPrecipitation(data) {
    if (data.rain && data.rain['1h']) {
        return Math.round(data.rain['1h'] * 100);
    }
    
    if (data.snow && data.snow['1h']) {
        return Math.round(data.snow['1h'] * 100);
    }
    
    if (data.clouds && data.clouds.all) {
        return data.clouds.all;
    }
    
    return 0;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    const dailyForecasts = {};
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                icons: [],
                precipitation: []
            };
        }
        
        dailyForecasts[day].temps.push(forecast.main.temp);
        dailyForecasts[day].icons.push(forecast.weather[0].icon);
        
        const precipitation = getPrecipitationFromForecast(forecast);
        dailyForecasts[day].precipitation.push(precipitation);
    });

    for (const day in dailyForecasts) {
        const avgTemp = Math.round(dailyForecasts[day].temps.reduce((a, b) => a + b, 0) / dailyForecasts[day].temps.length);
        const iconCode = dailyForecasts[day].icons[0];
        const avgPrecipitation = Math.round(
            dailyForecasts[day].precipitation.reduce((a, b) => a + b, 0) / 
            dailyForecasts[day].precipitation.length
        );

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <h4>${day}</h4>
            <img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">
            <p>${avgTemp}°C</p>
            <p>Precip: ${avgPrecipitation}%</p>
        `;
        forecastContainer.appendChild(forecastDay);
    }
}

function getPrecipitationFromForecast(forecastData) {
    if (forecastData.rain && forecastData.rain['3h']) {
        return Math.round(forecastData.rain['3h'] * 100);
    }
    
    if (forecastData.snow && forecastData.snow['3h']) {
        return Math.round(forecastData.snow['3h'] * 100);
    }
    
    if (forecastData.clouds && forecastData.clouds.all) {
        return forecastData.clouds.all;
    }
    
    return 0;
}

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('search-input').value;
    if (city) {
        fetchWeatherByCity(city);
    }
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            error => {
                console.error("Error getting location:", error);
                alert("Could not retrieve location. Please enter city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => displayForecast(data));
}

document.getElementById('location-btn').addEventListener('click', getLocation);

getLocation();
