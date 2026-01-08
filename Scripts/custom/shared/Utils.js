

var Utils = (function ($, undefined) {

    return {
        timeSince: timeSince
    }

    function timeSince(date, strings) {

        var seconds = Math.floor((new Date() - date) / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + ' ' + strings['Years'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval  + ' ' + strings['Months'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + ' ' + strings['Days'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + ' ' + strings['Hours'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + ' ' + strings['Minutes'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
        }
        return Math.floor(seconds) + ' ' + strings['Seconds'].toLowerCase() + ' ' + strings['Ago'].toLowerCase();
    }

}(jQuery))