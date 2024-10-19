document.addEventListener("DOMContentLoaded", function () {

    const apiKey = '428a0e6f13a050eb6d4501e3e317dfda';

    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
});