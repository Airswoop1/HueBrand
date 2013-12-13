// Left Menu - Search Module - Tab Functionality

     $(function() {
            $( "#tabs" ).tabs({
              event: "mouseover"
            });
          });


// Left Menu - Index

! function ($) {
            $(function () {
                var $window = $(window)
                var $body = $(document.body)
                var $sideBar = $('.bs-sidebar')
                var navHeight = $('.navbar').outerHeight(true) + 10

                $body.scrollspy({
                    target: '.bs-sidebar',
                    offset: navHeight
                })

                $('.bs-docs-container [href=#]').click(function (e) {
                    e.preventDefault()
                })

                $window.on('resize', function () {
                    $body.scrollspy('refresh')
                    // We were resized. Check the position of the nav box
                    $sideBar.affix('checkPosition')
                })

                $window.on('load', function () {
                    $body.scrollspy('refresh')
                    $('.bs-top').affix();
                    $sideBar.affix({
                        offset: {
                            top: function () {
                                var offsetTop = $sideBar.offset().top
                                var sideBarMargin = parseInt($sideBar.children(0).css('margin-top'), 10)
                                var navOuterHeight = $('.bs-docs-nav').height()

                                // We can cache the height of the header (hence the this.top=)
                                // This function will never be called again.
                                return (this.top = offsetTop - navOuterHeight - sideBarMargin);
                            },
                            bottom: function () {
                                // We can't cache the height of the footer, since it could change
                                // when the window is resized. This function will be called every
                                // time the window is scrolled or resized
                                return $('.bs-footer').outerHeight(true)
                            }
                        }
                    })
                    setTimeout(function () {
                        // Check the position of the nav box ASAP
                        $sideBar.affix('checkPosition')
                    }, 10);
                    setTimeout(function () {
                        // Check it again after a while (required for IE)
                        $sideBar.affix('checkPosition')
                    }, 100);
                });

                // tooltip demo
                $('.tooltip-demo').tooltip({
                    selector: "[data-toggle=tooltip]",
                    container: "body"
                })

                $('.tooltip-test').tooltip()
                $('.popover-test').popover()

                $('.bs-docs-navbar').tooltip({
                    selector: "a[data-toggle=tooltip]",
                    container: ".bs-docs-navbar .nav"
                })
            })
        }(window.jQuery)





// Module - Google Maps


function google_maps() {
    new GMaps({
        div: '#map',
        lat: -12.043333,
        lng: -77.028333
    });

    url = GMaps.staticMapURL({
        size: [610, 300],
        lat: -12.043333,
        lng: -77.028333
    });

    $('<img/>').attr('src', url)
        .appendTo('#static');

    map = new GMaps({
        div: '#route',
        lat: -12.043333,
        lng: -77.028333
    });
    $('#start_travel').click(function (e) {
        e.preventDefault();
        map.travelRoute({
            origin: [-12.044012922866312, -77.02470665341184],
            destination: [-12.090814532191756, -77.02271108990476],
            travelMode: 'driving',
            step: function (e) {
                $('#instructions').append('<li>' + e.instructions + '</li>');
                $('#instructions li:eq(' + e.step_number + ')').delay(450 * e.step_number).fadeIn(200, function () {
                    map.setCenter(e.end_location.lat(), e.end_location.lng());
                    map.drawPolyline({
                        path: e.path,
                        strokeColor: '#131540',
                        strokeOpacity: 0.6,
                        strokeWeight: 6
                    });
                });
            }
        });
    });

    var addresspicker = $("#addresspicker").addresspicker();
    var addresspickerMap = $("#addresspicker_map").addresspicker({
        regionBias: "de",
        map: "#map_canvas",
        typeaheaddelay: 1000,
        mapOptions: {
            zoom: 16,
            center: new google.maps.LatLng(52.5122, 13.4194)
        }

    });

    addresspickerMap.on("addressChanged", function (evt, address) {
        console.dir(address);
    });
    addresspickerMap.on("positionChanged", function (evt, markerPosition) {
        markerPosition.getAddress(function (address) {
            if (address) {
                $("#addresspicker_map").val(address.formatted_address);
            }
        })
    });
}


// Module - D3 Pie Chart

var testdata = [
        {
          key: "#1f77b4",
          y: 10
        },
        {
          key: "ff7f0e",
          y: 20
        },
        {
          key: "#2ca02c",
          y: 15
        },
        {
          key: "#d62728",
          y: 25
        },
        {
          key: "#9467bd",
          y: 5
        },
        {
          key: "#8c564b",
          y: 10
        },
        {
          key: "#e377c2",
          y: 5
        }
      ];


    nv.addGraph(function() {
        var width = 500,
            height = 600;

        var chart = nv.models.pieChart()
            .x(function(d) { return d.key })
            .y(function(d) { return d.y })
            .color(d3.scale.category10().range())
            .width(width)
            .height(height);

          d3.select("#test1")
              .datum(testdata)
            .transition().duration(1200)
              .attr('width', width)
              .attr('height', height)
              .call(chart);

        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

        return chart;
    });

// Module - Color and Logo Cloud - Isotope

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
