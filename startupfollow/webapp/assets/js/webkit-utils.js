Object.keysAt = function (o, index) {
    return Object._keys(o, index);
};
Object._keys = function (o, index) {
    var keys = [], key = null, currentKeyIndex = 0;
    for (key in o) {
        if (o.hasOwnProperty(key)) {
            if (isset(index) && currentKeyIndex == index) {
                return key;
            }
            keys.push(key);
            currentKeyIndex++;
        }
    }
    if (isset(index)) {
        return null;
    }
    return keys;
};
Object.keys = function (o) {
    return Object._keys(o);
};
Object.hasKeys = function (o) {
    return Object._keys(o, 0) != null;
};
Object.values = function (o) {
    var values = [], key = null;
    for (key in o) {
        if (o.hasOwnProperty(key)) {
            values.push(o[key]);
        }
    }
    return values;
};
Object.findManyBy = function (o, field, value, maxCount) {
    var result = [], id = null;
    for (id in o) {
        if (o.hasOwnProperty(id) && o[id][field] == value) {
            result.push(o[id]);
            if (isset(maxCount) && maxCount >= result.length) {
                return result;
            }
        }
    }
    return result;
};
Object.findBy = function (o, field, value) {
    return this.findManyBy(o, field, value, 1)[0];
};
Object.toJson = function (o) {
    if (typeof (o) != 'object' || o == null) {
        return o;
    }
    var json = {};
    if ($.isArray(o)) {
        json = [];
    }
    var type = '';
    var property = null;
    var observable = ko.observable();
    var computed = ko.computed(function () { });
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            property = o[p];
            type = typeof (property);
            if (type == 'function') {
                if (property.prototype.constructor.name == observable.prototype.constructor.name ||
                    property.prototype.constructor.name == computed.prototype.constructor.name) {
                    json[p] = Object.toJson(property.call(o));
                }
            }
            else if (property != null && type == 'object') {
                json[p] = Object.toJson(property);
            }
            else {
                json[p] = property;
            }
        }
    }
    return json;
};
String.generate = function (length) {
    if (length === void 0) { length = 10; }
    return "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".random(length);
};
String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
};
String.format = function (str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return str.format.apply(str, args);
};
String.prototype.toProperCase = function () {
    return this.replace(/([A-ZÀÂÉÈÊËÏÎÔÖÛÙÜÇ])+/ig, function (mot) {
        return mot.charAt(0).toUpperCase() + mot.slice(1).toLowerCase();
    });
};
String.prototype.random = function (length) {
    if (length === void 0) { length = 10; }
    var text = "";
    for (var i = 0; i < length; i++) {
        text += this.charAt(Math.floor(Math.random() * this.length));
    }
    return text;
};
String.prototype.shake = function () {
    return this.split("").shake().join("");
};
String.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    if (args.length == 1 && $.isArray(args[0])) {
        args = args[0];
    }
    return this == '' ? this : sprintf.apply(this, [this].concat(args));
};
String.prototype.lPad = function (pchar, length) {
    if (length === void 0) { length = 1; }
    var s = this;
    while (s.length < length) {
        s = pchar + s;
    }
    return CString(s);
};
String.prototype.rPad = function (pchar, length) {
    if (length === void 0) { length = 1; }
    var s = this;
    while (s.length < length) {
        s = s + pchar;
    }
    return CString(s);
};
String.prototype.replaceAll = function (strToReplace, str) {
    return this.replace(new RegExp(strToReplace, 'g'), str);
};
String.prototype.left = function (len) {
    return this.substring(0, len);
};
String.prototype.right = function (len) {
    return this.substring(this.length - len);
};
String.prototype.RTrim = function (value) {
    if (isset(value)) {
        return this.replace(new RegExp(value + "+$"), "");
    }
    return this.replace(/ +$/, "");
};
String.prototype.LTrim = function (value) {
    if (isset(value)) {
        return this.replace(new RegExp('^' + value + "+"), "");
    }
    return this.replace(/^ +/, "");
};
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
String.prototype.text = function (allowed) {
    //  discuss at: http://phpjs.org/functions/strip_tags/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Luke Godfrey
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Pul
    //    input by: Alex
    //    input by: Marc Palau
    //    input by: Brett Zamir (http://brett-zamir.me)
    //    input by: Bobby Drake
    //    input by: Evertjan Garretsen
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Onno Marsman
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Eric Nagel
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Tomasz Wesolowski
    //  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
    //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    //   returns 2: '<p>Kevin van Zonneveld</p>'
    //   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
    //   example 4: strip_tags('1 < 5 5 > 1');
    //   returns 4: '1 < 5 5 > 1'
    //   example 5: strip_tags('1 <br/> 1');
    //   returns 5: '1  1'
    //   example 6: strip_tags('1 <br/> 1', '<br>');
    //   returns 6: '1 <br/> 1'
    //   example 7: strip_tags('1 <br/> 1', '<br><br/>');
    //   returns 7: '1 <br/> 1'
    if (allowed === void 0) { allowed = ''; }
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsTags = /<!--[\s\S]*?-->/gi;
    return this
        .replace(commentsTags, '')
        .replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
};
/**
 * get UTC Time
 * @return a utc time of the current date
 */
Date.prototype.getUTCTime = function () {
    var now = new Date(0);
    now.setUTCFullYear(this.getUTCFullYear());
    now.setUTCMonth(this.getUTCMonth());
    now.setUTCDate(this.getUTCDate());
    now.setUTCHours(this.getUTCHours());
    now.setUTCMinutes(this.getUTCMinutes());
    now.setUTCSeconds(this.getUTCSeconds());
    now.setUTCMilliseconds(this.getUTCMilliseconds());
    return now.getTime();
};
Date.prototype.getTimeAge = function (d, i, o) {
    if (i === void 0) { i = 't'; }
    d = d || new Date();
    i = i || 't';
    o = o || { abs: false };
    var diff = d.getTime() - this.getTime();
    if (o.abs) {
        diff = Math.abs(diff);
    }
    switch (i) {
        case 'd': return diff / 1000 / 3600 / 24;
        case 'h': return diff / 1000 / 3600;
        case 'n': return diff / 1000 / 60;
        case 's': return diff / 1000;
        case 't':
        default: return diff;
    }
};
Date.prototype.getYearAge = function (d) {
    var dDiff_ = new Date(this.getTimeAge(d));
    return dDiff_.getFullYear() - 1970;
};
Date.prototype.getMonthAge = function (d) {
    var dDiff_ = new Date(this.getTimeAge(d));
    return (dDiff_.getFullYear() - 1970) * 12 + (dDiff_.getMonth() + 1);
};
Date.prototype.add = function (i, n) {
    switch (i) {
        case 'y':
            this.addYear(n);
            break;
        case 'm':
            this.addMonth(n);
            break;
        case 'd':
            this.addDate(n);
            break;
        case 'h':
            this.setHours(this.getHours() + n);
            break;
        case 'n':
            this.setMinutes(this.getMinutes() + n);
            break;
        case 's':
            this.setSeconds(this.getSeconds() + n);
            break;
        case 't':
        default: this.setTime(this.getTime() + n);
    }
};
Date.prototype.addDate = function (n) {
    this.setDate(this.getDate() + n);
};
Date.prototype.addMonth = function (n) {
    this.setMonth(this.getMonth() + n);
};
Date.prototype.addYear = function (n) {
    this.setFullYear(this.getFullYear() + n);
};
Date.prototype.isPast = function (d) {
    d = d || new Date();
    return this.getTime() < d.getTime();
};
Date.prototype.isFuture = function (d) {
    d = d || new Date();
    return this.getTime() > d.getTime();
};
Date.prototype.isToday = function () {
    return this.isSameDate();
};
Date.prototype.isSameDate = function (d) {
    var dNow_ = d || new Date();
    return this.getFullYear() == dNow_.getFullYear() && this.getMonth() == dNow_.getMonth() && this.getDate() == dNow_.getDate();
};
Date.prototype.getAge = function (d) {
    var dDiff_ = new Date(this.getTimeAge(d));
    return {
        Date: dDiff_,
        Year: dDiff_.getFullYear() - 1970,
        Month: dDiff_.getMonth() + 1,
        Day: dDiff_.getDate(),
        Hours: dDiff_.getHours(),
        Minutes: dDiff_.getMinutes(),
        Seconds: dDiff_.getSeconds(),
        Time: dDiff_.getTime()
    };
};
Date.prototype.isNow = function () {
    var dNow_ = new Date();
    return this.isToday() && this.getHours() == dNow_.getHours() && this.getMinutes() == dNow_.getMinutes();
};
Array.prototype.each = function (fn) {
    $.each(this, function (k, v) {
        fn.call(this, v, k);
    });
};
Array.prototype.equals = function (ary) {
    if (!ary)
        return false;
    if (this === ary)
        return true;
    if (this.length != ary.length)
        return false;
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    for (var i = 0; i < ary.length; ++i) {
        if (this[i] !== ary[i])
            return false;
    }
    return true;
};
Array.prototype.first = function () {
    return this.length > 0 ? this[0] : null;
};
Array.prototype.last = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};
Array.prototype.contains = function (o) {
    if (!$.isArray(o)) {
        return this.indexOf(o) != -1;
    }
    for (var i = 0, len = o.length; i < len; i++) {
        if (this.indexOf(o[i]) == -1) {
            return false;
        }
    }
    return true;
};
Array.prototype.union = function (o) {
    var ary = [];
    var tab1 = this.length > o.length ? o : this;
    var tab2 = this.length > o.length ? this : o;
    for (var i = 0, len = tab1.length; i < len; i++) {
        if (tab2.indexOf(tab1[i]) > -1) {
            ary.push(tab1[i]);
        }
    }
    return ary;
};
Array.prototype.fusion = function (o) {
    var r = [].concat(this);
    if (!$.isArray(o)) {
        o = [o];
    }
    for (var i = 0, len = o.length; i < len; i++) {
        if (!r.contains(o[i])) {
            r.push(o[i]);
        }
    }
    return r;
};
Array.prototype.indexOfStr = function (elt, from) {
    if (from === void 0) { from = 0; }
    // confirm array is populated
    var len = this.length;
    var i = from < 0 ? Math.max(0, len + from) : from;
    var str = elt.toLowerCase();
    for (; i < len; i++) {
        if ((typeof (this[i]) == 'string') && this[i].toLowerCase() == str) {
            return i;
        }
    }
    // stick with inArray/indexOf and return -1 on no match
    return -1;
};
Array.prototype.pushOnce = function (elt, caseSensitive) {
    if (caseSensitive === void 0) { caseSensitive = false; }
    var eltUCase = (caseSensitive && typeof (elt) == "string") ? elt.toUpperCase() : elt;
    var m = caseSensitive ? this.map(function (v) { return typeof (v) == "string" ? v.toUpperCase() : v; }) : this;
    if (m.indexOf(eltUCase) == -1) {
        this.push(elt);
        return true;
    }
    return false;
};
Array.prototype.removeAt = function (index) {
    if (index != -1) {
        return this.splice(index, 1);
    }
    return null;
};
Array.prototype.remove = function (o) {
    var index = this.indexOf(o);
    return this.removeAt(index);
};
Array.prototype.removeAll = function (l) {
    if (isset(l)) {
        var a = [];
        for (var i = 0; i < l.length; i++) {
            a.push(this.remove(l[i]));
        }
        return a;
    }
    else {
        return this.splice(0, this.length);
    }
};
Array.prototype.clear = function () {
    return this.removeAll();
};
Array.prototype.findManyBy = function (field, value, from, maxCount) {
    if (from === void 0) { from = 0; }
    var len = this.length;
    var result = [];
    from = from < 0 ? Math.ceil(from) : Math.floor(from);
    if (from < 0) {
        from += len;
    }
    for (; from < len; from++) {
        if (from in this) {
            var sValue = null;
            if (typeof (this[from][field]) == 'function') {
                sValue = this[from][field]();
            }
            else {
                sValue = this[from][field];
            }
            if (sValue == value) {
                result.push(this[from]);
                if (isset(maxCount) && result.length >= maxCount) {
                    break;
                }
            }
        }
    }
    return result;
};
Array.prototype.findBy = function (field, value, from) {
    if (from === void 0) { from = 0; }
    return this.findManyBy(field, value, from, 1)[0];
};
Array.prototype.get = function (ind) {
    return this[ind];
};
Array.prototype.shake = function () {
    var t_ = [].concat(this);
    var r_ = [];
    while (t_.length > 0) {
        var index_ = Math.floor(Math.random() * this.length);
        r_.push(t_.splice(index_, 1));
    }
    return r_;
};
Number.prototype.round = function (decimal) {
    if (decimal === void 0) { decimal = 2; }
    return Number(Number(this).toFixed(decimal));
};
/// <reference path="./commons/prototypes/Object.prototype.ts"/>
/// <reference path="./commons/prototypes/String.prototype.ts"/>
/// <reference path="./commons/prototypes/Date.prototype.ts"/>
/// <reference path="./commons/prototypes/Array.prototype.ts"/>
/// <reference path="./commons/prototypes/Number.prototype.ts"/>
function isset(value) {
    return value != null && typeof (value) != "undefined";
}
function defer(fn, delay, context) {
    return setTimeout(function () {
        fn.call(context || this);
    }, delay);
}
function fire(fn, args) {
    if (!fn)
        return;
    if (isset(args) && !Array.isArray(args)) {
        args = [args];
    }
    if (typeof (fn) == "function") {
        fn.apply(this, args);
    }
    else {
        fn.fn.apply(fn.context || this, args);
    }
}
/**
*
*/
function CString(obj) {
    return isset(obj) ? String(obj).toString() : "";
}
if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}
/**
*
* @param obj
* @return
*/
function is_string(obj) {
    return typeof (obj) == "string";
}
/**
*
* @param obj
* @return
*/
function is_numeric(obj) {
    if (is_string(obj)) {
        if (obj.trim() == '') {
            return false;
        }
    }
    return !isNaN(Number(obj));
}
