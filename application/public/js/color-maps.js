var geocoder;
function initMaps() {
  
  // Create the map.
  var mapOptions = {
    zoom: 1,
    center: new google.maps.LatLng(20.922123, -5.859375),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    scrollwheel: false
    /* styles: [
      {
        "stylers": [
      { "visibility": "simplified" },
      { "weight": 0.5 },
      { "lightness": 0 },
      { "gamma": .65 },
       
    ]
      },{
        "featureType": "administrative",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
             { "visibility": "simplified" },
      { "color": "#632929" },
      { "saturation": -95 },
      { "gamma": 4.33 },
      { "lightness": 60 }
        ]
    },
    {},
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "weight": 0.6
            },
            {
                "saturation": -85
            },
            {
                "lightness": 61
            }
        ]
    },
    {
        "featureType": "road"
    },
    {},
    {
        "featureType": "landscape",
        "stylers": [
            {
                "hue": "#0066ff"
            },
            {
                "saturation": 74
            },
            {
                "lightness": 100
            }
        ]
    }
    ]*/
  };

geocoder = new google.maps.Geocoder();

colorMap = new google.maps.Map(document.getElementById('color-map-canvas'), mapOptions);
  
  var countryMap = {}

  populateCountryMap(0, countryMap, function(updatedCountryMap){
    drawLocations(colorMap, updatedCountryMap);
  })
  
}
  

var populateCountryMap = function(index, theCountryMap, callback){
  if(index === topCountries.length)
  {
    callback(theCountryMap)
  }
  else
  {
    geocoder.geocode( { 'address': topCountries[index].city + " ," + topCountries[index].key }, function(results, status) {
      
      if(status == google.maps.GeocoderStatus.OK ){
        var freqToNum = parseInt(topCountries[index].freq);
        theCountryMap[topCountries[index].key] = {
          'center' : results[0].geometry.location,
          "frequency" : freqToNum
        }
      }
      else{
        console.log("unable to get geo code due to status code : " + status);
      }

      populateCountryMap(++index, theCountryMap, callback);
    });  
  }
  
}

function componentToHex(c){
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function drawLocations(map, countryMap) {
    var theColorInHex = '#' + componentToHex(theQueriedColor.RrgbValue) + componentToHex(theQueriedColor.GrgbValue) + componentToHex(theQueriedColor.BrgbValue);
    
    for(var country in countryMap){
      var lat = countryMap[country].center.lat();
      var lng = countryMap[country].center.lng();

      var magnitude = 0;
      if(countryMap[country].frequency < 10)
      {
        magnitude = countryMap[country].frequency * 150000
      }
      else
      {
        magnitude = countryMap[country].frequency * 5000
      }

      var populationOptions = {
        strokeColor: theColorInHex,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: theColorInHex,
        fillOpacity: 0.35,
        map: colorMap,
        center: new google.maps.LatLng(lat, lng),
        radius: magnitude
      };
      // Add the circle for this city to the map.
      colorCircle = new google.maps.Circle(populationOptions);
    }


  }

