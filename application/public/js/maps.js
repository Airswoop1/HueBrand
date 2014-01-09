var geocoder;
function initialize() {
  
  geocoder = new google.maps.Geocoder();

  // Create the map.
  var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(38.723888,-35.762143),
    disableDefaultUI: true,
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
     styles: [
      {
        "stylers": [
      { "visibility": "simplified" },
      { "weight": 0.5 },
      { "saturation": 54 },
      { "lightness": 0 },
     { "gamma": .65 },
       
    ]
      },{
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
