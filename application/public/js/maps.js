var geocoder;
function initialize() {
  

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

  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  drawLocations(map);
}

function drawLocations(map) {

  for(var i=0; i < indObjArray.length; i++){
    
    if(indObjArray[i].location.state === ''){
      var address = "'" + indObjArray[i].location.city + ", " + indObjArray[i].location.country + "'"
    }
    else{
      var address = "'" + indObjArray[i].location.city + ", " + indObjArray[i].location.state + ", " + indObjArray[i].location.country + "'"
    }
    var logoFileLocation = "Logos/" + indObjArray[i].logoFileName;
    console.log(logoFileLocation)

    
    var marker, companyImage;
    if(typeof indObjArray[i].logoFileName !== "undefined"){
    geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          
          companyImage = {
              url: logoFileLocation,
              size : new google.maps.Size(150, 100)
            };
          console.log(logoFileLocation)

          marker = new google.maps.Marker({
              icon: logoFileLocation,
              map: map,
              position: results[0].geometry.location
          });

          map.setOptions({
              zoom: 2,
              center: results[0].geometry.location
            })
        } else {
          console.log("Geocode was not successful for the following reason: " + status + " with results " + results);
        }
      });
  }
  }

}
