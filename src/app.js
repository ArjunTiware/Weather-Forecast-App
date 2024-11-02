const API_KEY = '428a0e6f13a050eb6d4501e3e317dfda';
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const recentCitiesDropdown = document.querySelector(".recent-cities-dropdown");

const MAX_RECENT_CITIES = 5; // Limit to store the last 5 searched cities

// Input validation function
const isValidCityName = (cityName) => {
    const regex = /^[a-zA-Z\s-]+$/; // Allows only letters, spaces, and hyphens
    return regex.test(cityName) && cityName.trim() !== "";
}

const saveToRecentCities = (cityName) => {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!recentCities.includes(cityName)) {
        if (recentCities.length >= MAX_RECENT_CITIES) {
            recentCities.shift(); // Remove oldest city if limit is reached
        }
        recentCities.push(cityName);
        localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }
    renderRecentCitiesDropdown();
}

const renderRecentCitiesDropdown = () => {
    const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCitiesDropdown.innerHTML = ""; // Clear previous dropdown options
    if (recentCities.length > 0) {
        recentCitiesDropdown.style.display = "block"; // Show dropdown only if there are cities
        recentCities.forEach(city => {
            const cityOption = document.createElement("li");
            cityOption.textContent = city;
            cityOption.classList.add("dropdown-item");
            cityOption.addEventListener("click", () => {
                cityInput.value = city;
                getCityCoordinates();
            });
            recentCitiesDropdown.appendChild(cityOption);
        });
    } else {
        recentCitiesDropdown.style.display = "none"; // Hide dropdown if no cities
    }
}

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C  <i class="fa-solid fa-temperature-half"></i></h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S  <i class="fa-sharp fa-solid fa-wind"></i></h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon text-center">
                    <img class="max-w-[120px] mt-[-15px]" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6 class="capitalize -mt-2.5">${weatherItem.weather[0].description}</h6>
                </div>`;
    } else {
        return `<li class="card max-w-[70px] mt-[5px] -mb-3 mx-0">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C  <i class="fa-solid fa-temperature-half"></i></h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S  <i class="fa-sharp fa-solid fa-wind"></i></h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6 class="capitalize -mt-2.5">${weatherItem.weather[0].description}</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();

    if (!isValidCityName(cityName)) {
        alert("Please enter a valid city name.");
        return;
    }

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) {
            alert(`No coordinates found for ${cityName}`);
            return;
        }
        const { lat, lon, name } = data[0];
        saveToRecentCities(name); // Save to recent cities
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                saveToRecentCities(name);
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

// Load recent cities on page load
document.addEventListener("DOMContentLoaded", renderRecentCitiesDropdown);

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
