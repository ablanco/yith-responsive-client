// Code from Underscore.js 1.8.3
// http://underscorejs.org
// (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore may be freely distributed under the MIT license.

export default function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result, later, now;

    now = Date.now || function() {
        return new Date().getTime();
    };

    later = function() {
        var last = now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) { context = args = null; }
            }
        }
    };

    return function() {
        var callNow;

        context = this;
        args = arguments;
        timestamp = now();
        callNow = immediate && !timeout;
        if (!timeout) { timeout = setTimeout(later, wait); }
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
}
