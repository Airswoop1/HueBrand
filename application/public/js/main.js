// #General

// #Top Navigation Bar
// Fading in the Nav Bar
  $(function() {
    $('.dropdown-toggle').click(function() {
        $('.dropdown-menu').fadeToggle(600);
    });
  });

// #Search Bar

// #Index Bar

// #Module - Company Logo

// #Module - Company Information

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




// #Module - Color Attribute Associations

// #Module - Attribute Associations

// #Module - Common Color Combinations

// #Module - Regional Attribute Associations

// #Module - Logo Timeline






