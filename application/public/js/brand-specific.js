

  google.load("visualization", "1", {packages:["corechart"]});
  
  google.setOnLoadCallback(drawChart);
  
  function drawChart() {
    var dataSourceForArrayToData = [['Color', 'Percentage', { role: 'style' } ]]
    for(var i=0; i<topColor.length;i++){
      var percentToNumber = topColor[i].colorPercentage/100;

      dataSourceForArrayToData.push([
        topColor[i].colorName,
        percentToNumber,
        'fill-color : ' + topColor[i].hexValue + ';stroke-color: #000000; stroke-width: 1;'
        ])
    }
    console.log(dataSourceForArrayToData);

    var data = google.visualization.arrayToDataTable(dataSourceForArrayToData);

  var view = new google.visualization.DataView(data);
  view.setColumns([0, 1,
    { calc: "stringify",
    sourceColumn: 1,
    type: "string",
    role: "annotation" },
    2]);

  var formatter = new google.visualization.NumberFormat({
    fractionDigits: 3,
    pattern:'#,###%',
    });
  
  formatter.format(data, 1);

  var options = {
    vAxis: {format:'0%', minValue:0, viewWindowMode:'maximized', textStyle:{ fontName: 'Nunito',fontSize: '16' }},
    hAxis: {textStyle:{ fontName: 'Nunito',fontSize: '16' }},
    legend: { position: "none" },
    bar: {groupWidth: "80%"},
    tooltip: {trigger: "none", textStyle:{ fontName: 'Nunito',fontSize: '16' }, isHtml: true},
    };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
  chart.draw(view, options);
  }

