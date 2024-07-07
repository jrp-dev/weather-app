"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = 'c633f594c94b53e71410ee47f5e7041a';
/**
 * Retrieves weather data based on the provided location.
 *
 * @param {string} location - The location for which weather data is requested
 * @return {Promise} The weather data corresponding to the location or null if not found
 */
const getWeather = (location) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(BASE_URL);
    url.searchParams.set('q', location);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('appid', API_KEY);
    const response = yield fetch(url);
    const data = yield response.json();
    return data;
});
/**
 * Sets the text content of the error helper paragraph element.
 * @param {string} text - The text to be set as the content of the paragraph.
 */
const setError = (text) => {
    const errorHelper = document.getElementById('error-helper');
    errorHelper.innerHTML = text;
};
/**
 * Sets the value of an HTML element by its ID.
 *
 * @param {string} id - The ID of the HTML element to set the value for.
 * @param {string} value - The value to set for the HTML element.
 */
const setValue = (id, value) => {
    const element = document.getElementById(id);
    element.innerHTML = value;
};
/**
 * Creates and appends sub-info elements to the sub-info-container based on the provided subinfo array.
 *
 * @param {ISubInfo[]} subinfo - An array of SubInfo objects containing name and value properties.

 */
const createSubInfo = (items) => {
    const subInfoContainer = document.getElementById('sub-info-container');
    subInfoContainer.innerHTML = '';
    items.forEach((item) => {
        const subInfo = document.createElement('div');
        subInfo.classList.add('sub-info');
        subInfo.innerHTML = `
      <span class="material-symbols-outlined">
        ${item.icon}
      </span>
      <div class="sub-info-value-container">
        <p class="sub-info-value">${item.value}</p>
      </div>
      <p class="sub-info-label">${item.label}</p>
    `;
        subInfoContainer.appendChild(subInfo);
    });
};
/**
 * Converts a given timestamp and timezone offset into a formatted date and time string, and returns the date object.
 *
 * @param {IDateParam} param - An object containing the timestamp (dt) and timezone offset (timezone).
 * @returns {{formattedDateTime: string; date: Date}} - An object containing the formatted date and time string (formattedDateTime) and the date object (date).
 */
const getDateTime = ({ dt, timezone }) => {
    const date = new Date(dt * 1000); // Convert seconds to milliseconds
    // Adjust the date for the timezone offset
    date.setMinutes(date.getMinutes() + timezone / 60);
    const options = {
        // weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC', // Ensure consistent formatting regardless of user's locale
    };
    const formattedDateTime = new Intl.DateTimeFormat([], options).format(date);
    return {
        formattedDateTime,
        date,
    };
};
/**
 * Sets the day information on the page, including the location name, date and time zone.
 *
 * @param {Object} param - An object containing the location name, timestamp and timezone offset.
 * @param {string} param.locationName - The name of the location.
 * @param {number} param.dt - The timestamp in seconds.
 * @param {number} param.timezone - The timezone offset in seconds.
 */
const setDayInfo = ({ locationName, dt, timezone, }) => {
    const { formattedDateTime, date } = getDateTime({ dt, timezone });
    const bodyElement = document.querySelector('body');
    const hours = date.getUTCHours();
    let partOfDay;
    let partOfDayIcon;
    /** Set the class for background */
    if (hours >= 5 && hours < 8) {
        partOfDay = 'dawn';
        partOfDayIcon = 'wb_twilight';
    }
    else if (hours >= 8 && hours < 12) {
        partOfDay = 'morning';
        partOfDayIcon = 'wb_sunny';
    }
    else if (hours >= 12 && hours < 17) {
        partOfDay = 'afternoon';
        partOfDayIcon = 'wb_sunny';
    }
    else if (hours >= 17 && hours < 19) {
        partOfDay = 'dusk';
        partOfDayIcon = 'sunny_snowing';
    }
    else {
        partOfDay = 'evening';
        partOfDayIcon = 'nights_stay';
    }
    bodyElement.className = partOfDay;
    setValue('location-title', locationName);
    setValue('date', formattedDateTime);
    setValue('part-of-day', partOfDay);
    setValue('part-of-day-icon', partOfDayIcon);
};
/**
 * Creates the main weather information on the page by adding the temperature, description, and icon to the DOM.
 *
 * @param {IMainInfo} info - An object containing the temperature, description, and icon name of the weather.
 */
const setMainInfo = ({ temperature, description, icon, min, max }) => {
    const cardContainer = document.querySelector('.card-container');
    cardContainer.classList.add('weather-active');
    setValue('temperature', `${Math.round(temperature)}`);
    setValue('weather-description', description);
    setValue('weather-icon', icon);
    setValue('temp-min', `${Math.round(min)}`);
    setValue('temp-max', `${Math.round(max)}`);
    const iconElement = document.getElementById('weather-icon');
    iconElement.src = `assets/icons/${icon}@2x.png`;
};
/**
 * Fetches weather information for a specific location and updates the weather display on the page.
 *
 * @param {string} location - The location for which weather information is fetched.
 */
const setWeatherInfo = (location) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    if (location === '') {
        setError('Please enter a location.');
        return;
    }
    try {
        const weather = yield getWeather(location);
        if ((weather === null || weather === void 0 ? void 0 : weather.cod) === 200) {
            sessionStorage.setItem('location-query', location);
            setError('');
            /** Add Main Info */
            const temperature = (_b = weather === null || weather === void 0 ? void 0 : weather.main) === null || _b === void 0 ? void 0 : _b.temp;
            const tempMin = (_c = weather === null || weather === void 0 ? void 0 : weather.main) === null || _c === void 0 ? void 0 : _c.temp_min;
            const tempMax = (_d = weather === null || weather === void 0 ? void 0 : weather.main) === null || _d === void 0 ? void 0 : _d.temp_max;
            const icon = (_e = weather === null || weather === void 0 ? void 0 : weather.weather) === null || _e === void 0 ? void 0 : _e[0].icon;
            const locationName = weather === null || weather === void 0 ? void 0 : weather.name;
            const description = (_f = weather === null || weather === void 0 ? void 0 : weather.weather) === null || _f === void 0 ? void 0 : _f[0].description;
            const humidity = {
                label: 'Humidity',
                value: ((_g = weather === null || weather === void 0 ? void 0 : weather.main) === null || _g === void 0 ? void 0 : _g.humidity) + '%',
                icon: 'water_drop'
            };
            const windSpeed = {
                label: 'Wind Speed',
                value: ((_h = weather === null || weather === void 0 ? void 0 : weather.wind) === null || _h === void 0 ? void 0 : _h.speed) + ' km/h',
                icon: 'air'
            };
            const visibility = {
                label: 'Visibility',
                value: Number(weather === null || weather === void 0 ? void 0 : weather.visibility) / 1000 + ' km',
                icon: 'foggy'
            };
            const pressure = {
                label: 'pressure',
                value: Number((_j = weather === null || weather === void 0 ? void 0 : weather.main) === null || _j === void 0 ? void 0 : _j.pressure) / 1000 + ' pa',
                icon: 'heat'
            };
            const subInfo = [humidity, windSpeed, visibility, pressure];
            /** Add Header Info */
            if (weather.dt, weather === null || weather === void 0 ? void 0 : weather.timezone) {
                setDayInfo({
                    locationName,
                    dt: weather === null || weather === void 0 ? void 0 : weather.dt,
                    timezone: weather === null || weather === void 0 ? void 0 : weather.timezone,
                });
            }
            /** Add Main Info */
            setMainInfo({
                temperature,
                description,
                icon,
                min: tempMin,
                max: tempMax
            });
            /** Add Sub Info */
            createSubInfo(subInfo);
        }
        else {
            setError('Location not found.');
        }
    }
    catch (error) {
        console.error(error);
        setError('Location not found.');
    }
});
/**
 * Handles the location submission and sets up values in the UI.
 *
 * @param {Event} event - The form submission event.
 */
const handleSubmit = (event) => {
    event.preventDefault();
    var formData = new FormData(document.getElementById('location-form'));
    const location = formData.get('location');
    setWeatherInfo(location);
};
// Add event listener to the form for submit event
const form = document.querySelector('#location-form');
form.addEventListener('submit', handleSubmit);
// Focus on input element on load
(_a = document.getElementById("location-input")) === null || _a === void 0 ? void 0 : _a.focus();
// Get the previous location query
const currentLocation = sessionStorage.getItem('location-query');
setWeatherInfo(currentLocation || 'Bacoor');
