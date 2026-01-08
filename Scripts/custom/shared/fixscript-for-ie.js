function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}



function fixProfileImages() {
    var version = detectIE();

    if (version !== false) {

        $('img.img-circle-grid').each(function () {
            var $img = $(this);
            var imgUrl = $img.prop('src');

            $($img).wrap("<span></span>");
            $img.css('opacity', '0');

            var $span = $img.parent();
            $span.css('width', '40px !important;');
            $span.css('height', '40px !important;');
            $span.css('display', 'inline-block');
            $span.css('backgroundImage', 'url(' + imgUrl + ')');
            $span.addClass('compat-object-fit').addClass('img-circle');
        });

        $('img.img-circle-user').each(function () {
            var $img = $(this);
            var imgUrl = $img.prop('src');

            $($img).wrap("<span></span>");
            $img.css('opacity', '0');

            var $span = $img.parent();
            $span.css('width', '60px !important;');
            $span.css('height', '60px !important;');
            $span.css('display', 'inline-block');
            $span.css('backgroundImage', 'url(' + imgUrl + ')');
            $span.addClass('compat-object-fit').addClass('img-circle');
        });

        $('img.img-circle-profile').each(function () {
            var $img = $(this);
            var imgUrl = $img.prop('src');

            $($img).wrap("<span></span>");
            $img.css('opacity', '0');

            var $span = $img.parent();
            $span.css('width', '100px !important;');
            $span.css('height', '100px !important;');
            $span.css('display', 'inline-block');
            $span.css('backgroundImage', 'url(' + imgUrl + ')');
            $span.addClass('compat-object-fit').addClass('img-circle');
        });

        $('img.img-circle-rewardscategory').each(function () {
            var $img = $(this);
            var imgUrl = $img.prop('src');
            $($img).removeClass('circle-border');
            $($img).wrap("<span></span>");
           
            $img.css('opacity', '0');

            var $span = $img.parent();
            $span.css('width', '128px !important;');
            $span.css('height', '128px !important;');
            $span.css('display', 'inline-block');
            $span.css('backgroundImage', 'url(' + imgUrl + ')');
            $span.addClass('compat-object-fit').addClass('img-circle').addClass('circle-border');
            $span.css('box-sizing', 'border-box');
        });

        $('img.img-circle-rewardspromotion').each(function () {
            var $img = $(this);
            var imgUrl = $img.prop('src');
            $($img).removeClass('circle-border');
            $($img).wrap("<span></span>");

            $img.css('opacity', '0');

            var $span = $img.parent();
            $span.css('width', '52px !important;');
            $span.css('height', '52px !important;');
            $span.css('display', 'inline-block');
            $span.css('backgroundImage', 'url(' + imgUrl + ')');
            $span.addClass('compat-object-fit').addClass('img-circle').addClass('circle-border');
            $span.css('box-sizing', 'border-box');
        });
    }
}