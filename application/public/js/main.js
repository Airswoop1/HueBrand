
$(window).load(function(){

/***************************************
  Top Color
****************************************/
  var $container = $("#color-top.well-content"),
    $description = $(".table-bordered").hide(),
    $prev;

  $(".colorTop-boxes").mouseenter(function() {
      if ($prev)
      {
         $description.eq( $prev.css('display','block').index() ).hide();
       }
      $description.eq( ($prev = $(this).css('display','block')).index() ).fadeIn( "slow", function() {
      // Animation complete
    })
  }).eq(0).mouseenter();


/***************************************
  OWL
****************************************/

 
  var owl = $(".owl-carousel");
 
  owl.owlCarousel({"autoPlay":true, "rewindNav":false});

  $(".owl-controls").hide();

})


// #Fading in the Nav Bar Dropdown
  $(function() {
    $('.dropdown-toggle').click(function() {
        $('.dropdown-menu').fadeToggle(600);
    });
  });

// #Module - Logo Cloud
 
  $(window).load(function(){
      var $container = $('.portfolioContainer');
      $container.isotope({
           masonry: {
      columnWidth: 140
    },  
          filter: '*',
          animationOptions: {
              duration: 3750,
              easing: 'linear',
              queue: false
          }
         
      });
   
      $('.portfolioFilter a').click(function(){
          $('.portfolioFilter .current').removeClass('current');
          $(this).addClass('current');
   
          var selector = $(this).attr('data-filter');
          $container.isotope({
              filter: selector,
              animationOptions: {
                  duration: 3750,
                  easing: 'linear',
                  queue: false
              }
           });
           return false;
      }); 
  });

  // Additional Isotope Scripts
 
  $(function(){
    
    var $container = $('#container');

    $container.isotope({
      itemSelector : '.element'
    });
    
    
    var $optionSets = $('#options .option-set'),
        $optionLinks = $optionSets.find('a');

    $optionLinks.click(function(){
      var $this = $(this);
      // don't proceed if already selected
      if ( $this.hasClass('selected') ) {
        return false;
      }
      var $optionSet = $this.parents('.option-set');
      $optionSet.find('.selected').removeClass('selected');
      $this.addClass('selected');

      // make option object dynamically, i.e. { filter: '.my-filter-class' }
      var options = {},
          key = $optionSet.attr('data-option-key'),
          value = $this.attr('data-option-value');
      // parse 'false' as false boolean
      value = value === 'false' ? false : value;
      options[ key ] = value;
      if ( key === 'layoutMode' && typeof changeLayoutMode === 'function' ) {
        // changes in layout modes need extra logic
        changeLayoutMode( $this, options )
      } else {
        // otherwise, apply new options
        $container.isotope( options );
      }
      
      return false;
    });

    
  });

// #Module - ColorChart


google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Color', 'Percentage', { role: 'style' } ],
          ['Orange', .30, 'color: orange'],
          ['Red', .25, 'color: red'],
          ['Green', .20, 'color: green'],
          ['Blue', .15, 'color: blue'],
          ['Purple', .10, 'color: purple'],
        ]);

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
        tooltip: {trigger: "none", textStyle:{ fontName: 'Nunito',fontSize: '16' }, isHtml: true}
        };

      var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
      chart.draw(view, options);
      }


