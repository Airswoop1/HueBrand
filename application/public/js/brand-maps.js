var geocoder;
function initMaps() {
  

  // Create the map.
  var mapOptions = {
    zoom: 1,
    center: new google.maps.LatLng(41.541664, -19.366642),
    mapTypeControl: true,
    mapTypeControlOptions: {
      "style": google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      "style": google.maps.ZoomControlStyle.SMALL
    },
    scrollwheel: false,
     styles: [
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
                "visibility": "on",
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
    ]
  };

geocoder = new google.maps.Geocoder();

brandMap = new google.maps.Map(document.getElementById('brand-map-canvas'), mapOptions);

var countryMap = {};
countryArray = [];

for(var theCountry in topColorsPerCountry){
   countryArray.push(theCountry);
}


populateCountryMap(0, countryArray, countryMap, function(updatedCountryMap){
  drawLocations(updatedCountryMap);
})
  
}
  
var populateCountryMap = function(index, countryArray, theCountryMap, callback){
  if(index === countryArray.length)
  {
    callback(theCountryMap)
  }
  else
  {
    var currentCountry = countryArray[index];


    var address = "'" + topColorsPerCountry[currentCountry].city + ", " + topColorsPerCountry[currentCountry].countryName + "'"

    var cName = topColorsPerCountry[currentCountry].colorName;

    geocoder.geocode( { 'address': address }, function(results, status) {
      if(status == google.maps.GeocoderStatus.OK ){
        theCountryMap[currentCountry] = {
          'center' : results[0].geometry.location,
          'colorName' : cName,
            "RrgbValue": topColorsPerCountry[currentCountry].RrgbValue,
            "GrgbValue":topColorsPerCountry[currentCountry].GrgbValue,
            "BrgbValue":topColorsPerCountry[currentCountry].BrgbValue,
            "colorPercentage" : topColorsPerCountry[currentCountry].colorPercentage
        }
      }
      else{
        console.log("unable to get geo code due to status code : " + status);
      }
      populateCountryMap(++index, countryArray, theCountryMap, callback);

    });
  }
}

function componentToHex(c){
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function drawLocations( countryMap) {

  console.log(countryMap);

  for(var country in countryMap){
    var lat = countryMap[country].center.lat();
    var lng = countryMap[country].center.lng();

      var hexValue = '#' + componentToHex(countryMap[country].RrgbValue) + componentToHex(countryMap[country].GrgbValue) + componentToHex(countryMap[country].BrgbValue);


      var   magnitude = countryMap[country].colorPercentage * 5000

      var populationOptions = {
          strokeColor: hexValue,
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: hexValue,
          fillOpacity: 0.95,
          map: brandMap,
          center: new google.maps.LatLng(lat, lng),
          radius: magnitude
      };
      // Add the circle for this city to the map.
      colorCircle = new google.maps.Circle(populationOptions);


  }
  

  /*
  map.setOptions({
      zoom: 2,
      center: results[0].geometry.location
    })*/
        

}
