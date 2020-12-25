var apiKey = "91185228dbf30f4b353a83e4392b1aa7"; 

//global declarations for current day weather
var apiUrl = "https://api.openweathermap.org/data/2.5/weather";
var farenheit = "&units=imperial";
var currentDate = new Date();
var month = currentDate.getMonth()+1;
var day = currentDate.getDate();
var year = currentDate.getFullYear();
var currentWeatherContainer = $("#current-weather");

//variable for button click
var searchCityBtn = $("#search-btn");

//variable for container to append past city searches to as well as button clicks for past cities
var cityContainer = $("#city-container");
//array of city searches
var cityArr = JSON.parse(localStorage.getItem("city")) || [];

function getCurrentWeather(city) {
    var urlString = apiUrl + "?q=" + city + "&appid=" + apiKey + farenheit;
    fetch(urlString).then(function(response){
        if (response.ok){
            response.json().then(function(weatherData){
                getUvIndex(city, weatherData);
                getForecastWeather(weatherData);
                saveCity(city);
                displayCities();
            });
        }
    });
}

function getUvIndex(city, weatherData){
    var uvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherData.coord.lat + "&lon=" + weatherData.coord.lon + "&appid=" + apiKey;
    fetch(uvApiUrl).then(function(response){
        if(response.ok){
            response.json().then(function(uvData){
                displayCurrentWeather(city, weatherData, uvData);
            });
        }
    });
}

function displayCurrentWeather(city, weatherData, uvData){
    //clear current content
    currentWeatherContainer.html("").addClass("border");

    //display city (current date)
    var cityHeader = $("<h2>")
        .addClass("capitalize")
        .text(city + " (" + month + "/" + day + "/" + year + ") ");
    var imgEl = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherData.weather[0].icon + ".png");
    cityHeader.append(imgEl);
    currentWeatherContainer.append(cityHeader);
   
    //append temp to current weather container
    var temperatureEl = $("<p>")
        .text("Temperature: " + weatherData.main.temp);   
    var degreeEl = $("<span>")
        .html("&#176;F");
    temperatureEl.append(degreeEl);
    currentWeatherContainer.append(temperatureEl);

    //append humidity to current weather container
    var humidityEl = $("<p>")
        .text("Humidity: " + weatherData.main.humidity + "%");   
    currentWeatherContainer.append(humidityEl);

    //append wind speed to current weather container
    var windSpeedEl = $("<p>")
        .text("Wind Speed: " + weatherData.wind.speed + "MPH");
    currentWeatherContainer.append(windSpeedEl);

    //append uv index to current weather container
    var uvEl = $("<p>")
        .text("UV Index: ");

    var uvIndex = uvData.value;
    var uvIndexEl = $("<span>")
        .text(uvIndex);
    
    if (uvIndex>=0 && uvIndex<3){
        uvIndexEl.addClass("low");
    }
    else if(uvIndex>=3 && uvIndex<6){
        uvIndexEl.addClass("moderate");
    }
    else if(uvIndex>=6 && uvIndex<8){
        uvIndexEl.addClass("high");
    }
    else{
        uvIndexEl.addClass("very-high");
    }
    uvEl.append(uvIndexEl);
    currentWeatherContainer.append(uvEl);
}

//global declarations for 5 Day Forecast
var forecastApiUrl = "https://api.openweathermap.org/data/2.5/onecall";
var forecastContainerEl = $("#day-container");

function getForecastWeather(weatherData) {
    var urlString = forecastApiUrl + "?lat=" + weatherData.coord.lat + "&lon=" + weatherData.coord.lat + "&appid=" + apiKey + farenheit + "&exclude=current,hourly";
    fetch(urlString).then(function(response){
        if (response.ok){
            response.json().then(function(forecastData){
                displayForecast(forecastData);
            });
        }
    });
}

function displayForecast(forecastData){
    var headerEl = $("#forecast-header").attr("hidden", false);
    //clear current content
    forecastContainerEl.html("");

    for (var i=0; i<5; i++){
        //create container for each day
        var divEl = $("<div>")
            .addClass("col-2 bg-primary mx-auto text-white p-2");

        //append date to container
        var date = addDays(currentDate, i+1);
        var month = date.getMonth()+1;
        var pEl = $("<p>")
            .addClass("font-weight-bold")
            .text(month + "/" + date.getDate() + "/" + date.getFullYear());
        divEl.append(pEl);

        //append weather icon to container
        iconImgEl = $("<img>")
            .attr("src", "http://openweathermap.org/img/wn/" + forecastData.daily[i].weather[0].icon + ".png");
        divEl.append(iconImgEl);

        //append temperature to container
        var tempEl = $("<p>")
            .text("Temp: " + forecastData.daily[i].temp.day);
        var degreeEl = $("<span>")
            .html("&#176;F");
        tempEl.append(degreeEl);
        divEl.append(tempEl);

        //append humidity to container
        var humidityEl = $("<p>")
            .text("Humiditiy: " + forecastData.daily[i].humidity);
        divEl.append(humidityEl);

        forecastContainerEl.append(divEl);
    }
}

function addDays(date, days){
    var result = new Date(date);
    result.setDate(result.getDate()+days);
    return result;
}

function buttonClickHandler(event){
    event.preventDefault();

    var city = $("#cityName");
    if(city.val()){
        getCurrentWeather(city.val());
        city.val("");
    }
}

function saveCity(city){
    var searched = cityArr.indexOf(city);
    if (searched>-1){
        cityArr.splice(searched, 1);
    }
    cityArr.push(city);
    if(cityArr.length>10){
        cityArr.shift();
    }
    localStorage.setItem("city", JSON.stringify(cityArr));
}

function displayCities(){
    cityContainer.html("");
    for (var i=1; i<=cityArr.length; i++){
        var buttonEl = $("<button>")
            .attr("city-name", cityArr[cityArr.length-i])
            .addClass("capitalize btn-info m-1 w-75")
            .text(cityArr[cityArr.length-i]);

        cityContainer.append(buttonEl);
    }
}

function cityClickHandler(event){
    var city = event.target.getAttribute("city-name");
    if (city){
        getCurrentWeather(city);
    }
}

searchCityBtn.on("click", buttonClickHandler);
cityContainer.on("click", cityClickHandler);
displayCities();