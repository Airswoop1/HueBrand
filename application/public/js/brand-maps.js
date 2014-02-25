var geocoder;
function initMaps() {
  

  // Create the map.
  var mapOptions = {
    zoom: 1,
    center: new google.maps.LatLng(20.922123, -5.859375),
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
    ]
  };

geocoder = new google.maps.Geocoder();

brandMap = new google.maps.Map(document.getElementById('brand-map-canvas'), mapOptions);

var countryMap = {};

populateCountryMap(0, countryMap, function(updatedCountryMap){

  drawLocations(updatedCountryMap);
})
  
}
  
var populateCountryMap = function(index, theCountryMap, callback){
  if(index === indObjArray.length)
  {
    callback(theCountryMap)
  }
  else
  {
    
    if(indObjArray[index].location.state === ''){
      var address = "'" + indObjArray[index].location.city + ", " + indObjArray[index].location.country + "'"
    }
    else{
      var address = "'" + indObjArray[index].location.city + ", " + indObjArray[index].location.state + ", " + indObjArray[index].location.country + "'"
    }
    var logoFileLocation = "../logos/" + indObjArray[index].logoFileName;

    geocoder.geocode( { 'address': address }, function(results, status) {
      if(status == google.maps.GeocoderStatus.OK && !(indObjArray[index].logoFileName === 'undefined')){
        theCountryMap[indObjArray[index].shortName] = {
          'center' : results[0].geometry.location,
          'logoFileLoc' : logoFileLocation
        }
      }
      else{
        console.log("unable to get geo code due to status code : " + status);
      }
      populateCountryMap(++index, theCountryMap, callback);

    });
  }
}

function drawLocations( countryMap) {

  console.log(countryMap);

  for(var country in countryMap){
    var lat = countryMap[country].center.lat();
    var lng = countryMap[country].center.lng();
    
    var companyImage = {
      url: countryMap[country].logoFileLoc,
      scaledSize : new google.maps.Size(50, 50)
    };

    console.log(companyImage);

    var marker = new google.maps.Marker({
        "map": brandMap,
        position: new google.maps.LatLng(lat, lng),
        icon: companyImage

    });
  }
  

  /*
  map.setOptions({
      zoom: 2,
      center: results[0].geometry.location
    })*/
        

}
