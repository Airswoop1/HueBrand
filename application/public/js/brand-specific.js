

  google.load("visualization", "1", {packages:["corechart"]});
  
  google.setOnLoadCallback(drawChart);
  
  function drawChart() {
    var dataSourceForArrayToData = [['Color', 'Percentage', { role: 'style' } ]]
    
    var colorFamilies = {}
    colorFamilies["red"] = "R"
    colorFamilies["orange"] = "O"
    colorFamilies["brown"] = "Br"
    colorFamilies["beige"] = "Be"
    colorFamilies["yellow"] = "Y"
    colorFamilies["yellow/green"] = "Y/G"
    colorFamilies["green"] = "G"
    colorFamilies["cyan"] = "C"
    colorFamilies["blue"] = "B"
    colorFamilies["purple"] = "P"
    colorFamilies["magenta"] = "M"
    colorFamilies["black"] = "Bl"
    colorFamilies["gray"] = "GY"
    colorFamilies["white"] = "W"

    


    var colorsUsed = [];
    var maxColorValue = 0;
      for(var i=0; i<topColorsForIndustry.length;i++){

        if(colorFamilies.hasOwnProperty(topColorsForIndustry[i].colorFamily)){
          colorsUsed.push(topColorsForIndustry[i].colorFamily);

           var percentToNumber = parseFloat((topColorsForIndustry[i].colorPercentage/100).toFixed(2),10);
           //if white change border to .1 otherwise remove
           if(percentToNumber > maxColorValue){
              maxColorValue = percentToNumber;
           }
          dataSourceForArrayToData.push([
            colorFamilies[topColorsForIndustry[i].colorFamily],
            percentToNumber,
            'fill-color : ' + topColorsForIndustry[i].hexValue + ';stroke:#000000;stroke-width: .1;'
            ])
        }

      }

      /*for(var colors in colorFamilies){
        if(!colorsUsed.hasOwnProperty(colorFamilies[colors])){
          dataSourceForArrayToData.push([
            colorFamilies[colors],
            0,
            '' 
          ]);        
        }

      }*/




      var data = google.visualization.arrayToDataTable(dataSourceForArrayToData);

    var view = new google.visualization.DataView(data);
    /*view.setColumns([0, 1,
      { 
      calc: "stringify",
      sourceColumn: 1,
      type: "string",
      role: "annotation" },
      2]);*/

    /*var formatter = new google.visualization.NumberFormat({
      fractionDigits: 3,
      pattern:'#,###%',
      });
    
    formatter.format(data, 1);*/
    maxColorValue = maxColorValue + .05;
    var options = {
      vAxis: {format:'0%', minValue:0, maxValue:maxColorValue, viewWindowMode:'maximized', textStyle:{ fontName: 'Nunito',fontSize: '16' }},
      hAxis: {textStyle:{ fontName: 'Nunito',fontSize: '16' }},
      legend: { position: "none" },
      bar: {groupWidth: "80%"},
      //tooltip: {trigger: "none", textStyle:{ fontName: 'Nunito',fontSize: '16' }, isHtml: true},
      };

    var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
    chart.draw(view, options);
  }

  
window.onload = function(){  

  var pathArray = window.location.href.split( '/' );
  var protocol = pathArray[0];
  var host = pathArray[2];
  var url = protocol + '//' + host;
  var currentQuery = pathArray[3];


  if(currentQuery === 'attribute' || currentQuery === 'industry'){
    //change map and logo cloud width to 48%
    //and apply margin left 2% to map
    $('#logocloud').css('width','47%');
    $('#global-map').css('width','47%').css('margin-right','2%').css('margin-left','2%');
    setTimeout(function(){
      $('.logoCloudContainer').isotope('reLayout'); 
    }, 1000);

  } 
  else if(currentQuery === 'brand'){
    if(brandHistoryResultLength < 1){
    $('#logocloud').css('width','47%');
    $('#global-map').css('width','47%').css('margin-right','2%').css('margin-left','2%');
      setTimeout(function(){
        $('.logoCloudContainer').isotope('reLayout'); 
      }, 1000);
      
    }
  }

}


