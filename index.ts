const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = 'c633f594c94b53e71410ee47f5e7041a'

interface IMainInfo {
  icon: string;
  description: string;
  temperature: number;
  min: number;
  max: number;
}

interface ISubInfo {
  label: string;
  value: string;
  icon: string;
}

interface IDateParam {
  dt: number; 
  timezone: number;
}

type PartOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'dusk';

/**
 * Retrieves weather data based on the provided location.
 *
 * @param {string} location - The location for which weather data is requested
 * @return {Promise} The weather data corresponding to the location or null if not found
 */
const getWeather = async (location: string): Promise<any> => {
  
  const url = new URL(BASE_URL);
  url.searchParams.set('q', location);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('appid', API_KEY);
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * Sets the text content of the error helper paragraph element.
 * @param {string} text - The text to be set as the content of the paragraph.
 */
const setError = (text: string) => {
  const errorHelper = document.getElementById('error-helper') as HTMLParagraphElement;
  errorHelper.innerHTML = text;
}

/**
 * Sets the value of an HTML element by its ID.
 *
 * @param {string} id - The ID of the HTML element to set the value for.
 * @param {string} value - The value to set for the HTML element.
 */
const setValue = (id: string, value: string) => {
  const element = document.getElementById(id) as HTMLElement;
  element.innerHTML = value;
}

/**
 * Creates and appends sub-info elements to the sub-info-container based on the provided subinfo array.
 *
 * @param {ISubInfo[]} subinfo - An array of SubInfo objects containing name and value properties.

 */
const createSubInfo = (items: ISubInfo[]) => {
  const subInfoContainer = document.getElementById('sub-info-container') as HTMLDivElement
  subInfoContainer.innerHTML = ''
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
    `
    subInfoContainer.appendChild(subInfo);
  })
}

/**
 * Converts a given timestamp and timezone offset into a formatted date and time string, and returns the date object.
 *
 * @param {IDateParam} param - An object containing the timestamp (dt) and timezone offset (timezone).
 * @returns {{formattedDateTime: string; date: Date}} - An object containing the formatted date and time string (formattedDateTime) and the date object (date).
 */
const getDateTime = ({dt, timezone}: IDateParam) : {formattedDateTime: string; date: Date} => {
  
  const date = new Date(dt * 1000); // Convert seconds to milliseconds

  // Adjust the date for the timezone offset
  date.setMinutes(date.getMinutes() + timezone / 60);

  const options: Intl.DateTimeFormatOptions = {
    // weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use 12-hour format
    timeZone: 'UTC',  // Ensure consistent formatting regardless of user's locale
  };

  const formattedDateTime = new Intl.DateTimeFormat([], options).format(date);

  return {
    formattedDateTime,
    date,
  };
}

/**
 * Sets the day information on the page, including the location name, date and time zone.
 *
 * @param {Object} param - An object containing the location name, timestamp and timezone offset.
 * @param {string} param.locationName - The name of the location.
 * @param {number} param.dt - The timestamp in seconds.
 * @param {number} param.timezone - The timezone offset in seconds.
 */
const setDayInfo = ({ 
  locationName,
  dt,
  timezone,
} : {locationName: string; dt: number; timezone: number;}) => {

  const { formattedDateTime, date } = getDateTime({dt, timezone});
  const bodyElement = document.querySelector('body') as HTMLBodyElement;
  const hours = date.getUTCHours();
  
  let partOfDay: PartOfDay;
  let partOfDayIcon: string;
  
  /** Set the class for background */
  if (hours >= 5 && hours < 8) {
    partOfDay = 'dawn';
    partOfDayIcon = 'wb_twilight';
  } else if (hours >= 8 && hours < 12) {
    partOfDay = 'morning';
    partOfDayIcon = 'wb_sunny';
  } else if (hours >= 12 && hours < 17) {
    partOfDay = 'afternoon';
    partOfDayIcon = 'wb_sunny';
  } else if (hours >= 17 && hours < 19) {
    partOfDay = 'dusk';
    partOfDayIcon = 'sunny_snowing';
  } else {
    partOfDay = 'evening';
    partOfDayIcon = 'nights_stay';
  }

  bodyElement.className = partOfDay;

  setValue('location-title', locationName);
  setValue('date', formattedDateTime);
  setValue('part-of-day', partOfDay);
  setValue('part-of-day-icon', partOfDayIcon);
}

/**
 * Creates the main weather information on the page by adding the temperature, description, and icon to the DOM.
 *
 * @param {IMainInfo} info - An object containing the temperature, description, and icon name of the weather.
 */
const setMainInfo = ({
  temperature,
  description,
  icon,
  min,
  max
}: IMainInfo) => {
  
  const cardContainer = document.querySelector('.card-container') as HTMLDivElement;
  cardContainer.classList.add('weather-active');
  setValue('temperature', `${Math.round(temperature)}`)
  setValue('weather-description', description)
  setValue('weather-icon', icon)
  setValue('temp-min', `${Math.round(min)}`)
  setValue('temp-max', `${Math.round(max)}`)

  const iconElement = document.getElementById('weather-icon') as HTMLImageElement
  iconElement.src = `assets/icons/${icon}@2x.png`
}

/**
 * Fetches weather information for a specific location and updates the weather display on the page.
 *
 * @param {string} location - The location for which weather information is fetched.
 */
const setWeatherInfo = async (location: string) => {
  if (location === '') {
    setError('Please enter a location.');
    return;
  }

  try {
    const weather = await getWeather(location as string)

    if (weather?.cod === 200) {
      sessionStorage.setItem('location-query', location as string);
      setError('');

      /** Add Main Info */
      const temperature: number = weather?.main?.temp;
      const tempMin = weather?.main?.temp_min;
      const tempMax = weather?.main?.temp_max;
      const icon: string = weather?.weather?.[0].icon;
      const locationName: string = weather?.name;
      const description: string = weather?.weather?.[0].description;
      const humidity = {
        label: 'Humidity',
        value: weather?.main?.humidity + '%',
        icon: 'water_drop'
      }
      const windSpeed = {
        label: 'Wind Speed',
        value: weather?.wind?.speed + ' km/h',
        icon: 'air'
      };
      const visibility = {
        label: 'Visibility',
        value: Number(weather?.visibility) / 1000 + ' km',
        icon: 'foggy'
      };
      const pressure = {
        label: 'pressure',
        value: Number(weather?.main?.pressure) / 1000 + ' pa',
        icon: 'heat'
      };
      
      const subInfo = [humidity, windSpeed, visibility, pressure];
      

      /** Add Header Info */
      if (weather.dt, weather?.timezone) {
        setDayInfo({
          locationName,
          dt: weather?.dt,
          timezone: weather?.timezone,
        })
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
  } catch (error) {
    console.error(error)
    setError('Location not found.');
  }
}

/**
 * Handles the location submission and sets up values in the UI.
 *
 * @param {Event} event - The form submission event.
 */
const handleSubmit = (event: Event) => {
  event.preventDefault();
  var formData = new FormData( document.getElementById('location-form') as HTMLFormElement );
  const location = formData.get('location')
  setWeatherInfo(location as string);
};

// Add event listener to the form for submit event
const form = document.querySelector('#location-form') as HTMLFormElement;
form.addEventListener('submit', handleSubmit);

// Focus on input element on load
document.getElementById("location-input")?.focus();

// Get the previous location query
const currentLocation = sessionStorage.getItem('location-query');
setWeatherInfo(currentLocation || 'Bacoor');