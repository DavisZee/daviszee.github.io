const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show'); // Remove when out of view
      }
    });
  }, {
    threshold: 0.1 // Adjust sensitivity (0.1 = 10% visible)
  });
  
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

/** ----------------------Drop Down Menu---------------------- */
// Dropdown toggle — only run if elements exist on this page
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('open');
  });
}
/** ----------------------Weather Finder---------------------- */
var curLongitude = 0;
var curLatitude = 0;
// api for fetching weather based on latitude and longitude
let openMetroWeatherApi = {
    "apiKey": "none",
    fetchWeather: function (long, lat, start, end) {
        var start_date = dateHandler.getDate(start);
        var end_date = end;
        //console.log("here: " + start_date);
        fetch("https://api.open-meteo.com/v1/forecast?latitude=" 
        + lat 
        + "&longitude=" 
        + long 
        + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,windspeed_10m_max&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FLos_Angeles&start_date=" 
        + start_date
        + "&end_date="
        + end_date
        ).then((response) => response.json()).then((data => this.displayWeather(data)));
    },
    fetchGeocode: function () {
        fetch("https://geocoding-api.open-meteo.com/v1/search?name=snoqualmie")
    },
    displayWeather: function(data) {
        // collect data into arrays
        const { longitude, latitude } = data;
        const { temperature_2m_max, temperature_2m_min, time } = data.daily
        const { precipitation_sum, snowfall_sum, precipitation_probability_max, windspeed_10m_max } = data.daily
        // console.log(longitude, latitude, temperature_2m_max, temperature_2m_min);
        // handle location
        var locationName = "";
        var strAddy = document.getElementById("search-bar").value;
        var locName = strAddy.split(", ")[0];
        locationName = locName;
        if (locationName === "") locationName = "N/A";
        // check array length
        var tableDates = time;
        // update display values
        // document.querySelector(".location").innerHTML = "Location: " + locationName + ", " + longitude + ", " + latitude;
        // document.querySelector(".temp_max").innerHTML = "Temperature high: " + temperature_2m_max + "°F";
        // document.querySelector(".temp_min").innerHTML = "Temperature low: " + temperature_2m_min + "°F";
        // document.querySelector(".description").innerHTML = "Weather condition: temp_condition";
        // document.querySelector(".snow_fall").innerHTML = "SndisplayWeatherow fall: " + snowfall_sum + " in";
        // document.querySelector(".wind").innerHTML = "Wind speed: " + windspeed_10m_max + " mph";

        var tableHead = document.getElementById("tableHead");

        var table = document.getElementById("weatherTable");
        // if this is the first entry then append all dates, add a row and append all inside values
        if (table.rows.length === 1) {
            row = tableHead.rows[0];
            // append dates to row
            for (let day of tableDates) {
                //dataHTML += "<th>" + day + "</th>";
                var tempCell = row.insertCell();
                tempCell.innerHTML = day;
            }
            row.insertCell().innerHTML = "Remove";
        }

        var tableBody = document.getElementById("tableBody");
        table
        var newRow = tableBody.insertRow();
        newRow.insertCell().textContent = locationName;
        // fill content
        for (var i = 0; i < time.length; i++) {

            newRow.insertCell().innerHTML = "Temperature high: <span class=\"tempHigh\">" + temperature_2m_max[i] + " °F</span><br>"
            + "Temperature low: <span class=\"tempLow\">" + temperature_2m_min[i] + " °F</span><br>"
            + "Snow fall: " + "<span class=\"snow\">" + snowfall_sum[i] + " in</span><br>"
            + "Wind speed: <span class=\"windMax\">" + windspeed_10m_max[i] + " </span>mph";

            // if (temperature_2m_max[i] > 40) document.getElementsByClassName("tempHigh").style.color = "red";
            // if (temperature_2m_min[i] < 0) document.getElementsByClassName("tempLow").style.color = "green";
            // if (snowfall_sum[i] > 3) {
            //     document.getElementsByClassName("snow").style.color = "green";
            // }
            // if (windspeed_10m_max[i] > 15) document.getElementsByClassName("windMax").style.color = "red";
            if (temperature_2m_max[i] < 35) {
                var tempHighElements = document.getElementsByClassName("tempHigh");
                for (var j = 0; j < tempHighElements.length; j++) {
                    tempHighElements[j].style.color = "green";
                }
            }else {
                var tempHighElements = document.getElementsByClassName("tempHigh");
                for (var j = 0; j < tempHighElements.length; j++) {
                    tempHighElements[j].style.color = "red";
                }
            }
            if (temperature_2m_min[i] > 0) {
                var tempLowElements = document.getElementsByClassName("tempLow");
                for (var j = 0; j < tempLowElements.length; j++) {
                    tempLowElements[j].style.color = "green";
                }
            }else {
                var tempLowElements = document.getElementsByClassName("tempLow");
                for (var j = 0; j < tempLowElements.length; j++) {
                    tempLowElements[j].style.color = "green";
                }
            }
            // if (snowfall_sum[i] > 3) {
            //     var snowElements = document.getElementsByClassName("snow");
            //     for (var j = 0; j < snowElements.length; j++) {
            //         snowElements[j].style.color = "green";
            //     }
            // }
            // if (windspeed_10m_max[i] > 15) {
            //     var windMaxElements = document.getElementsByClassName("windMax");
            //     for (var j = 0; j < windMaxElements.length; j++) {
            //         windMaxElements[j].style.color = "red";
            //     }
            // }
        }
        var checkCell = newRow.insertCell();
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkCell.appendChild(checkbox);

    },
    search: function () {
        var mystart = dateHandler.fetchStartDate();
        var myend = dateHandler.fetchEndDate();
        // console.log(start + end);
        this.fetchWeather(curLongitude, curLatitude, mystart, myend);
    }
};

document.getElementById("search-btn").addEventListener("click", function() {
    var inputLng = document.getElementById("coordinate-bar-lng");
    var inputLat = document.getElementById("coordinate-bar-lat");
    curLongitude = inputLng.value;
    curLatitude = inputLat.value;
    // if ((curLongitude === 0) || (curLatitude === 0)) console.log("Error: empty fields");
    // add check for dates later
    openMetroWeatherApi.search();
})

document.getElementById("update-btn").addEventListener("click", function() {
    var table = document.getElementById("weatherTable");
    var checkboxes = table.getElementsByTagName("input");

    for (var i = checkboxes.length - 1; i >= 0; i--) {
        var checkbox = checkboxes[i];
        if (checkbox.checked) {
          var row = checkbox.closest("tr");
          table.deleteRow(row.rowIndex);
        }
      }
})


// test longitude = -121.40, latitude = 47.39
// date format yyyy-mm-dd
// openMetroWeatherApi.fetchWeather(-121.40, 47.39, "2023-03-02", "2023-03-03")

// get the current date
var currentDate = new Date();

// set the minimum and maximum allowed dates (2 weeks before and after the current date)
var minDate = new Date(currentDate.getTime() - (14 * 24 * 60 * 60 * 1000));
var maxDate = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));

// add an event listener to the update button to check the selected dates
document.getElementById("search-btn").addEventListener("click", function() {
  // get the selected start and end dates
  var startDate = new Date(document.getElementById("start-date").value);
  var endDate = new Date(document.getElementById("end-date").value);

  // check if the selected dates are outside the allowed range
  if (startDate < minDate || endDate > maxDate) {
    alert("The selected dates are outside the range of possible forecasts. Please select dates within 2 weeks of today.");
  }
});


// find longitude and latitude based on location name

let autocomplete;
    function initAutocomplete() {
        autocomplete = new google.maps.places.Autocomplete(
            document.getElementById("search-bar"),
            {
                types: ["establishment"],
                componentRestructions: {"country": ["AU"]},
                fields: ["place_id", "geometry.location", "name"]
            }
        );

        autocomplete.addListener('place_changed', onPlaceChanged);
    }
    function onPlaceChanged() {
        var place = autocomplete.getPlace();
        var lng;
        var lat;

        if (!place.geometry) {
            document.getElementById('autocomplete').placeholder = 'Enter a place';
        }
        else {
            //document.getElementById("details").innerHTML = place.name;
            // console.log(place.geometry.location.lat());
            // console.log(place.geometry.location.lng())
            lng = place.geometry.location.lng();
            lat = place.geometry.location.lat();
            var inputLng = document.getElementById("coordinate-bar-lng");
            var inputLat = document.getElementById("coordinate-bar-lat");
            inputLng.value = lng;
            inputLat.value = lat;
            curLongitude = lng;
            curLatitude = lat;
        }
    }


    let googleMapsApi = {
        "apiKey": "AIzaSyCiOBimKks___n8Jfo9uxRa9prmN7S5WMI"
}

let geoLocater = {
    getLocationFromCoordinates: function () {
        var inLng = document.getElementById("coordinate-bar-lng");
        var inLat = document.getElementById("coordinate-var-lat");
        
    }

}

// deprecated for now
let dateHandler = {
    getDate: function(date) {
        var rightNow = new Date(date);
        var res = rightNow.toISOString().slice(0,10).replace(/-/g,"-");
        //console.log("date: "+res)
        return res;
    },
    fetchStartDate: function() {
        var inputDate = document.getElementById("start-date");
        var mydate = inputDate.value;
        //console.log("start: " + mydate);
        return mydate;
    },
    fetchEndDate: function() {
        var inputDate = document.getElementById("end-date");
        var mydate = inputDate.value;
        //console.log("end: " + mydate);
        return mydate;
    }
    
}





document.getElementById('email-form').addEventListener('submit', function(event) {
    event.preventDefault(); // prevent form from submitting normally

    // Get the HTML content of the table
    const tableHtml = document.getElementById('weatherTable').innerHTML;

    // Format the table content as a string
    const formattedTable = `
    <table>
        <thead>
        <tr>
            <th>Location</th>
        </tr>
        </thead>
        <tbody>
        ${tableHtml}
        </tbody>
    </table>
    `;
  
    // get form values
    var subject = document.getElementById('subject').value;
    var recipientEmail = document.getElementById('recipient-email').value;
    var message = document.getElementById('message').value;
  
    Email.send({
      Host : "smtp.gmail.com",
      Username : "project481weather@gmail.com",
      Password : "rcojvtxoehnnlldu",
      To : "project481weather@gmail.com",
      From : recipientEmail,
      Subject : subject,
      Body : message + '<br><br>${formattedTable}'
    }).then(
      function(message) {
        alert('Email sent successfully');
      }
    );
  });