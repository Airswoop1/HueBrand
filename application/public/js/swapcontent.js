// jquery plugin for changing content of an element onmouseover
// from dyn-web.com

// plugin name: dw_hoverSwapContent
// version date: Jan 2011

(function($) {
    $.fn.dw_hoverSwapContent = function (contentObj, opts) {
        if ( !$.isPlainObject(contentObj) || $.isEmptyObject(contentObj) ) {
            throw new Error('It seems there is no content set up to display');
        }
        var options = $.extend( {
            displayId: 'infoDiv',
            className: 'logocolor',
            eventType: 'click',
            displayDefault: true
            }, opts || {} );
        
        options.defaultInfo = $('#' + options['displayId']).html();
        
        $('.' + options['className']).each( function(){
            $(this).hover(
                function (event) { // mouseenter
                    var c, info;
                    // get class name after showInfo, check if matching entry in contentObj
                    var classes = $(this).attr('class').split(/\s+/);
                    for (var i=0; classes[i]; i++) {
                        if ( classes[i] == options['className'] && classes[i + 1] ) {
                            c = classes[i + 1];
                            break;
                        }
                    }
                    info = contentObj[c]? contentObj[c]: '' // entry in content obj?
                    if (info) { // output to infoDiv
                        $('#' + options['displayId'] ).html(info);
                    }
                },
                function (event) { // mouseleave
                    if ( options.displayDefault ) {
                        $('#' + options['displayId'] ).html(options.defaultInfo);
                    }
                }
            );
        } );
        return this;
    };
})(jQuery);


