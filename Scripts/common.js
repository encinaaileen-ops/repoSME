var ajax =
{
    simple: function (url, rdata, successCallBack, errorCallBack, rcontext, useCache, async) {
        return $.ajax({
            type: 'POST',
            url: url,
            async: async !== undefined ? async : true,
            dataType: 'json',
            data: rdata,
            traditional: true,
            context: rcontext,
            success: function (data) {
                successCallBack(data, this);
            },
            error: errorCallBack,
            cache: useCache
        });
    },
    complex: function (url, rdata, successCallBack, errorCallBack, rcontext, useCache, async) {
        return $.ajax({
            type: 'POST',
            url: url,
            async: async !== undefined ? async : true,
            data: rdata,
            dataType: 'json',
            context: rcontext,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                successCallBack(data, this);
            },
            error: errorCallBack,
            cache: useCache
        });
    }
};



(function () {

    //var beforePrint = function () {
    //    console.log('Functionality to run before printing.');
    //};
    //var afterPrint = function () {
    //    console.log('Functionality to run after printing');
    //};

    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
            if (mql.matches) {
                if (window.onbeforeprint/*beforePrint*/) {
                    window.onbeforeprint(); // beforePrint();
                }
            } else {
                if (window.onafterprint /*afterPrint*/) {
                    window.onafterprint(); //  afterPrint();
                }
            }
        });
    }

    //window.onbeforeprint = beforePrint;
    //window.onafterprint = afterPrint;
}());

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };
}