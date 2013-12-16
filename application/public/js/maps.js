function initialize() {
  
  var geocoder = new google.maps.Geocoder();

  

  // Create the map.
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(37.09024, -95.712891),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  drawLocations();

  /* Construct the circle for each value in citymap.
  // Note: We scale the population by a factor of 20.
  for (var city in citymap) {
    var populationOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: citymap[city].center,
      radius: citymap[city].population / 20
    };
    // Add the circle for this city to the map.
    cityCircle = new google.maps.Circle(populationOptions);
  }*/

}

function drawLocations() {

  for(var i=0; i < indObjArray.length; i++){

    if(indObjArray[i].location.state === ''){
      var address = "'" + indObjArray[i].location.city + ", " + indObjArray[i].location.country + "'"
    }
    else{
      var address = "'" + indObjArray[i].location.city + ", " + indObjArray[i].location.state + ", " + indObjArray[i].location.country + "'"
    }

    geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });

  }
}