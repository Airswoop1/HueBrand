// #General

    // Fade in on Scrolling ------ 
    // When scrolling down on the page the elements on the page fade in

    $(document).ready(function() {
        
        /* Every time the window is scrolled ... */
        $(window).scroll( function(){
        
            /* Check the location of each desired element */
            $('.page-wrap .well').each( function(i){
                
                var bottom_of_object = $(this).position().top + $(this).outerHeight();
                var bottom_of_window = $(window).scrollTop() + $(window).height();
                
                /* If the object is completely visible in the window, fade it it */
                if( bottom_of_window > bottom_of_object ){
                    
                    $(this).animate({'opacity':'1'},500);
                        
                }
                
            }); 
        
        });
        
    });

    // Scroll Page ------ 
    // Used to Scroll Page down just a little to allow for the first few elements to show on the page
    function Scrolldown() {
    window.scroll(0,100); 
    }
    
    window.onload = Scrolldown;

// #Top Navigation Bar
// Fading in the Nav Bar
  $(function() {
    $('.dropdown-toggle').click(function() {
        $('.dropdown-menu').fadeToggle(600);
    });
  });

// #Search Bar

    // Tab Functionality for Search Options
    $(function() {
        $( "#tabs" ).tabs({
        });
    });

    $('#select-brand').selectize({
        sortField: 'text'
    });

    // Demo for Icons http://brianreavis.github.io/selectize.js/?hn

    $('#select-attribute').selectize({
        sortField: 'text'
    });

    $('#select-industry').selectize({
        sortField: 'text'
    });

    $('#select-color').selectize({
        sortField: 'text'
    });

// #Index Bar

    // Scrolling Index Selector Functionality
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

    
    // Tooltips
        $('.tooltips').tooltip({
            selector: "[data-toggle=tooltip]",
            container: "body"
        });

        });

    }(window.jQuery)

    // Scrolling when clicking on ID
    jQuery(document).ready(function($) {

        $(".sidenav-link").click(function(event){     
            event.preventDefault();
            $('html,body').animate({scrollTop:$(this.hash).offset().top - 71}, 1300); 
        });
    });

// #Module - Company Logo

// #Module - Company Information

// #Module - Logo Colors

$(document).ready(function(){
    
    eventType: 'mouseover';

    var content = {
        color1: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(117,117,117);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Light Gray</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">16.66%</span>\
            </li>\
          </ul>',
         color2: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(141,182,0);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Light Green</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">14.23%</span>\
            </li>\
          </ul>',
           color3: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(255,90,54);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Bright Orange</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">19.12%</span>\
            </li>\
          </ul>',
           color4: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(8,146,208);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Aqua</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">9.01%</span>\
            </li>\
          </ul>',
           color5: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(85,85,85);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Dark Gray</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">2.10%</span>\
            </li>\
          </ul>',
           color6: '<ul class="logocolors-selected">\
            <li class="logocolors-selected-color">\
              <div style="background:rgb(255,86,0);height:50px"></div>\
            </li>\
            <li class="logocolors-selected-colorname">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Color Name:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">Orange</span>\
            </li>\
            <li class="logocolors-selected-colorpercentage">\
              <span style="font-weight:900;text-transform:uppercase;font-size:15px;">Percentage:</span>\
              <span style="font-weight:400;text-transform:uppercase;font-size:15px;">11.13%</span>\
            </li>\
          </ul>'
        // add more - watch the syntax though!
    }
    
    $( document ).dw_hoverSwapContent(content);
});


// #Module - Industry Logo Cloud
    // Isotope used for animations and placement of images for Logos
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

// #Module - Color Cloud
    // See Module for Industry Logo Cloud

// #Module - Color Attribute Associations

// #Module - Attribute Associations

// #Module - Common Color Combinations
    // Hover and Choose Color



// #Module - Regional Attribute Associations

    // Google Maps
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

// #Module - Logo Timeline









