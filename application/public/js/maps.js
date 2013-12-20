var geocoder;
function initialize() {
  
  geocoder = new google.maps.Geocoder();

  // Create the map.
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(37.09024, -95.712891),
    mapTypeId: google.maps.MapTypeId.TERRAIN
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
    var logoFileLocation = "../Logos/" + indObjArray[i].logoFileName;
    console.log(logoFileLocation)
    geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              icon: logoFileLocation,
              map: map,
              position: results[0].geometry.location
          });
         /* var colorOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: results[0].geometry.location,
            radius: 1000000
          };
          // Add the circle for this city to the map.
          cityCircle = new google.maps.Circle(colorOptions);*/
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
