(function (window, $) {


    $.idleTimeout = function (element, options) {
        var public = this;
        var private = {};
        var $element = $(element);

        var timeoutTimer,
            waitClickInterval,
            events = "mousemove keydown DOMMouseScroll mousewheel mousedown";


        var settings = $.extend({
            // number of seconds after user is idle to show the warning
            timeout: 120,
            messageTimeout: 60,
            callback: function () { },
            cookieName: "idle-timeout",
            cookieEventName: "idle-event",
            cookieClickEventName: "click",
            cookieExitEventName: "exit",
            text: "You will be logged off in %s seconds due to inactivity.",
            linkText: "Click here to continue using this web page"
        }, options);

        private.init = function () {
            private.clearAllCookies();
            private.startTimer();
            private.render();
            private.registerEvents();
         //   private.showIdletimeout();
           
            setInterval(private.eventHandler, 1000);

            private.setCookie(settings.cookieName, new Date().getTime());
        };

        private.registerEvents = function () {
            $element.on("click", "a", private.idleResume);
            $(document).bind(events, function () {
                if (!$element.is(":visible"))
                    private.startTimer();

                private.setCookie(settings.cookieName, new Date().getTime());
            });
        };

        private.startTimer = function () {
            clearTimeout(timeoutTimer);
            clearInterval(waitClickInterval);
            timeoutTimer = setTimeout(private.showIdletimeout, settings.timeout * 1000);
        };

        private.stopAllTimers = function () {
            clearInterval(timeoutTimer);
            clearInterval(waitClickInterval);
        }

        private.clearAllCookies = function () {
            private.setCookie(settings.cookieName, "");
            private.setCookie(settings.cookieEventName, "");
        }

        private.render = function () {
            $element.addClass('idle-timeout-wrap');
            $("<span>").appendTo($element);
            $("<a>").attr("href", "#").text(settings.linkText).appendTo($element);
        };

        private.idleResume = function () {
            private.setCookie(settings.cookieEventName, settings.cookieClickEventName);
            $element.slideUp();
            private.startTimer();
            return false;
        };

        private.waitClick = function (callback, delay) {
            private.showTimeText(delay);

            waitClickInterval = setTimeout(function () {
                if (delay > 0) {
                    private.waitClick(callback, --delay);
                } else {
                    $element.slideUp();
                    callback();
                }
            }, 1000);
        };

        private.showTimeText = function (time) {
            var t = private.secondsToMinutes(time);
            $element.children("span").text(settings.text.replace("%s", t));
        }

        private.secondsToMinutes = function (time) {
            var minutes = Math.floor(time / 60);
            var seconds = time - minutes * 60;

            minutes = minutes > 9 ? minutes : "0" + minutes;
            seconds = seconds > 9 ? seconds : "0" + seconds;

            return minutes + ":" + seconds;
        }

        private.lastEvent = "";

        private.eventHandler = function () {
            var cookieStr = private.getCookie(settings.cookieEventName);
            if (private.lastEvent === cookieStr)
                return;

            private.lastEvent = cookieStr;

            if (cookieStr === settings.cookieExitEventName) {
                private.stopAllTimers();
                private.invokeCallback();
            }

            if (cookieStr === settings.cookieClickEventName) {
                $element.slideUp();
                private.startTimer();
            }
        };

        private.showIdletimeout = function () {
            var cookieStr = private.getCookie(settings.cookieName);
            var cookieVal = cookieStr ? parseInt(cookieStr) : 0;

            if (cookieVal !== 0 && ((new Date().getTime() - cookieVal)) < (settings.timeout * 1000)) {
                private.startTimer();
            } else {
                private.showTimeText(settings.messageTimeout);
                $element.slideDown();
                private.waitClick(private.invokeCallback, settings.messageTimeout);
                $("html, body").stop().animate({ scrollTop: 0 });
            }
        };

        private.invokeCallback = function () {
            $element.slideUp();

            // for preventing generation of an event 'exit' on this page
            private.lastEvent = settings.cookieExitEventName;

            private.setCookie(settings.cookieEventName, settings.cookieExitEventName);
            if (typeof settings.callback === "function")
                settings.callback();
        };

        private.setCookie = function (name, value, options) {
            options = options || {};

            var expires = options.expires;

            if (typeof expires == "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires * 1000);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            document.cookie = updatedCookie;
        };

        private.getCookie = function (name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        };


        private.init();
    }


    $.fn.idleTimeout = function (options) {
        return this.each(function () {
            if ($(this).data("idleTimeout") == undefined) {
                var plugin = new $.idleTimeout(this, options);
                $(this).data("idleTimeout", plugin);
            }
        });
    };

})(window, jQuery);