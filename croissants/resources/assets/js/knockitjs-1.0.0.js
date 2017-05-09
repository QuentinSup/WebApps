(function (ko) {
    ko.utils.isObservableArray = function (obj) {
        return ko.isObservable(obj) && obj.destroyAll !== undefined;
    },
        ko.utils.dispose = function (obj) {
            if (obj != null) {
                if (ko.isObservable(obj)) {
                    if (ko.isComputed(obj)) {
                        obj.dispose();
                    }
                    ko.utils.dispose(obj());
                }
                else if ($.isArray(obj)) {
                    for (var i = 0, length = obj.length; i < length; i++) {
                        ko.utils.dispose(obj[i]);
                    }
                    obj.length = 0;
                }
                else if (typeof (obj) == 'object') {
                    if (typeof (obj.dispose) == 'function') {
                        obj.dispose();
                    }
                }
            }
        },
        ko.observableArray.fn.filterByProperty = function (propName, matchValue) {
            var allItems, matchingItems;
            allItems = this();
            matchingItems = ko.observableArray([]);
            for (var i = 0; i < allItems.length; i++) {
                var current = allItems[i];
                if (ko.utils.unwrapObservable(current[propName]) === matchValue)
                    matchingItems.push(current);
            }
            return matchingItems;
        };
    var subscribeOnce = function (observable, callback, context, eventName) {
        var subscription = observable.subscribe(function (v) {
            callback.call(context || this, v);
            subscription.dispose();
        }, observable, eventName);
        return subscription;
    };
    ko.observable.fn.subscribeOnce = function (callback, context) {
        return subscribeOnce(this, callback, context);
    };
    ko.observable.fn.immediateSubscribe = ko.computed.fn.immediateSubscribe = function (callback, context, eventName) {
        var subscription = this.subscribe(callback, context || this, eventName);
        callback.call(context || this, this());
        return subscription;
    };
    ko.observable.fn.makeTrueIfNot = function (observable, ope) {
        this.dependsOn(observable, function (b) { return !b; }, ope);
    };
    ko.observable.fn.dependsOn = function (observable, fn, ope) {
        if (!this.__dependencies) {
            this.__dependencies = {
                _computed: null,
                all: ko.observableArray([])
            };
            this.__dependencies._computed = ko.computed(function () {
                var dependenciesArray = this.__dependencies.all();
                var r = null;
                for (var i = 0, len = dependenciesArray.length; i < len; i++) {
                    var dependencyObservable = dependenciesArray[i];
                    var rt = dependencyObservable.fn(dependencyObservable.obs());
                    if (dependencyObservable.ope == 0) {
                        r = r || rt;
                    }
                    else {
                        r = r && rt;
                    }
                }
                return r;
            }, this);
            this.__dependencies._computed.subscribe(function (b) {
                if (isset(b)) {
                    this(b);
                }
            }, this);
        }
        if (typeof (fn) != 'function') {
            fn = function (v) { return v; };
        }
        this.__dependencies.all.push({
            obs: observable,
            fn: fn,
            ope: ope || 0
        });
        return;
    };
})(ko);
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
String.prototype.random = function (length) {
    if (length === void 0) { length = 10; }
    var text = "";
    for (var i = 0; i < length; i++) {
        text += this.charAt(Math.floor(Math.random() * this.length));
    }
    return text;
};
String.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return sprintf.apply(this, [this].concat(args));
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
    return this.replace(new RegExp('\\' + strToReplace + '+', 'g'), str);
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
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsTags = /<!--[\s\S]*?-->/gi;
    return this
        .replace(commentsTags, '')
        .replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
};
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
            this.setDate(this.getDate() + n);
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
    var len = this.length;
    var i = from < 0 ? Math.max(0, len + from) : from;
    var str = elt.toLowerCase();
    for (; i < len; i++) {
        if ((typeof (this[i]) == 'string') && this[i].toLowerCase() == str) {
            return i;
        }
    }
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
Array.prototype.remove = function (o) {
    var index = this.indexOf(o);
    if (index != -1) {
        return this.splice(index, 1);
    }
    return null;
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
Number.prototype.round = function (decimal) {
    if (decimal === void 0) { decimal = 2; }
    return Number(Number(this).toFixed(decimal));
};
var kit;
(function (kit) {
    var utils;
    (function (utils) {
        var _flattenObject = function (result, object, prefix) {
            for (var prop in object) {
                var key = prop;
                var value = object[key];
                if (typeof value == "object") {
                    _flattenObject(result, value, key + ".");
                }
                else if ((typeof value == "string") && value.indexOf("{") == 0) {
                    try {
                        value = JSON.parse(value);
                        _flattenObject(result, value, key + ".");
                    }
                    catch (e) {
                        result[prefix + key] = value;
                    }
                }
                else {
                    result[prefix + key] = value;
                }
            }
        };
        function clone(srcInstance) {
            if (typeof (srcInstance) != 'object' || srcInstance == null) {
                return srcInstance;
            }
            var newInstance = new srcInstance.constructor();
            for (var i in srcInstance) {
                newInstance[i] = clone(srcInstance[i]);
            }
            return newInstance;
        }
        utils.clone = clone;
        function getElementText(element) {
            if (!element)
                return null;
            var text = element.text;
            if (text !== undefined) {
                return text;
            }
            text = element.textContent;
            if (text !== undefined) {
                return text;
            }
            return element.nodeValue;
        }
        utils.getElementText = getElementText;
        function formatEmail(email) {
            var t = email.split('@');
            return t[0].substr(0, 64).replace(/[^.a-zA-Z0-9!#$%&'*_+-/=?^`{|}~]/g, '_') + (t[1] ? '@' + t[1] : '');
        }
        utils.formatEmail = formatEmail;
        function formatString(str, parameters) {
            var formatted, match, re, remaining, needToTraduce;
            formatted = str;
            needToTraduce = false;
            remaining = str;
            re = new RegExp("\\$(?:\\{(\\!{0,1}(\\w|\\.)+)\\}|(\\!{0,1}(\\w|\\.)+))", "");
            match = re.exec(remaining);
            while (match) {
                var param = match[1];
                if (param && param.startsWith('!')) {
                    param = param.substring(1);
                    needToTraduce = true;
                }
                var value = ko.unwrap(parameters[param]);
                if (isset(value)) {
                    if (needToTraduce) {
                        value = app.i18n.getString(value, value);
                    }
                    formatted = formatted.replace(match[0], value);
                }
                remaining = remaining.substring(match[0].length);
                match = re.exec(remaining);
            }
            return formatted;
        }
        utils.formatString = formatString;
        function flattenObject(object) {
            var result = {};
            _flattenObject(result, object, "");
            return result;
        }
        utils.flattenObject = flattenObject;
        function parseLogMessage(logMessage) {
            var obj = {
                id: null,
                parameters: {}
            };
            var parameters = {};
            var indexFirstBraket;
            var indexSecondBraket;
            indexFirstBraket = logMessage.indexOf("{");
            indexSecondBraket = logMessage.indexOf("}");
            if (indexFirstBraket > 0 && indexSecondBraket > 0 && indexFirstBraket < indexSecondBraket) {
                obj.id = logMessage.substr(0, indexFirstBraket).trim();
                var current = logMessage;
                while ((indexFirstBraket >= 0) && (indexSecondBraket > 0) && (indexFirstBraket < indexSecondBraket)) {
                    if (indexSecondBraket - indexFirstBraket > 1) {
                        var parameter = current.substr(indexFirstBraket + 1, (indexSecondBraket - indexFirstBraket - 1)).trim();
                        var temp = parameter.split(":", 2);
                        parameters[temp[0]] = temp[1];
                    }
                    if (indexSecondBraket == current.length) {
                        break;
                    }
                    else {
                        current = current.substr(indexSecondBraket + 1);
                        indexFirstBraket = current.indexOf("{");
                        indexSecondBraket = current.indexOf("}");
                    }
                }
            }
            else {
                obj.id = logMessage.trim();
            }
            obj.parameters = parameters;
            return obj;
        }
        utils.parseLogMessage = parseLogMessage;
        function getInternationalizedLogMessage(logMessage) {
            var message;
            var jsonObject;
            try {
                jsonObject = JSON.parse(logMessage);
                var log = parseLogMessage(jsonObject.errorMessage);
                var translated_message = app.i18n.getString(log.id);
                if (translated_message) {
                    message = formatString(translated_message, log.parameters);
                }
                else {
                    message = log.id;
                }
            }
            catch (e) {
                message = e.message;
            }
            return message;
        }
        utils.getInternationalizedLogMessage = getInternationalizedLogMessage;
        function getParamValue(param, url) {
            var u = url == undefined ? document.location.href : url;
            var reg = new RegExp('(\\?|&|^)' + param + '=(.*?)(&|$)');
            var matches = u.match(reg);
            if (matches) {
                return matches[2] != undefined ? decodeURIComponent(matches[2]).replace(/\+/g, ' ') : '';
            }
            return '';
        }
        utils.getParamValue = getParamValue;
        function formatMonthToYear(PE_nbMonth, strict) {
            if (strict === void 0) { strict = true; }
            var sRetour_ = "";
            var iNbMois12_ = parseInt("" + (PE_nbMonth / 12));
            if (iNbMois12_ <= 1) {
                sRetour_ = iNbMois12_ + " " + app.i18n.getString('year');
            }
            else {
                sRetour_ = iNbMois12_ + " " + app.i18n.getString('years');
            }
            if (!strict && PE_nbMonth % 12 != 0) {
                sRetour_ += " " + app.i18n.getString('and') + " " + (PE_nbMonth % 12) + " " + app.i18n.getString('month');
            }
            return sRetour_;
        }
        utils.formatMonthToYear = formatMonthToYear;
        function formatDate(d, dateFormat, hourFormat, utc) {
            if (hourFormat === void 0) { hourFormat = ""; }
            if (utc === void 0) { utc = false; }
            if (!d)
                return null;
            var get2digits = function (num) {
                return num.toString().lPad('0', 2);
            };
            var getLiteralMonth = function (monthNumber) {
                var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                return app.i18n.getString(months[monthNumber]);
            };
            var getLiteralDay = function (dayNumber) {
                var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                return app.i18n.getString(days[dayNumber]);
            };
            var iFullYear_;
            var iMonth_;
            var iDay_;
            var iDate_;
            var iHours_;
            var iMinutes_;
            var iSeconds_;
            if (utc) {
                iFullYear_ = d.getUTCFullYear();
                iMonth_ = d.getUTCMonth();
                iDate_ = d.getUTCDate();
                iDay_ = d.getUTCDay();
                iHours_ = d.getUTCHours();
                iMinutes_ = d.getUTCMinutes();
                iSeconds_ = d.getUTCSeconds();
            }
            else {
                iFullYear_ = d.getFullYear();
                iMonth_ = d.getMonth();
                iDate_ = d.getDate();
                iDay_ = d.getDay();
                iHours_ = d.getHours();
                iMinutes_ = d.getMinutes();
                iSeconds_ = d.getSeconds();
            }
            dateFormat = dateFormat.toLowerCase();
            dateFormat = dateFormat.replace('yyyy', iFullYear_.toString());
            var monthType = null, dayType = null;
            if (dateFormat.indexOf('month') != -1) {
                monthType = 'month';
                dateFormat = dateFormat.replace('month', '{0}');
            }
            else if (dateFormat.indexOf('mm') != -1) {
                monthType = 'mm';
                dateFormat = dateFormat.replace('mm', '{0}');
            }
            else if (dateFormat.indexOf('m') != -1) {
                monthType = 'm';
                dateFormat = dateFormat.replace('m', '{0}');
            }
            if (dateFormat.indexOf('day') != -1) {
                dayType = 'day';
                dateFormat = dateFormat.replace('day', '{1}');
            }
            else if (dateFormat.indexOf('dd') != -1) {
                dayType = 'dd';
                dateFormat = dateFormat.replace('dd', '{1}');
            }
            else if (dateFormat.indexOf('d') != -1) {
                dayType = 'd';
                dateFormat = dateFormat.replace('d', '{1}');
            }
            if (monthType == 'month') {
                dateFormat = dateFormat.replace('{0}', getLiteralMonth(iMonth_));
            }
            else if (monthType == 'mm') {
                dateFormat = dateFormat.replace('{0}', get2digits(iMonth_ + 1));
            }
            else if (monthType == 'm') {
                dateFormat = dateFormat.replace('{0}', String(iMonth_ + 1));
            }
            if (dayType == 'day') {
                dateFormat = dateFormat.replace('{1}', getLiteralDay(iDay_) + ' ' + iDate_.toString());
            }
            else if (dayType == 'dd') {
                dateFormat = dateFormat.replace('{1}', get2digits(iDate_));
            }
            else if (dayType == 'd') {
                dateFormat = dateFormat.replace('{1}', String(iDate_));
            }
            if (dateFormat.indexOf('hh') > -1) {
                dateFormat = dateFormat.replace('hh', get2digits(iHours_));
            }
            if (dateFormat.indexOf('mm') > -1) {
                dateFormat = dateFormat.replace('mm', get2digits(iMinutes_));
            }
            if (dateFormat.indexOf('ss') > -1) {
                dateFormat = dateFormat.replace('ss', get2digits(iSeconds_));
            }
            var hours = '';
            if (hourFormat.toLowerCase() == 'h12') {
                var suffix = ' AM';
                hours = get2digits(iHours_);
                if (iHours_ >= 12) {
                    suffix = ' PM';
                    if (iHours_ != 12) {
                        hours = get2digits(iHours_ - 12);
                    }
                }
                else {
                    if (hours == '00') {
                        hours = '12';
                    }
                }
                hours += ':' + get2digits(iMinutes_) + ':' + get2digits(iSeconds_) + suffix;
            }
            else if (hourFormat.toLowerCase() == 'h24') {
                hours = get2digits(iHours_) + ':' + get2digits(iMinutes_) + ':' + get2digits(iSeconds_);
            }
            if (hours) {
                return dateFormat + ' ' + hours;
            }
            else {
                return dateFormat;
            }
        }
        utils.formatDate = formatDate;
        function parseLiteralDate(str, locale) {
            if (!str)
                return null;
            var sValue_ = str;
            var iJour_ = 0;
            var iMois_ = 1;
            var iAnnee_ = 2;
            var iMarge_ = 50;
            var tsDate_ = sValue_.split(locale.dateSeparator);
            if (tsDate_.length == 1) {
                if ([4, 6, 8].contains(sValue_.length)) {
                    tsDate_ = [, ,];
                    var sPosDay_ = locale.dateLiteralFormat.indexOf('D');
                    var sPosMonth_ = locale.dateLiteralFormat.indexOf('M');
                    var sPosYear_ = locale.dateLiteralFormat.indexOf('Y');
                    var sLengthYear_ = Math.abs(8 - sValue_.length - 4);
                    if (sLengthYear_ > 0) {
                        if (sPosYear_ == 0) {
                            tsDate_[iAnnee_] = sValue_.substr(0, sLengthYear_);
                        }
                        else if (sPosYear_ == 1) {
                            tsDate_[iAnnee_] = sValue_.substr(2, sLengthYear_);
                        }
                        else {
                            tsDate_[iAnnee_] = sValue_.substr(4, sLengthYear_);
                        }
                    }
                    if (sPosDay_ == 0) {
                        tsDate_[iJour_] = sValue_.substr(0, 2);
                    }
                    else if (sPosDay_ == 1) {
                        if (sPosYear_ == 0) {
                            tsDate_[iJour_] = sValue_.substr(sLengthYear_, 2);
                        }
                        else {
                            tsDate_[iJour_] = sValue_.substr(2, 2);
                        }
                    }
                    else {
                        tsDate_[iJour_] = sValue_.substr(2 + sLengthYear_, 2);
                    }
                    if (sPosMonth_ == 0) {
                        tsDate_[iMois_] = sValue_.substr(0, 2);
                    }
                    else if (sPosMonth_ == 1) {
                        if (sPosYear_ == 0) {
                            tsDate_[iMois_] = sValue_.substr(sLengthYear_, 2);
                        }
                        else {
                            tsDate_[iMois_] = sValue_.substr(2, 2);
                        }
                    }
                    else {
                        tsDate_[iMois_] = sValue_.substr(2 + sLengthYear_, 2);
                    }
                }
            }
            else if (tsDate_.length == 2) {
                return null;
            }
            var sJour_;
            var sMois_;
            var sAnnee_;
            switch (tsDate_.length) {
                case 3:
                    sJour_ = tsDate_[iJour_];
                    sMois_ = tsDate_[iMois_];
                    sAnnee_ = tsDate_[iAnnee_];
                    break;
                case 2:
                    sJour_ = tsDate_[iJour_];
                    sMois_ = tsDate_[iMois_];
                    sAnnee_ = CString(new Date().getFullYear());
                    break;
                default:
                    return null;
            }
            if (isNaN(sJour_) || isNaN(sMois_) || isNaN(sAnnee_)) {
                return null;
            }
            var iMois_ = parseInt(sMois_, 10);
            if (iMois_ == 0) {
                iMois_ = 1;
                sMois_ = "1";
            }
            if (iMois_ > 0 && iMois_ < 13) {
                var iJourMax_ = 31;
                switch (iMois_) {
                    case 2:
                        iJourMax_ = 29;
                        break;
                    case 4:
                    case 6:
                    case 9:
                    case 11:
                        iJourMax_ = 30;
                        break;
                }
                if (parseInt(sJour_, 10) > iJourMax_) {
                    return null;
                }
            }
            else {
                return null;
            }
            sAnnee_ = sAnnee_.lPad("0", 2);
            var iAnCour_ = new Date().getFullYear();
            var iAnTemp_ = iAnCour_ - iMarge_;
            var sAnTemp_ = sAnnee_.lPad(CString(iAnTemp_).substr(0, 2), 4);
            if (parseInt(sAnTemp_, 10) < (iAnCour_ - iMarge_)) {
                sAnnee_ = sAnnee_.lPad(CString(iAnCour_).substr(0, 2), 4);
            }
            else {
                sAnnee_ = sAnTemp_;
            }
            if (parseInt(sAnnee_, 10) < 1900 || parseInt(sAnnee_, 10) > 9999) {
                return null;
            }
            return new Date(parseInt(sAnnee_, 10), parseInt(sMois_, 10) - 1, parseInt(sJour_, 10));
        }
        utils.parseLiteralDate = parseLiteralDate;
        ;
        function formatDecimal(str, digits, locale) {
            if (is_numeric(str)) {
                if (!isset(locale)) {
                    locale = app.i18n.getCurrentLocale();
                }
                var sign = "";
                if (Number(str) < 0) {
                    sign = "-";
                }
                var fvalue_ = Math.abs(Number(str));
                if (isset(digits)) {
                    fvalue_ = fvalue_.round(digits);
                }
                var sVal_ = String(fvalue_);
                var sGroupSeparator_ = locale.decimalGroupSeparator;
                var sSeparator_ = locale.decimalSeparator;
                var iGroupDigits_ = locale.decimalGroupDigits;
                sVal_ = sVal_.replace(".", sSeparator_);
                var tsVal_ = sVal_.split(sSeparator_);
                var sEnt_ = tsVal_[0];
                var sDec_ = tsVal_[1];
                if (sEnt_.length > iGroupDigits_) {
                    var iNbPart_ = Math.round(sEnt_.length / iGroupDigits_);
                    if (iNbPart_ < sEnt_.length / iGroupDigits_)
                        iNbPart_++;
                    var tsPart_ = [];
                    for (var i_ = 0; i_ < iNbPart_; i_++) {
                        tsPart_[iNbPart_ - i_ - 1] = String(sEnt_).substring(sEnt_.length - iGroupDigits_ * (i_ + 1), sEnt_.length - iGroupDigits_ * i_);
                    }
                    sEnt_ = tsPart_.join(sGroupSeparator_);
                }
                sDec_ = (sDec_ || '').rPad('0', digits);
                return sign + (sDec_.length != 0 ? sEnt_.concat(sSeparator_).concat(sDec_) : sEnt_);
            }
            return str;
        }
        utils.formatDecimal = formatDecimal;
        function genId(l) {
            if (l === void 0) { l = 10; }
            return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".random(l);
        }
        utils.genId = genId;
    })(utils = kit.utils || (kit.utils = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var regexp;
    (function (regexp) {
        regexp.CdPost = /^(([0-8][1-9]|9[0-5]|[1-9]0)[0-9]{3})|(97[1-6][0-9]{2})$/;
        regexp.Email = /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        regexp.AlphaNumerique = /^[a-z0-9 ÀÂÉÈÊËÏÎÔÖÛÙÜÇ\-']*$/i;
        regexp.Alpha = /^[a-z ÀÂÉÈÊËÏÎÔÖÛÙÜÇ\-']*$/i;
        regexp.Adresse = /^[a-z0-9 ÀÂÉÈÊËÏÎÔÖÛÙÜÇ\-',/]*$/i;
        regexp.Mots = /([A-ZÀÂÉÈÊËÏÎÔÖÛÙÜÇ])+/ig;
        regexp.Integer = /^(\-)?\d+$/;
        regexp.PositiveInteger = /^[0-9]+[0-9]*$/;
        regexp.Double = /^(\-)?((\d+(\.\d+)?))([eE]{1}([\-\+]{1})?(\d+))?$/;
        regexp.PositiveDouble = /^((\d+(\.\d+)?))([eE]{1}([\-\+]{1})?(\d+))?$/;
        regexp.NumTel = /^(0033|0|\+33)([1-7]|[9])[0-9]{8}$/;
        regexp.NumTelEtendu = /^(\(0033\)|\(\+33\)|0|0033|\+33)([ .-]?[1-7]|[9])([ .-]?[0-9]{2}){4}$/;
        regexp.NumTelPermissif = /^([0-9 \(\)\+\.]{0,17})$/;
    })(regexp = kit.regexp || (kit.regexp = {}));
})(kit || (kit = {}));
function isset(value) {
    return value != null && typeof (value) != "undefined";
}
function defer(fn, delay, context) {
    return setTimeout(function () {
        fn.call(context || this);
    }, delay);
}
function round(value, nbdec) {
    if (nbdec === void 0) { nbdec = 0; }
    return CNumber(value, nbdec);
}
function CString(obj) {
    return is_string(obj) ? obj.toString() : (String(obj).toString());
}
function CFloat(obj, rnd) {
    var float_ = parseFloat(obj);
    return isNaN(float_) ? 0 : (rnd ? round(float_, rnd) : float_);
}
function CNumber(obj, rnd) {
    var n = Number(obj);
    return isNaN(n) ? 0 : (rnd ? n.round(rnd) : n);
}
function CInt(obj) {
    var int_ = parseInt(obj);
    return isNaN(int_) ? 0 : int_;
}
function is_string(obj) {
    return typeof (obj) == "string";
}
function is_numeric(obj) {
    if (is_string(obj)) {
        if (obj.trim() == '') {
            return false;
        }
    }
    return !isNaN(Number(obj));
}
function dispose(obj) {
    ko.utils.dispose(obj);
}
var kit;
(function (kit) {
    function alert(text, callbackAlert, context, opts) {
        if (app.messageBox) {
            return app.messageBox.alert(app.title(), text, callbackAlert, context, opts);
        }
        var r = window.alert(text);
        if (callbackAlert) {
            callbackAlert.call(context, r);
        }
        return r;
    }
    kit.alert = alert;
    function confirm(text, callbackOk, callbackCancel, context, opts) {
        if (app.messageBox) {
            return app.messageBox.confirm(app.title(), text, callbackOk, callbackCancel, context, opts);
        }
        var r = window.confirm(text);
        if (r && callbackOk) {
            callbackOk.call(context, r);
        }
        if (!r && callbackCancel) {
            callbackCancel.call(context, r);
        }
        return r;
    }
    kit.confirm = confirm;
})(kit || (kit = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        (function (TLogLevel) {
            TLogLevel[TLogLevel["TRACE"] = 0] = "TRACE";
            TLogLevel[TLogLevel["DEBUG"] = 1] = "DEBUG";
            TLogLevel[TLogLevel["INFO"] = 2] = "INFO";
            TLogLevel[TLogLevel["WARN"] = 3] = "WARN";
            TLogLevel[TLogLevel["ERROR"] = 4] = "ERROR";
            TLogLevel[TLogLevel["FATAL"] = 5] = "FATAL";
        })(helpers.TLogLevel || (helpers.TLogLevel = {}));
        var TLogLevel = helpers.TLogLevel;
        var Appender = (function () {
            function Appender(level) {
                if (level === void 0) { level = TLogLevel.TRACE; }
                this.level = level;
            }
            Appender.prototype.formatMessage = function (className, date, level, message) {
                return TLogLevel[level] + ' - ' + className + ' - ' + date.toString() + ': ' + message;
            };
            return Appender;
        })();
        helpers.Appender = Appender;
        var ConsoleAppender = (function (_super) {
            __extends(ConsoleAppender, _super);
            function ConsoleAppender() {
                _super.call(this);
            }
            ConsoleAppender.prototype.log = function (className, level, message, exception, date) {
                if (date === void 0) { date = new Date(); }
                if (this.level > level) {
                    return;
                }
                var e = exception || '';
                var console = isset(window.console) ? window.console : null;
                if (isset(console)) {
                    var text = this.formatMessage(className, date, level, message);
                    if (level == TLogLevel.DEBUG && typeof (console.debug) != 'undefined') {
                        console.debug(text, e);
                        return;
                    }
                    if (level == TLogLevel.INFO && typeof (console.info) != 'undefined') {
                        console.info(text, e);
                        return;
                    }
                    if (level == TLogLevel.WARN && typeof (console.warn) != 'undefined') {
                        console.warn(text, e);
                        return;
                    }
                    if (level == TLogLevel.ERROR && typeof (console.error) != 'undefined') {
                        console.error(text, e);
                        return;
                    }
                    if (level == TLogLevel.FATAL && typeof (console.error) != 'undefined') {
                        console.error(text, e);
                        return;
                    }
                    if (typeof (console.log) != 'undefined') {
                        console.log(text, e);
                        return;
                    }
                }
            };
            return ConsoleAppender;
        })(Appender);
        helpers.ConsoleAppender = ConsoleAppender;
        var RemoteAppender = (function (_super) {
            __extends(RemoteAppender, _super);
            function RemoteAppender(url) {
                _super.call(this);
                this.url = url;
            }
            RemoteAppender.prototype.log = function (className, level, message, exception, date) {
                if (date === void 0) { date = new Date(); }
                if (this.level <= level) {
                    var e = exception || '';
                    var text = this.formatMessage(className, date, level, message);
                    helpers.Query.PUT(this.url, { date: date.getUTCTime(), className: className, level: level, message: text, originalMessage: message, exception: e }, null, this, { silent: true });
                }
            };
            return RemoteAppender;
        })(Appender);
        helpers.RemoteAppender = RemoteAppender;
        var Logger = (function () {
            function Logger(id, level) {
                if (level === void 0) { level = TLogLevel.INFO; }
                this.appenders = [];
                this.level = ko.observable(TLogLevel.INFO);
                this.id = null;
                this.level(level);
                this.id = id;
            }
            Logger.prototype.isTraceEnabled = function () {
                return this.level() >= TLogLevel.TRACE;
            };
            Logger.prototype.isInfoEnabled = function () {
                return this.level() >= TLogLevel.INFO;
            };
            Logger.prototype.isDebugEnabled = function () {
                return this.level() >= TLogLevel.DEBUG;
            };
            Logger.prototype.isWarnEnabled = function () {
                return this.level() >= TLogLevel.WARN;
            };
            Logger.prototype.info = function (text, e) {
                this.log(this.id, TLogLevel.INFO, text, e);
            };
            Logger.prototype.warn = function (text, e) {
                this.log(this.id, TLogLevel.WARN, text, e);
            };
            Logger.prototype.trace = function (text, e) {
                this.log(this.id, TLogLevel.TRACE, text, e);
            };
            Logger.prototype.debug = function (text, e) {
                this.log(this.id, TLogLevel.DEBUG, text, e);
            };
            Logger.prototype.error = function (text, e) {
                this.log(this.id, TLogLevel.ERROR, text, e);
            };
            Logger.prototype.fatal = function (text, e) {
                this.log(this.id, TLogLevel.FATAL, text, e);
            };
            Logger.prototype.log = function (className, level, message, exception, date) {
                if (date === void 0) { date = new Date(); }
                if ((this.level() <= level) && this.appenders) {
                    for (var i = 0, len = this.appenders.length; i < len; i++) {
                        if (this.appenders[i].level <= level) {
                            this.appenders[i].log(className, level, message, exception, date);
                        }
                    }
                }
            };
            Logger.prototype.addAppender = function (appender) {
                this.appenders.pushOnce(appender);
            };
            Logger.getLogger = function (className) {
                if (!Logger.loggers[className]) {
                    var oLogger_ = new Logger(className);
                    if (className != 'default') {
                        oLogger_.log = function (className, level, text, e) {
                            var oLogger = Logger.getDefaultLogger();
                            if (oLogger) {
                                oLogger.log(className, level, text, e);
                            }
                        };
                    }
                    Logger.loggers[className] = oLogger_;
                }
                return Logger.loggers[className];
            };
            Logger.getDefaultLogger = function () {
                return Logger.getLogger('default');
            };
            Logger.getConsoleAppender = function () {
                return new ConsoleAppender();
            };
            Logger.loggers = {};
            return Logger;
        })();
        helpers.Logger = Logger;
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var log = helpers.Logger.getLogger('kit.helpers');
        var _timer = null;
        var _hInstances = {};
        var _hInstanceCounter = 0;
        var _currentStackRequests = {};
        var _requestCount = 0;
        var Query = (function () {
            function Query(id, opts) {
                this.GETasJson = function (url, callbacks, context, opts) {
                    return Query.GETasJson(url, callbacks, context, this.mergeOptions(opts));
                };
                this.id = id;
                this.opts = opts;
            }
            Query.getCurrentStackRequests = function () {
                return _currentStackRequests;
            };
            Query.prototype.PUT = function (url, data, callbacks, context, opts) {
                return Query.PUT(url, data, callbacks, context, this.mergeOptions(opts));
            };
            Query.prototype.GET = function (url, callbacks, context, opts) {
                return Query.GET(url, callbacks, context, this.mergeOptions(opts));
            };
            Query.prototype.POST = function (url, data, callbacks, context, opts) {
                return Query.POST(url, data, callbacks, context, this.mergeOptions(opts));
            };
            Query.prototype.DELETE = function (url, callbacks, context, opts) {
                return Query.DELETE(url, callbacks, context, this.mergeOptions(opts));
            };
            Query.prototype.mergeOptions = function (opts) {
                var tmp = $.extend({}, this.opts);
                return $.extend(tmp, opts || {});
            };
            Query.create = function (id, opts) {
                if (typeof (id) == 'object' && opts == undefined) {
                    opts = id;
                    id = 'helper' + ++_hInstanceCounter;
                }
                if (opts == undefined) {
                    return _hInstances[id];
                }
                else {
                    _hInstances[id] = new Query(id, opts);
                    return _hInstances[id];
                }
            };
            Query.query = function (method, url, data, callbacks, context, opts) {
                if (callbacks === void 0) { callbacks = {}; }
                if (opts === void 0) { opts = {}; }
                if (Query.isLocked()) {
                    if (log.isWarnEnabled()) {
                        log.warn("Query is locked: request '%s %s' has not been sent".format(method, url));
                    }
                    return;
                }
                method = (method || 'GET').toUpperCase();
                var options = {
                    silent: false,
                    async: true,
                    delay: Query.DEFAULT_DELAY,
                    contentType: 'application/json;charset=utf-8'
                };
                options = $.extend(options, Query.defaultOptions);
                opts = $.extend(options, opts);
                if (!opts.silent) {
                    if (Query.nbQueries() == 0) {
                        _timer = setTimeout(function () {
                            if (Query.nbQueries() > 0) {
                                if (log.isInfoEnabled()) {
                                    log.info('Inform that Query processes are busy (delay: %s)'.format(opts.delay));
                                }
                                Query.isBusy(true);
                            }
                        }, opts.delay);
                    }
                    var nb = Query.nbQueries() + 1;
                    Query.nbQueries(nb);
                    if (log.isTraceEnabled()) {
                        log.trace('Current query processes is now'.format(nb));
                    }
                }
                if (typeof (callbacks) == 'function') {
                    callbacks = {
                        complete: callbacks
                    };
                }
                callbacks = $.extend({
                    success: function () { },
                    fail: function () { },
                    complete: function () { }
                }, callbacks);
                data = data || {};
                data._timestamp = opts.upToDate ? "" + new Date().getTime() : undefined;
                if (opts.domain) {
                    if (url.indexOf('?') <= 0) {
                        url = url + "?";
                    }
                    else {
                        url = url + "&";
                    }
                    url = url + "_domain=" + opts.domain;
                }
                _requestCount++;
                var currentRequest = {
                    ID: _requestCount,
                    method: method,
                    url: url,
                    data: data,
                    callbacks: callbacks,
                    context: context,
                    options: opts,
                    startedAt: new Date().getTime()
                };
                _currentStackRequests[currentRequest.ID] = currentRequest;
                if (method == Query.Methods.POST || method == Query.Methods.PUT) {
                    data = (data && data != {}) ? JSON.stringify(data) : null;
                }
                var params = {
                    type: method,
                    url: url,
                    data: data,
                    async: opts.async,
                    dataType: opts.dataType,
                    contentType: opts.contentType,
                    context: currentRequest,
                    cache: null,
                    timeout: null
                };
                if (opts.cache != undefined && opts.cache != null) {
                    params.cache = opts.cache;
                }
                if (opts.timeout != undefined && !isNaN(opts.timeout)) {
                    params.timeout = opts.timeout;
                }
                if (log.isTraceEnabled()) {
                    log.trace("Send request '%s %s'".format(method, url), params);
                }
                var jqXHR = $.ajax(params);
                jqXHR.done(function (data, textStatus, jqXHR) {
                    if (this.callbacks.success) {
                        this.callbacks.success.call(this.context, data, textStatus, jqXHR);
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (this.callbacks.fail) {
                        this.callbacks.fail.call(this.context, data, textStatus, jqXHR);
                    }
                }).always(function (data, textStatus, jqXHR) {
                    delete _currentStackRequests[this.ID];
                    if (!this.options.silent) {
                        var nb = Query.nbQueries() - 1;
                        Query.nbQueries(nb);
                        if (log.isTraceEnabled()) {
                            log.trace('Current query processes is now %s'.format(nb));
                        }
                        if (Query.nbQueries() == 0) {
                            clearTimeout(_timer);
                            _timer = null;
                            Query.isBusy(false);
                            if (log.isInfoEnabled()) {
                                log.info('Query processes are no longer busy');
                            }
                        }
                    }
                    if (textStatus == Query.Status.NOCONTENT) {
                        textStatus = Query.Status.SUCCESS;
                    }
                    if (textStatus == Query.Status.ERROR) {
                        if ($.inArray(data.status, [0, 12029, 12007]) != -1) {
                            Query.isDisconnected(true);
                        }
                    }
                    if (textStatus == Query.Status.SUCCESS && Query.isDisconnected()) {
                        Query.isDisconnected(false);
                    }
                    if (this.callbacks.complete) {
                        this.callbacks.complete.call(this.context, data, textStatus, jqXHR);
                    }
                });
                return jqXHR;
            };
            Query.PUT = function (url, data, callbacks, context, opts) {
                return Query.query(Query.Methods.PUT, url, data, callbacks, context, opts);
            };
            Query.GET = function (url, callbacks, context, opts) {
                return Query.query(Query.Methods.GET, url, null, callbacks, context, opts);
            };
            Query.GETasJson = function (url, callbacks, context, opts) {
                opts = opts || {};
                opts.dataType = 'json';
                return Query.GET(url, callbacks, context, opts);
            };
            Query.POST = function (url, data, callbacks, context, opts) {
                return Query.query(Query.Methods.POST, url, data, callbacks, context, opts);
            };
            Query.DELETE = function (url, callbacks, context, opts) {
                return Query.query(Query.Methods.DELETE, url, null, callbacks, context, opts);
            };
            Query.defaultOptions = {};
            Query.DEFAULT_DELAY = 500;
            Query.nbQueries = ko.observable(0);
            Query.isBusy = ko.observable(false);
            Query.isDisconnected = ko.observable(false);
            Query.isLocked = ko.observable(false);
            Query.Status = {
                SUCCESS: 'success',
                ERROR: 'error',
                ABORT: 'abort',
                NOCONTENT: 'nocontent',
                TIMEOUT: 'timeout'
            };
            Query.Methods = {
                PUT: 'PUT',
                GET: 'GET',
                POST: 'POST',
                DELETE: 'DELETE'
            };
            Query.States = {
                REJECTED: 'rejected'
            };
            return Query;
        })();
        helpers.Query = Query;
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var checkLocalStorage = function () {
            if (window.localStorage) {
                return true;
            }
            if (console && console.warn) {
                console.warn('LocaleStorage is not defined. Update your browser to fix this issue');
            }
            return false;
        };
        var Storage = (function () {
            function Storage() {
            }
            Storage.put = function (name, value, opts) {
                if (!checkLocalStorage()) {
                    return false;
                }
                opts = $.extend({}, opts);
                if (opts.crypt) {
                    value = $().crypt({
                        method: 'b64enc',
                        source: value
                    });
                }
                localStorage[name] = String(value);
                return true;
            };
            Storage.putObject = function (name, json, opts) {
                return Storage.put(name, JSON.stringify(Object.toJson(json)), opts);
            };
            Storage.read = function (name, opts) {
                if (!checkLocalStorage()) {
                    return;
                }
                opts = $.extend({}, opts);
                var value = localStorage[name];
                if (value && opts.crypt) {
                    value = $().crypt({
                        method: 'b64dec',
                        source: value
                    });
                }
                return value;
            };
            Storage.remove = function (name) {
                if (!checkLocalStorage()) {
                    return false;
                }
                if ($.isArray(name)) {
                    $.each(name, function (index, id) {
                        localStorage.removeItem(id);
                    });
                }
                else {
                    localStorage.removeItem(name);
                }
                return true;
            };
            Storage.readAsObject = function (name, opts) {
                var json = Storage.read(name, opts);
                try {
                    return JSON.parse(json);
                }
                catch (e) {
                    return {};
                }
            };
            Storage.readAsNumber = function (name, opts) {
                var num = Storage.read(name, opts);
                return Number(num);
            };
            return Storage;
        })();
        helpers.Storage = Storage;
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var browser;
        (function (browser) {
            var UNKNOWN = "Unknown";
            var dataOS = [{
                    pattern: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                }, {
                    pattern: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                }, {
                    pattern: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                }, {
                    pattern: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }];
            var dataBrowser = [{
                    pattern: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                }, {
                    pattern: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                }, {
                    pattern: navigator['vendor'],
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                }, {
                    prop: window['opera'],
                    identity: "Opera",
                    versionSearch: "Version"
                }, {
                    pattern: navigator['vendor'],
                    subString: "iCab",
                    identity: "iCab"
                }, {
                    pattern: navigator['vendor'],
                    subString: "KDE",
                    identity: "Konqueror"
                }, {
                    pattern: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                }, {
                    pattern: navigator['vendor'],
                    subString: "Camino",
                    identity: "Camino"
                }, {
                    pattern: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                }, {
                    pattern: navigator.userAgent,
                    subString: "IEMobile",
                    identity: "IEMobile",
                    versionSearch: "rv"
                }, {
                    pattern: navigator.userAgent,
                    subString: "Trident/",
                    identity: "Explorer",
                    versionSearch: "rv"
                }, {
                    pattern: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                }, {
                    pattern: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                }, {
                    pattern: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }];
            browser.getBrowserLanguage = function () {
                var browserLanguage = navigator['language'];
                if (!browserLanguage) {
                    browserLanguage = navigator.userLanguage;
                }
                return browserLanguage;
            };
            var BrowserInfo = (function () {
                function BrowserInfo() {
                    this.browser = this.searchString(dataBrowser) || UNKNOWN;
                    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || -1;
                    this.OS = this.searchString(dataOS) || UNKNOWN;
                    this.language = browser.getBrowserLanguage();
                    this.countryCode = this.language.substr(0, this.language.indexOf('-')) || this.language;
                }
                BrowserInfo.prototype.isProbablyModernUI = function () {
                    var isIE = (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0);
                    function isActiveXEnabled() {
                        var supported = null;
                        try {
                            supported = !!new ActiveXObject("htmlfile");
                        }
                        catch (e) {
                            supported = false;
                        }
                        return supported;
                    }
                    function isFullScreen() {
                        return (window.innerWidth == screen.width && window.innerHeight == screen.height);
                    }
                    return isIE && !isActiveXEnabled() && isFullScreen();
                };
                BrowserInfo.prototype.searchString = function (data) {
                    for (var i = 0; i < data.length; i++) {
                        var dataString = data[i].pattern;
                        var dataProp = data[i].prop;
                        this.versionSearchString = data[i].versionSearch || data[i].identity;
                        if (dataString) {
                            if (dataString.indexOf(data[i].subString) != -1) {
                                return data[i].identity;
                            }
                        }
                        else if (dataProp) {
                            return data[i].identity;
                        }
                    }
                };
                BrowserInfo.prototype.searchVersion = function (dataString) {
                    var index = dataString.indexOf(this.versionSearchString);
                    if (index == -1)
                        return;
                    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
                };
                return BrowserInfo;
            })();
            browser.BrowserInfo = BrowserInfo;
        })(browser = helpers.browser || (helpers.browser = {}));
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
/// <reference path="./classes/BrowserInfo.class.ts"/>
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var browser;
        (function (browser) {
            var IS_BROWSER_SUPPORTED = "isBrowserSupported";
            var IS_BROWSER_VERSION_SUPPORTED = "isBrowserVersionSupported";
            var browserInfos = new browser.BrowserInfo();
            browser.getSupportedBrowsersInfo = function () {
                return browserLocaleInfos["Browsers"];
            };
            var getSupportedResultForCurrentBrowser = function () {
                var currentBrowserInfos = browser.getBrowserInfos();
                var currentBrowser = currentBrowserInfos.browser;
                var currentBrowserVersion = currentBrowserInfos.version;
                var currentBrowserSupportedResult = getSupportedResultForBrowser(currentBrowser, currentBrowserVersion);
                return currentBrowserSupportedResult;
            };
            var getSupportedResultForBrowser = function (browserName, version) {
                var supportedResult = {};
                supportedResult[IS_BROWSER_SUPPORTED] = false;
                supportedResult[IS_BROWSER_VERSION_SUPPORTED] = false;
                var supportedBrowsersInfo = browser.getSupportedBrowsersInfo();
                var browserInfo = null;
                var len = browser.getSupportedBrowsersInfo().length;
                var from = 0;
                for (; from < len; from++) {
                    if (from in supportedBrowsersInfo && supportedBrowsersInfo[from].name == browserName) {
                        browserInfo = supportedBrowsersInfo[from];
                        break;
                    }
                }
                if (browserInfo != null) {
                    supportedResult[IS_BROWSER_SUPPORTED] = true;
                    var browserSupportedMinVersion = browserInfo.minVersion;
                    if (version >= browserSupportedMinVersion) {
                        supportedResult[IS_BROWSER_VERSION_SUPPORTED] = true;
                    }
                }
                return supportedResult;
            };
            browser.getBrowserInfos = function () {
                return browserInfos;
            };
            browser.check = function () {
                var browserSupportedInfo = getSupportedResultForCurrentBrowser();
                var isBrowserSupported = browserSupportedInfo[IS_BROWSER_SUPPORTED];
                var isNotSupportedMessageToBeDisplayed = false;
                var notificationMessage = "";
                var browserLanguage = browserInfos.countryCode;
                var browserLocaleInfos_ = browserLocaleInfos["Locales"][browserLanguage] || browserLocaleInfos["Locales"]["en"];
                if (!isBrowserSupported) {
                    isNotSupportedMessageToBeDisplayed = true;
                    var supportedBrowsersInfos = browser.getSupportedBrowsersInfo();
                    var supportedBrowsersString = "";
                    var browserInfo;
                    var listLength = supportedBrowsersInfos.length;
                    for (var i = 0; i < listLength; i++) {
                        if (i > 0) {
                            supportedBrowsersString += ", ";
                        }
                        browserInfo = supportedBrowsersInfos[i];
                        supportedBrowsersString += browserInfo.name;
                        supportedBrowsersString += " ";
                        supportedBrowsersString += browserInfo.minVersion;
                    }
                    notificationMessage = browserLocaleInfos_.unsupportedBrowserMsg + "\n\n" + supportedBrowsersString;
                }
                else {
                    var isBrowserVersionSupported = browserSupportedInfo[IS_BROWSER_VERSION_SUPPORTED];
                    if (!isBrowserVersionSupported) {
                        isNotSupportedMessageToBeDisplayed = true;
                        notificationMessage = browserLocaleInfos_.unsupportedBrowserVersionMsg;
                    }
                }
                if (isNotSupportedMessageToBeDisplayed) {
                    kit.alert(notificationMessage);
                }
            };
        })(browser = helpers.browser || (helpers.browser = {}));
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var oLogger_ = helpers.Logger.getLogger('kit.helpers');
        function loadResource(resource, callback, context) {
            if (oLogger_.isTraceEnabled()) {
                oLogger_.trace("Chargement de la ressource %s".format(resource));
            }
            var callbackHandler = function (text, status) {
                if (status == "success") {
                    if (oLogger_.isDebugEnabled()) {
                        oLogger_.debug("Chargement réussi de la ressource %s".format(resource));
                    }
                    if (callback) {
                        callback.call(context || this, text);
                    }
                }
                else {
                    oLogger_.error("Erreur lors du chargement de la ressource %s".format(resource));
                }
            };
            helpers.Query.GET(app.servicesPath + resource, callback, context, { silent: true });
        }
        helpers.loadResource = loadResource;
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var helpers;
    (function (helpers) {
        var XmlConverter = (function () {
            function XmlConverter() {
            }
            XmlConverter.toJson = function (xml) {
                var attributes, childNodes, json;
                json = {};
                switch (xml.nodeType) {
                    case 1:
                        if (xml.attributes.length > 0) {
                            attributes = json[XmlConverter.ATTRIBUTES_KEY] = {};
                            $.each(xml.attributes, function (index, nodeAttribute) {
                                attributes[nodeAttribute.nodeName] = nodeAttribute.nodeValue;
                            });
                        }
                        else if (xml.childNodes.length == 1 && xml.childNodes.item(0).nodeType == 3) {
                            return xml.childNodes.item(0).nodeValue;
                        }
                        break;
                    case 3:
                        json = xml.nodeValue;
                        break;
                }
                if (xml.hasChildNodes()) {
                    childNodes = json;
                    $.each(xml.childNodes, function (index, childNode) {
                        var nodeName = childNode.nodeName;
                        if (nodeName == "#text") {
                            return;
                        }
                        if (typeof (childNodes[nodeName]) == "undefined") {
                            childNodes[nodeName] = XmlConverter.toJson(childNode);
                        }
                        else {
                            if (typeof (childNodes[nodeName].push) == "undefined") {
                                var old = childNodes[nodeName];
                                childNodes[nodeName] = [];
                                childNodes[nodeName].push(old);
                            }
                            childNodes[nodeName].push(XmlConverter.toJson(childNode));
                        }
                    });
                }
                return json;
            };
            XmlConverter.ATTRIBUTES_KEY = "_attributes_";
            return XmlConverter;
        })();
        helpers.XmlConverter = XmlConverter;
    })(helpers = kit.helpers || (kit.helpers = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var AppManager = (function () {
        function AppManager() {
            this._managers = {};
            this._binders = [];
            this._isRunningLock = false;
            this._unsynchronized = false;
        }
        AppManager.prototype.checkBinders = function () {
            var _this = this;
            if (this._isRunningLock) {
                this._unsynchronized = true;
                return;
            }
            this._unsynchronized = false;
            this._isRunningLock = true;
            var i = 0;
            do {
                var binder = this._binders[i];
                if (binder) {
                    var j = 0;
                    do {
                        var manager = this.exists(binder.managers[j]);
                        if (manager && (!binder.ifReady || manager.isReady())) {
                            binder.arguments[binder.indexes.indexOf(binder.managers[j])] = manager;
                            binder.managers.remove(binder.managers[j]);
                        }
                        else {
                            j++;
                        }
                    } while (j < binder.managers.length);
                    if (binder.managers.length == 0) {
                        binder.fn.apply(binder.context, binder.arguments);
                        this._binders.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                }
            } while (i < this._binders.length);
            this._isRunningLock = false;
            if (this._unsynchronized) {
                defer(function () { _this.checkBinders(); });
            }
        };
        AppManager.prototype.register = function (managerId, manager) {
            var _this = this;
            this._managers[managerId] = manager;
            manager.on('ready', function () {
                _this.checkBinders();
            }, manager);
            this.checkBinders();
            return manager;
        };
        AppManager.prototype.exists = function (managerId) {
            var m = this._managers[managerId];
            return m;
        };
        AppManager.prototype.get = function (managerId) {
            var m = this.exists(managerId);
            if (!m) {
                throw 'Manager not found : ' + managerId;
            }
            return m;
        };
        AppManager.prototype.addBinder = function (managerId, fn, context, ifReady) {
            if (!$.isArray(managerId)) {
                managerId = [managerId];
            }
            this._binders.push({
                managers: [].concat(managerId),
                indexes: managerId,
                arguments: [],
                fn: fn,
                context: context,
                ifReady: ifReady
            });
            this.checkBinders();
        };
        AppManager.prototype.ready = function (managerId, fn, context) {
            this.addBinder(managerId, fn, context, true);
        };
        AppManager.prototype.require = function (managerId, fn, context) {
            this.addBinder(managerId, fn, context, false);
        };
        return AppManager;
    })();
    kit.AppManager = AppManager;
})(kit || (kit = {}));
var kit;
(function (kit) {
    var EventsBinder = (function () {
        function EventsBinder() {
            this.__event__ = ko.observable();
            this.__subscriptions__ = [];
        }
        EventsBinder.prototype.on = function (eventId, callback, context) {
            var _this = this;
            if (typeof (callback) != 'function') {
                throw "No callback specified or callback is not a valid function : " + callback;
                return;
            }
            if ($.isArray(eventId)) {
                $.each(eventId, function (k, eventId) {
                    _this.on(eventId, callback, context);
                });
                return;
            }
            this.__subscriptions__.push(this.__event__.subscribe(function (event) {
                if (event.id == this.eventId) {
                    this.callback.call(this.context || this.owner, event.arguments);
                }
            }, { eventId: eventId, callback: callback, context: context, owner: this }));
        };
        EventsBinder.prototype.emit = function (eventId, args) {
            this.__event__({
                id: eventId,
                arguments: args
            });
        };
        EventsBinder.prototype.clearSubscriptions = function () {
            dispose(this.__subscriptions__);
        };
        EventsBinder.prototype.dispose = function () {
            this.clearSubscriptions();
        };
        return EventsBinder;
    })();
    kit.EventsBinder = EventsBinder;
})(kit || (kit = {}));
/// <reference path="./EventsBinder.class.ts"/>
var kit;
(function (kit) {
    kit.inherits = function (prototype, id, opts) {
        var OverloadClass = function (prototype, id, opts) {
            opts._id = id;
            this.executionContext = opts;
            this.__proto__ = prototype;
        };
        OverloadClass.prototype = prototype;
        return new OverloadClass(prototype, id, opts);
    };
    var BaseManager = (function (_super) {
        __extends(BaseManager, _super);
        function BaseManager() {
            var _this = this;
            _super.call(this);
            this._domains = {};
            this._domainCounter = 0;
            this.isReady = ko.observable(false);
            this.isReady.subscribeOnce(function (b) {
                if (b) {
                    _this.emit('ready');
                }
            }, this);
        }
        BaseManager.prototype.init = function () { };
        BaseManager.prototype.ready = function (callback, context) {
            if (!callback)
                return;
            this.on('ready', callback, context);
            if (this.isReady()) {
                callback.call(context || this);
                return true;
            }
            return false;
        };
        return BaseManager;
    })(kit.EventsBinder);
    kit.BaseManager = BaseManager;
})(kit || (kit = {}));
var kit;
(function (kit) {
    var Logger = kit.helpers.Logger;
    var oLogger = Logger.getLogger('kit.MVVM');
    var ViewModel = (function () {
        function ViewModel(stringsToRegister) {
            var _this = this;
            this._bindings = [];
            this.strings = {};
            app.i18n.ready(function () {
                if (stringsToRegister != null) {
                    _this.addStringsToModel(stringsToRegister);
                }
            });
        }
        ViewModel.prototype.addStringToModel = function (id) {
            this.strings[id] = app.i18n.getObservableString(id);
        };
        ViewModel.prototype.addStringsToModel = function (ids) {
            for (var i = 0, length = ids.length; i < length; i++) {
                this.addStringToModel(ids[i]);
            }
        };
        ViewModel.prototype.dispose = function () {
        };
        ViewModel.prototype.applyBindings = function (element, bindings) {
            var $element = $(element);
            if (isset(bindings)) {
                $element.attr('data-bind', bindings);
            }
            ko.applyBindings(this, $element[0]);
            this._bindings.push($element[0]);
            return $element;
        };
        ViewModel.prototype.removeBindings = function (element) {
            var $element = $(element);
            ko.removeNode($element[0]);
        };
        ViewModel.prototype.clearBindings = function () {
            var _this = this;
            $.each(this._bindings, function (i, element) {
                _this.removeBindings(element);
            });
            this._bindings.removeAll();
        };
        return ViewModel;
    })();
    kit.ViewModel = ViewModel;
    var ResponsiveViewModel = (function (_super) {
        __extends(ResponsiveViewModel, _super);
        function ResponsiveViewModel(stringsToRegister) {
            var _this = this;
            _super.call(this, stringsToRegister);
            this.normalWidth = 1200;
            this.tabletWidth = 768;
            this.isMobile = ko.observable(false);
            this.isTablet = ko.observable(false);
            this.isNormal = ko.observable(true);
            $(document).ready(function () {
                var resizeFn_ = function () {
                    var innerWidth = window.innerWidth;
                    if (!innerWidth) {
                        if (document.body && document.body.offsetWidth) {
                            innerWidth = document.body.offsetWidth;
                        }
                        if (document.compatMode == 'CSS1Compat' &&
                            document.documentElement &&
                            document.documentElement.offsetWidth) {
                            innerWidth = document.documentElement.offsetWidth;
                        }
                    }
                    if (innerWidth >= _this.normalWidth) {
                        _this.isTablet(false);
                        _this.isMobile(false);
                        _this.isNormal(true);
                    }
                    else if (innerWidth < _this.normalWidth && innerWidth >= _this.tabletWidth) {
                        _this.isMobile(false);
                        _this.isNormal(false);
                        _this.isTablet(true);
                    }
                    else if (innerWidth < _this.tabletWidth) {
                        _this.isTablet(false);
                        _this.isNormal(false);
                        _this.isMobile(true);
                    }
                };
                resizeFn_();
                $(window).bind('resize', function (e) {
                    resizeFn_();
                });
            });
        }
        return ResponsiveViewModel;
    })(ViewModel);
    kit.ResponsiveViewModel = ResponsiveViewModel;
    var MVVM = (function (_super) {
        __extends(MVVM, _super);
        function MVVM(view, stringsToRegister) {
            _super.call(this, stringsToRegister);
            this.content = null;
            this.view = null;
            this.loadingState = ko.observable(false);
            this.isLoaded = ko.observable(false);
            this.isLoading = ko.observable(false);
            this.view = view;
        }
        MVVM.prototype._load = function (htmlContent, callback) {
            this._unload();
            this.content = $(htmlContent);
            this.isLoaded(true);
            this.beforePrepare();
            this.prepare();
            this.afterPrepare();
            if (callback) {
                callback.call(this, htmlContent);
            }
        };
        MVVM.prototype.load = function (callback, htmlContent) {
            var _this = this;
            if (this.view && !isset(htmlContent)) {
                this.isLoading(true);
                kit.helpers.loadResource(this.view, function (htmlContent) {
                    _this._load(htmlContent, callback);
                    _this.isLoading(false);
                });
            }
            else {
                this._load(htmlContent, callback);
            }
        };
        MVVM.prototype.beforePrepare = function () { };
        MVVM.prototype.afterPrepare = function () { };
        MVVM.prototype.prepare = function () {
            if (this.content) {
                if (oLogger.isTraceEnabled()) {
                    oLogger.trace('prepare content ', this.content);
                }
                this.content = $(this.content).appendTo($('body'));
                _super.prototype.applyBindings.call(this, this.content);
            }
        };
        MVVM.prototype.unload = function () {
            var _this = this;
            if (this.isLoading()) {
                this.isLoading.subscribeOnce(function (b) {
                    _this._unload();
                });
                return;
            }
            this._unload();
        };
        MVVM.prototype._unload = function () {
            this.clearBindings();
            if (this.content) {
                if (oLogger.isTraceEnabled()) {
                    oLogger.trace('unload content ', this.content);
                }
                this.content.remove();
                this.content = null;
            }
            this.isLoaded(false);
        };
        MVVM.prototype.dispose = function () {
            if (oLogger.isTraceEnabled()) {
                oLogger.trace('dispose');
            }
            this.unload();
            _super.prototype.dispose.call(this);
        };
        MVVM.prototype.getContent = function () {
            return this.content;
        };
        MVVM.prototype.getView = function () {
            return this.view;
        };
        return MVVM;
    })(ViewModel);
    kit.MVVM = MVVM;
    var MVVMDialog = (function (_super) {
        __extends(MVVMDialog, _super);
        function MVVMDialog() {
            _super.apply(this, arguments);
        }
        MVVMDialog.prototype._show = function (fn) {
            fn = fn || function () { };
            this.getContent().dialog('open');
            fn.call(this);
        };
        MVVMDialog.prototype.show = function (fn) {
            var _this = this;
            if (this.isLoaded()) {
                this._show(fn);
            }
            else {
                this.load(function () {
                    _this._show(fn);
                });
            }
        };
        MVVMDialog.prototype.hide = function () {
            this.getContent().dialog('close');
        };
        MVVMDialog.prototype.prepare = function (dialogOptions) {
            var _this = this;
            _super.prototype.prepare.call(this);
            var defaultOptions = {
                autoOpen: true,
                modal: false,
                resizable: true,
                draggable: true,
                closeOnEscape: true,
                close: function (e, ui) {
                    if (e.originalEvent) {
                        _this.hide();
                    }
                }
            };
            $.extend(defaultOptions, dialogOptions || {});
            this.getContent().dialog(defaultOptions);
        };
        return MVVMDialog;
    })(MVVM);
    kit.MVVMDialog = MVVMDialog;
})(kit || (kit = {}));
var kit;
(function (kit) {
    var manager;
    (function (manager) {
        var Locale = (function () {
            function Locale(language, isoCode) {
                this.language = language;
                this.isoCode = isoCode;
            }
            Locale.prototype.getLang = function () {
                return this.language;
            };
            Locale.prototype.getIsoCode = function () {
                return this.isoCode;
            };
            return Locale;
        })();
        manager.Locale = Locale;
    })(manager = kit.manager || (kit.manager = {}));
})(kit || (kit = {}));
/// <reference path="classes/Locale.class.ts"/>
var kit;
(function (kit) {
    var manager;
    (function (manager) {
        var Logger = kit.helpers.Logger;
        var Query = kit.helpers.Query;
        (function (TSupportedLanguages) {
            TSupportedLanguages[TSupportedLanguages["fr_FR"] = 0] = "fr_FR";
        })(manager.TSupportedLanguages || (manager.TSupportedLanguages = {}));
        var TSupportedLanguages = manager.TSupportedLanguages;
        manager.SUPPORTED_LANGUAGES = {};
        var DEFAULT_LANGUAGE = TSupportedLanguages[TSupportedLanguages.fr_FR];
        var LOCALE_PATH = "${path}/i18n/${device}/${app}/${page}/${lang}";
        var I18n = (function (_super) {
            __extends(I18n, _super);
            function I18n(browserLanguageInfos) {
                var _this = this;
                _super.call(this);
                this.oListLocales = {};
                this.isStringsReady = ko.observable(false);
                this.localizedStrings = {};
                this.localizedObservableStrings = {};
                this.language = ko.observable();
                $.each(browserLanguageInfos, function (id, value) {
                    manager.SUPPORTED_LANGUAGES[value.isoCode] = value.localeName;
                    if (value.defaultLanguage == "true") {
                        DEFAULT_LANGUAGE = value.isoCode;
                    }
                    var oLocale_ = new manager.Locale(id, value.isoCode);
                    oLocale_.displayName = value.localeName;
                    oLocale_.decimalGroupSeparator = value.format.decimal.groupSeparator;
                    oLocale_.decimalGroupDigits = value.format.decimal.groupDigits;
                    oLocale_.decimalSeparator = value.format.decimal.separator;
                    oLocale_.currencySymbol = value.format.currency.symbol;
                    oLocale_.dateFormat = value.format.date.format;
                    oLocale_.dateSeparator = value.format.date.separator;
                    oLocale_.dateLiteralFormat = value.format.date.literalFormat;
                    _this.oListLocales[value.isoCode] = oLocale_;
                });
            }
            I18n.prototype.getCurrentLocale = function () {
                return this.getLocale(this.language());
            };
            I18n.prototype.getLocale = function (isoCode) {
                return this.oListLocales[isoCode];
            };
            I18n.prototype.getSupportedLanguages = function () {
                return manager.SUPPORTED_LANGUAGES;
            };
            I18n.prototype.loadStrings = function (lang) {
                var context, url;
                var self = this;
                var stringsLoaded = function (json, status) {
                    if (this.requestedLanguage != self.language()) {
                        return;
                    }
                    if (status == Query.Status.SUCCESS) {
                        $.each(json, function (k, v) {
                            self.localizedStrings[k] = v;
                        });
                        self.language(this.requestedLanguage);
                        self.updateObservableStrings();
                        self.isStringsReady(true);
                        self.emit('change', self.language());
                    }
                    else {
                        I18n.oLogger.fatal('Erreur lors du chargement des libellés %s: %s'.format(url, status));
                        throw 'Erreur lors du chargement des libellés %s: %s'.format(url, status);
                    }
                };
                lang = lang || this.language() || DEFAULT_LANGUAGE;
                if (manager.SUPPORTED_LANGUAGES[lang]) {
                    url = I18n.getStringsUrl(lang);
                    context = {
                        requestedLanguage: lang
                    };
                    Query.GETasJson(url, stringsLoaded, context, { upToDate: false });
                }
            };
            I18n.prototype.updateObservableStrings = function () {
                var _this = this;
                $.each(this.localizedStrings, function (k, v) {
                    var observableString = _this.getObservableString(k);
                    observableString(v);
                });
            };
            I18n.prototype.getObservableString = function (key, defaultValue) {
                var observableString = this.localizedObservableStrings[key];
                if (!observableString) {
                    if (isset(defaultValue)) {
                        observableString = this.localizedObservableStrings[defaultValue];
                        if (!observableString) {
                            observableString = ko.observable(defaultValue);
                        }
                    }
                    else {
                        observableString = this.localizedObservableStrings[key] = ko.observable();
                        observableString(this.getString(key, key));
                    }
                }
                return observableString;
            };
            I18n.prototype.getString = function (key, defaultValue) {
                return I18n.getStringOrKey(this.localizedStrings[key], isset(defaultValue) ? defaultValue : key);
            };
            I18n.prototype.getCurrentLanguage = function () {
                var locale = this.language();
                if (manager.SUPPORTED_LANGUAGES[locale]) {
                    return locale;
                }
                return DEFAULT_LANGUAGE;
            };
            I18n.prototype.getLanguageFromBrowser = function () {
                var language = kit.helpers.browser.getBrowserInfos().countryCode;
                if (language) {
                    var oLocale_ = Object.findBy(this.oListLocales, 'getLang', language);
                    if (oLocale_) {
                        return oLocale_.getIsoCode();
                    }
                }
                return DEFAULT_LANGUAGE;
            };
            I18n.getStringOrKey = function (str, key) {
                return (str === null || str === undefined) ? key : str;
            };
            I18n.getStringsUrl = function (language) {
                return kit.utils.formatString(LOCALE_PATH, {
                    "path": app.servicesPath,
                    "device": app.context.device,
                    "app": app.context.app,
                    "page": app.context.page,
                    "lang": language
                });
            };
            I18n.prototype.init = function () {
                var _this = this;
                this.language.subscribe(function (lang) {
                    if (manager.SUPPORTED_LANGUAGES[lang]) {
                        _this.loadStrings(lang);
                    }
                });
                this.language(this.getLanguageFromBrowser());
                ko.computed(function () {
                    if (_this.isStringsReady()) {
                        _this.isReady(true);
                    }
                }, this);
            };
            I18n.oLogger = Logger.getLogger('kit.manager.I18n');
            return I18n;
        })(kit.BaseManager);
        manager.I18n = I18n;
    })(manager = kit.manager || (kit.manager = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var ui;
    (function (ui) {
        var _boxCount = 0;
        ui.TMessageBoxButtons = {
            Ok: 'Ok',
            OkCancel: 'OkCancel',
            YesNoCancel: 'YesNoCancel',
            YesNo: 'YesNo'
        };
        ui.TMessageBoxResults = {
            None: 'None',
            Ok: 'Ok',
            Cancel: 'Cancel',
            Yes: 'Yes',
            No: 'No'
        };
        var MessageBox = (function () {
            function MessageBox() {
                this._stringTemplate = '<div data-bind="attr:{id: id}" class="se-ui-messagebox-content"><span class="se-ico-status x-large" data-bind="visible: icon, attr: { \'data-icon\': icon}">&nbsp;</span><pre class="se-ui-text" data-bind="text: content"></pre></div>';
                this._popinTemplate = '<div class="se-ui-popin" data-type=""><span class="se-ico-status small" data-icon=""></span><span class="text"></span></div>';
                this.strings = {};
                this.Buttons = ui.TMessageBoxButtons;
                this.Results = ui.TMessageBoxResults;
                this.strings.ok = app.i18n.getObservableString("ok");
                this.strings.cancel = app.i18n.getObservableString("cancel");
                this.strings.yes = app.i18n.getObservableString("yes");
                this.strings.no = app.i18n.getObservableString("no");
            }
            MessageBox.prototype.alert = function (title, text, callback, context, options) {
                options = options || {};
                options.icon = options.icon || 'warn';
                return this.show(text, title || 'alert', ui.TMessageBoxButtons.Ok, callback, context, options);
            };
            MessageBox.prototype.confirm = function (title, text, okCallback, cancelCallback, context, options) {
                options = options || {};
                options.icon = options.icon || 'help';
                return this.show(text, title || 'confirm', ui.TMessageBoxButtons.YesNo, function (result) {
                    if (result == ui.TMessageBoxResults.Yes) {
                        if (typeof (okCallback) == 'function') {
                            okCallback.call(context || this);
                        }
                        return;
                    }
                    if (result == ui.TMessageBoxResults.No || result == ui.TMessageBoxResults.None) {
                        if (typeof (cancelCallback) == 'function') {
                            cancelCallback.call(context || this);
                        }
                        return;
                    }
                }, context, options);
            };
            MessageBox.prototype.show = function (text, title, button, callback, context, opts) {
                var genId = function (counter) {
                    return 'dialogBox-' + counter;
                };
                var options = {};
                opts = $.extend(options, opts || {});
                title = app.i18n.getString(title);
                text = app.i18n.getString(text);
                var messageBox = null;
                var id = '';
                if (opts.id) {
                    id = opts.id;
                    messageBox = $('#' + opts.id);
                }
                else {
                    _boxCount++;
                    id = genId(_boxCount);
                }
                if (!messageBox || messageBox.length == 0) {
                    messageBox = $(this._stringTemplate);
                }
                var viewModel = {
                    id: id,
                    icon: ko.observable(opts.icon),
                    content: ko.observable(text)
                };
                var _element = messageBox[0];
                ko.applyBindings(viewModel, _element);
                var result = ui.TMessageBoxResults.None;
                button = button || ui.TMessageBoxButtons.Ok;
                var buttons = [];
                switch (button) {
                    case ui.TMessageBoxButtons.Ok:
                        buttons = [{
                                id: "okButton",
                                text: this.strings.ok(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Ok;
                                    $(this).dialog('close');
                                }
                            }];
                        break;
                    case ui.TMessageBoxButtons.OkCancel:
                        buttons = [{
                                id: "okButton",
                                text: this.strings.ok(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Ok;
                                    $(this).dialog('close');
                                }
                            }, {
                                id: "cancelButton",
                                text: this.strings.cancel(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Cancel;
                                    $(this).dialog('close');
                                }
                            }];
                        break;
                    case ui.TMessageBoxButtons.YesNo:
                        buttons = [{
                                id: "yesButton",
                                text: this.strings.yes(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Yes;
                                    $(this).dialog('close');
                                }
                            }, {
                                id: "noButton",
                                text: this.strings.no(),
                                click: function () {
                                    result = ui.TMessageBoxResults.No;
                                    $(this).dialog('close');
                                }
                            }];
                        break;
                    case ui.TMessageBoxButtons.YesNoCancel:
                        buttons = [{
                                id: "yesButton",
                                text: this.strings.yes(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Yes;
                                    $(this).dialog('close');
                                }
                            }, {
                                id: "noButton",
                                text: this.strings.no(),
                                click: function () {
                                    result = ui.TMessageBoxResults.No;
                                    $(this).dialog('close');
                                }
                            }, {
                                id: "cancelButton",
                                text: this.strings.cancel(),
                                click: function () {
                                    result = ui.TMessageBoxResults.Cancel;
                                    $(this).dialog('close');
                                }
                            }];
                        break;
                    default:
                        if ($.isPlainObject(button)) {
                            $.each(button, function (k) {
                                buttons.push({
                                    id: k + 'Button',
                                    text: this.text || app.i18n.getString(k),
                                    click: function () {
                                        result = k, $(this).dialog('close');
                                    }
                                });
                            });
                        }
                        if ($.isArray(button)) {
                            $.each(button, function (k, v) {
                                buttons.push({
                                    id: v + 'Button',
                                    text: app.i18n.getString(v),
                                    click: function () {
                                        result = v, $(this).dialog('close');
                                    }
                                });
                            });
                        }
                        break;
                }
                var dialog = messageBox.dialog({
                    title: title,
                    height: "auto",
                    width: "auto",
                    modal: true,
                    draggable: true,
                    resizable: false,
                    buttons: buttons,
                    closeOnEscape: false,
                    close: function () {
                        if (callback) {
                            if (context) {
                                callback.call(context, result);
                            }
                            else {
                                callback(result);
                            }
                        }
                        messageBox.dialog("destroy").remove();
                        ko.cleanNode(_element);
                    }
                }).dialog('moveToTop');
                if (opts.zIndex) {
                    $('#' + id).parents(':first').css('z-index', opts.zIndex);
                }
                return {
                    id: id,
                    opts: opts,
                    view: viewModel,
                    dialog: dialog
                };
            };
            MessageBox.prototype.destroy = function (id) {
                $('#' + id).dialog('close');
            };
            MessageBox.prototype.clear = function () {
                $('.se-ui-messagebox-content').each(function () {
                    $(this).dialog('close');
                });
                $('.se-ui-popin').each(function () {
                    $(this).remove();
                });
            };
            MessageBox.prototype.popin = function (text, messageType, timeout) {
                var localeText = app.i18n.getString(text);
                timeout = !isNaN(timeout) ? timeout : (messageType == 'error' ? 0 : 2000);
                messageType = messageType || 'info';
                var $template = $(this._popinTemplate);
                var close = function () {
                    $template.fadeOut('fast', function () {
                        $template.remove();
                    });
                };
                $template.attr('data-type', messageType);
                $template.find('.se-ico-status').attr('data-icon', messageType);
                $template.find('.text').html(localeText);
                $template.appendTo($('body')).on('click.popin', function () {
                    close();
                });
                if (timeout > 0) {
                    setTimeout(function () {
                        close();
                    }, timeout);
                }
            };
            return MessageBox;
        })();
        ui.MessageBox = MessageBox;
    })(ui = kit.ui || (kit.ui = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var ui;
    (function (ui) {
        var Logger = kit.helpers.Logger;
        var _contentString = null;
        var _currentStack = {};
        var GlassPanel = (function (_super) {
            __extends(GlassPanel, _super);
            function GlassPanel(id, properties) {
                var _this = this;
                _super.call(this, app.basePath + "/templates/GlassPanel.html", []);
                this.id = null;
                this.lockKeyBoard = false;
                this.isVisible = ko.observable(true);
                this.text = ko.observable('');
                this.progressionText = ko.observable('');
                this.currentStep = ko.observable();
                this.totalSteps = ko.observable();
                this.progression = ko.observable();
                this.steps = ko.observable('');
                this.id = id;
                this.currentStep.subscribe(function (value) {
                    _this._update();
                }, this);
                this.totalSteps.subscribe(function (value) {
                    _this._update();
                }, this);
                this.update(properties);
                _currentStack[this.id] = this;
            }
            GlassPanel.prototype._update = function () {
                var currentStep = Number(this.currentStep());
                var totalSteps = Number(this.totalSteps());
                if (!isNaN(currentStep) && !isNaN(totalSteps)) {
                    this.steps(Math.round(currentStep / totalSteps * 100) + '%');
                    this.progression(currentStep / totalSteps);
                }
                else {
                    this.steps('');
                    this.progression(0);
                }
            };
            GlassPanel.prototype.update = function (properties) {
                if (!isset(properties)) {
                    return;
                }
                if (isset(properties.text)) {
                    this.text(properties.text);
                }
                if (isset(properties.currentStep)) {
                    this.currentStep(Number(properties.currentStep));
                }
                if (isset(properties.totalSteps)) {
                    this.totalSteps(Number(properties.totalSteps));
                }
                if (isset(properties.progressionText)) {
                    this.progressionText(properties.progressionText);
                }
            };
            GlassPanel.prototype.load = function () {
                _super.prototype.load.call(this, function (htmlContent) { _contentString = htmlContent; }, _contentString);
                if (this.lockKeyBoard) {
                    $(document).on('keydown.glassPannel', function (e) {
                        e.stopImmediatePropagation();
                        return false;
                    });
                }
            };
            GlassPanel.prototype.show = function () {
                this.isVisible(true);
            };
            GlassPanel.prototype.hide = function () {
                this.isVisible(false);
            };
            GlassPanel.prototype.destroy = function () {
                this.dispose();
                delete _currentStack[this.id];
                if (!Object.hasKeys(_currentStack)) {
                    $(document).off('keydown.glassPannel');
                }
            };
            GlassPanel.show = function (id) {
                var panel = GlassPanel.getPanel(id);
                if (panel) {
                    panel.show();
                }
            };
            GlassPanel.hide = function (id) {
                var panel = GlassPanel.getPanel(id);
                if (panel) {
                    panel.hide();
                }
            };
            GlassPanel.create = function (id, opts) {
                if (id === void 0) { id = 'main'; }
                var current = GlassPanel.getPanel(id);
                if (current) {
                    current.update(opts);
                }
                else {
                    current = new GlassPanel(id, opts);
                    current.load();
                    GlassPanel.show(current.id);
                }
                return current;
            };
            GlassPanel.destroy = function (id) {
                var panel = GlassPanel.getPanel(id);
                if (panel) {
                    panel.destroy();
                }
                else {
                    if (GlassPanel.oLogger.isWarnEnabled()) {
                        GlassPanel.oLogger.warn("No glass panel found. id: " + id);
                    }
                }
            };
            GlassPanel.update = function (properties, id) {
                var panel = GlassPanel.getPanel(id);
                if (panel) {
                    panel.update(properties);
                }
                else {
                    if (GlassPanel.oLogger.isWarnEnabled()) {
                        GlassPanel.oLogger.warn("No glass panel found. id: " + id);
                    }
                }
            };
            GlassPanel.getPanel = function (id) {
                if (id === void 0) { id = 'main'; }
                return _currentStack[id];
            };
            GlassPanel.oLogger = Logger.getLogger('kit.ui.GlassPanel');
            return GlassPanel;
        })(kit.MVVM);
        ui.GlassPanel = GlassPanel;
    })(ui = kit.ui || (kit.ui = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var Tooltip = (function () {
            function Tooltip(uid) {
                this.text = ko.observable('');
                this.show = ko.observable(true);
                this.animation = "grow";
                this.position = "bottom";
                if (!uid) {
                    uid = kit.utils.genId();
                }
                this.uid = uid;
            }
            Tooltip.prototype.setText = function (resourceId, defaultId) {
                if (defaultId === void 0) { defaultId = ''; }
                this.text = app.i18n.getObservableString(resourceId, defaultId);
            };
            return Tooltip;
        })();
        fields.Tooltip = Tooltip;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
/// <reference path="./classes/Tooltip.class.ts"/>
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var BaseUIField = (function () {
            function BaseUIField(id, bShowLabel) {
                var _this = this;
                if (bShowLabel === void 0) { bShowLabel = true; }
                this.labelArgs = ko.observable();
                this.showLabel = ko.observable(true);
                this.uid = fields.getId(id);
                this.id = id;
                this.label = app.i18n.getObservableString(id + '.label', '');
                this.tooltip = new fields.Tooltip(this.uid + '-tooltip');
                this.tooltip.setText(this.id + '.tooltip');
                this.showLabel(bShowLabel);
                this.formattedLabel = ko.computed(function () {
                    return _this.formatLabel(_this.label());
                }, this);
            }
            BaseUIField.prototype.formatLabel = function (label) {
                var labelArgs_ = this.labelArgs();
                if (labelArgs_) {
                    return kit.utils.formatString(label, labelArgs_);
                }
                return label;
            };
            BaseUIField.prototype.dispose = function () {
                dispose(this.formattedLabel);
            };
            return BaseUIField;
        })();
        fields.BaseUIField = BaseUIField;
        var InputUIFieldValidationConstraint = (function () {
            function InputUIFieldValidationConstraint(name, fn, messageFn, isWarn) {
                if (isWarn === void 0) { isWarn = false; }
                this.name = name;
                this.fn = fn;
                this.isWarn = isWarn;
                this.messageFn = messageFn;
            }
            InputUIFieldValidationConstraint.prototype.dispose = function () {
                dispose(this.isValid);
            };
            return InputUIFieldValidationConstraint;
        })();
        fields.InputUIFieldValidationConstraint = InputUIFieldValidationConstraint;
        var ValidationConstraintInfos = (function () {
            function ValidationConstraintInfos() {
                this.hasWarns = false;
            }
            return ValidationConstraintInfos;
        })();
        fields.ValidationConstraintInfos = ValidationConstraintInfos;
        var InputUIFieldMessage = (function () {
            function InputUIFieldMessage(text, isWarn) {
                if (isWarn === void 0) { isWarn = false; }
                this.text = text;
                this.isWarn = isWarn;
            }
            return InputUIFieldMessage;
        })();
        fields.InputUIFieldMessage = InputUIFieldMessage;
        var InputUIField = (function (_super) {
            __extends(InputUIField, _super);
            function InputUIField(id, value, required, readOnly) {
                var _this = this;
                if (required === void 0) { required = true; }
                if (readOnly === void 0) { readOnly = false; }
                _super.call(this, id);
                this.isReadOnly = ko.observable(false);
                this.isDisabled = ko.observable(false);
                this.isRequired = ko.observable(true);
                this.isVisible = ko.observable(true);
                this.isEditable = ko.observable(true);
                this.autoValidate = ko.observable(true);
                this.messages = ko.observableArray([]);
                this.showMessages = ko.observable(InputUIField.defaultShowMessages);
                this.isFocused = ko.observable(false);
                this.name = ko.observable();
                this.oldValue = ko.observable(null);
                this.value = null;
                this.isLastInputValid = ko.observable(true);
                this.externalValidationValue = ko.observable(true);
                this.hasWarns = ko.observable(false);
                this.hasBeenVisited = ko.observable(false);
                this.template = "ui-field-template";
                this.labelTemplate = "ui-field-label-template";
                this.inputTemplate = "ui-field-input-template";
                this.validationRule = ko.observable();
                this.validationConstraints = ko.observableArray();
                this.unvalidatedConstraints = ko.observableArray();
                this.value = this.getValuable();
                this.dataValue = ko.computed(this.getDataValue, this);
                this.isReadOnly(readOnly);
                this.isRequired(required);
                this.oldValue(value);
                this.value(value);
                this.placeholder = app.i18n.getObservableString(id + '.placeholder', '');
                this.dataName = id.right(id.length - id.lastIndexOf(".") - 1);
                this.autoValidate.subscribe(function (b) {
                    if (b) {
                        this.validateValue();
                    }
                }, this);
                this.validationRule.subscribe(function (rule) {
                    this.setValidationRule(rule);
                    if (this.autoValidate()) {
                        this.validateValue();
                    }
                }, this);
                this.isRequired.subscribe(function (b) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                }, this);
                this.isDisabled.subscribe(function (b) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                }, this);
                this.dataValue.immediateSubscribe(function (value) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                }, this);
                this.validationConstraints.subscribe(function () {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                }, this);
                this.externalValidationValue.subscribe(function () {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                }, this);
                this.hasChanged = ko.computed(this.computeHasChanged, this);
                this.isEmpty = ko.computed(this.computeIsEmpty, this);
                this.isFormValid = ko.computed(this.computeIsFormValid, this);
            }
            InputUIField.prototype.getValuable = function () {
                return ko.observable(null);
            };
            InputUIField.prototype.setValidationRegExp = function (regExp) {
                return this._validationRule = regExp ? new fields.RegExpValidationRule(regExp) : null;
            };
            InputUIField.prototype.valueIsEmpty = function (value) {
                return (typeof (value) == "undefined") || value == null || (CString(value).trim() == "");
            };
            InputUIField.prototype.isValidateValue = function (value) {
                var isRequired = !this.isDisabled() && this.isRequired();
                var hasValue = !this.valueIsEmpty(value);
                var b = (!isRequired) || (isRequired && hasValue);
                if (b && hasValue) {
                    if (this._validationRule) {
                        b = this._validationRule.test(CString(value));
                    }
                }
                return b;
            };
            InputUIField.prototype.validateValue = function () {
                var value = this.dataValue();
                var unvalidatedConstraints = [];
                var bV_ = this.isValidateValue(value);
                var bC_ = false;
                var infos_ = new ValidationConstraintInfos();
                if (bV_) {
                    bC_ = this.isValidateConstraintsValue(value, unvalidatedConstraints, infos_);
                }
                this.hasWarns(infos_.hasWarns);
                this.unvalidatedConstraints(unvalidatedConstraints);
                this.isLastInputValid(bV_ && bC_ && this.externalValidationValue());
            };
            InputUIField.prototype.computeHasChanged = function () {
                return (this.oldValue() != this.value());
            };
            InputUIField.prototype.computeIsEmpty = function () {
                var value = this.value();
                return this.valueIsEmpty(value);
            };
            InputUIField.prototype.computeIsFormValid = function () {
                var isDisabled_ = this.isDisabled();
                var isLastInputValid_ = this.isLastInputValid();
                return isDisabled_ || isLastInputValid_;
            };
            InputUIField.prototype.isValidateConstraintsValue = function (value, unvalidatedConstraints, infos) {
                if (infos === void 0) { infos = new ValidationConstraintInfos(); }
                var checkAlls = true;
                var isValidated_ = true;
                if (!isset(unvalidatedConstraints)) {
                    checkAlls = false;
                    unvalidatedConstraints = [];
                }
                var constraintsList = this.validationConstraints();
                for (var i = 0, len = constraintsList.length; i < len; i++) {
                    var constraint = constraintsList[i];
                    if (!constraint.isValid()) {
                        unvalidatedConstraints.push(constraint);
                        if (!constraint.isWarn) {
                            isValidated_ = false;
                        }
                        else {
                            infos.hasWarns = true;
                        }
                        if (!isValidated_ && !checkAlls) {
                            return false;
                        }
                    }
                }
                return isValidated_;
            };
            InputUIField.prototype.addWarnConstraint = function (name, fn, messageFn) {
                return this.addConstraint(name, fn, messageFn, true);
            };
            InputUIField.prototype.addConstraint = function (name, fn, messageFn, isWarn) {
                var _this = this;
                if (isWarn === void 0) { isWarn = false; }
                var o = new InputUIFieldValidationConstraint(name, fn, messageFn, isWarn);
                o.isValid = ko.computed(fn, this).extend({ throttle: 1 });
                o.isValid.subscribe(function () {
                    _this.validateValue();
                });
                this.validationConstraints.push(o);
                return o;
            };
            InputUIField.prototype.getDataValue = function () {
                if (!this.isDisabled()) {
                    return this.value();
                }
                return null;
            };
            InputUIField.prototype.forceValue = function (value) {
                this.value(value);
                this.applyChanges();
            };
            InputUIField.prototype.applyChanges = function () {
                this.oldValue(this.value());
            };
            InputUIField.prototype.cancelChanges = function () {
                this.forceValue(this.oldValue());
            };
            InputUIField.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                dispose(this.isEmpty);
                dispose(this.validationConstraints);
                dispose(this.formattedLabel);
            };
            InputUIField.defaultShowMessages = true;
            return InputUIField;
        })(BaseUIField);
        fields.InputUIField = InputUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var TextUIField = (function (_super) {
            __extends(TextUIField, _super);
            function TextUIField(id, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.maxLength = 1000;
                this.minLength = 0;
                this.pattern = ko.observable();
                this.useFormat = ko.observable(true);
                this.valueUpdateOn = ko.observable('change');
                this.inputTemplate = "ui-field-text-template";
                this.hasTextChanged = ko.computed(this.computeHasTextChanged, this);
                this.formattedValue = ko.computed({
                    read: function () {
                        if (_this.isFocused()) {
                            return _this.value();
                        }
                        return _this.useFormat() ? _this.formatValue(_this.dataValue()) : _this.dataValue();
                    },
                    write: function (v) {
                        _this.value(v);
                    }
                }, this);
                this.value.subscribe(function () {
                    if (_this.isFocused()) {
                        defer(function () {
                            _this.hasBeenVisited(true);
                        });
                    }
                });
                this.isFocused.subscribe(function (v) {
                    if (!v) {
                        _this.validateValue();
                    }
                });
            }
            TextUIField.prototype.formatValue = function (value) {
                return value;
            };
            TextUIField.prototype.cleanFormatValue = function (value) {
                return value;
            };
            TextUIField.prototype.getDataValue = function () {
                var v = _super.prototype.getDataValue.call(this);
                if (v) {
                    return this.cleanFormatValue(v);
                }
                return v;
            };
            TextUIField.prototype.isValidateValue = function (value) {
                var b = _super.prototype.isValidateValue.call(this, value);
                if (b && typeof (value) == "string" && !this.valueIsEmpty(value)) {
                    if ((this.minLength && value.length < this.minLength) || (this.maxLength && value.length > this.maxLength)) {
                        b = false;
                    }
                }
                return b;
            };
            TextUIField.prototype.computeHasTextChanged = function () {
                var oldValue = '' + (this.oldValue() == null || this.oldValue() == undefined ? '' : this.oldValue());
                var value = '' + (this.value() == null || this.value() == undefined ? '' : this.value());
                return (oldValue != value);
            };
            TextUIField.prototype.onBlurEventHandler = function () {
                var _this = this;
                defer(function () {
                    _this.isFocused(false);
                    _this.hasBeenVisited(true);
                });
            };
            TextUIField.prototype.onFocusEventHandler = function () {
                this.isFocused(true);
            };
            TextUIField.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                dispose(this.formattedValue);
            };
            return TextUIField;
        })(fields.InputUIField);
        fields.TextUIField = TextUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var TextAreaUIField = (function (_super) {
            __extends(TextAreaUIField, _super);
            function TextAreaUIField(id, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.rows = ko.observable(5);
                this.scrollGlue = ko.observable(true);
                this.keyLock = ko.observable(false);
                this.inputTemplate = "ui-field-textarea-template";
                this.keyLock.subscribe(function (b) {
                    if (b) {
                        $(document).on('keypress.locker', 'textarea#' + _this.uid, function (e) {
                            e.stopImmediatePropagation();
                            return false;
                        });
                    }
                    else {
                        $(document).off('keypress.locker', 'textarea#' + _this.uid);
                    }
                });
            }
            TextAreaUIField.prototype.append = function (s) {
                if (isset(s)) {
                    var toBottom = false;
                    if (this.scrollGlue()) {
                        toBottom = this.isScrollToBottom();
                    }
                    var value = this.value() || '';
                    this.value(value + s);
                    if (toBottom) {
                        this.scrollToBottom();
                    }
                }
            };
            TextAreaUIField.prototype.clear = function () {
                this.flush();
            };
            TextAreaUIField.prototype.flush = function () {
                var value = this.value();
                this.value('');
                return value;
            };
            TextAreaUIField.prototype.scrollToBottom = function () {
                var $element = $('#' + this.uid);
                $element.scrollTop($element[0].scrollHeight);
            };
            TextAreaUIField.prototype.isScrollToBottom = function () {
                var $element = $('#' + this.uid);
                return ($element[0].scrollHeight - $element[0].scrollTop) == $element.innerHeight();
            };
            return TextAreaUIField;
        })(fields.TextUIField);
        fields.TextAreaUIField = TextAreaUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var ToggleUIField = (function (_super) {
            __extends(ToggleUIField, _super);
            function ToggleUIField(id, value, required, readOnly) {
                _super.call(this, id, value, required, readOnly);
                this.textForTrue = app.i18n.getObservableString("yes");
                this.textForFalse = app.i18n.getObservableString("no");
                this.inputTemplate = "checkboxInputTemplate";
            }
            ToggleUIField.prototype.isValidateValue = function (value) {
                var isValid = false;
                if ((value === "true") || (value === true) || (value === "false") || (value === false)) {
                    isValid = true;
                }
                return isValid;
            };
            ToggleUIField.prototype.checked = function () {
                return !this.isReadOnly();
            };
            return ToggleUIField;
        })(fields.InputUIField);
        fields.ToggleUIField = ToggleUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var LabelUIField = (function (_super) {
            __extends(LabelUIField, _super);
            function LabelUIField(id, value, required) {
                if (required === void 0) { required = false; }
                _super.call(this, id, value, required, true);
                this.className = ko.observable(null);
                this.inputTemplate = "labelInputTemplate";
            }
            return LabelUIField;
        })(fields.TextUIField);
        fields.LabelUIField = LabelUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        (function (TNumericTypes) {
            TNumericTypes[TNumericTypes["Integer"] = 0] = "Integer";
            TNumericTypes[TNumericTypes["PositiveInteger"] = 1] = "PositiveInteger";
            TNumericTypes[TNumericTypes["Double"] = 2] = "Double";
            TNumericTypes[TNumericTypes["PositiveDouble"] = 3] = "PositiveDouble";
        })(fields.TNumericTypes || (fields.TNumericTypes = {}));
        var TNumericTypes = fields.TNumericTypes;
        var NumericUIField = (function (_super) {
            __extends(NumericUIField, _super);
            function NumericUIField(id, value, formatType, required, readOnly) {
                _super.call(this, id, value, required, readOnly);
                this.locale = ko.observable();
                this.minimum = null;
                this.maximum = null;
                this.isMinimumExcluded = false;
                this.isMaximumExcluded = false;
                this.unit = ko.observable();
                this.digits = 2;
                this.setValidationRegExp(NumericUIField.getNumericRegExp(formatType));
                this.inputTemplate = "ui-field-numeric-template";
            }
            NumericUIField.getNumericRegExp = function (formatType) {
                switch (formatType) {
                    case TNumericTypes.Integer: return kit.regexp.Integer;
                    case TNumericTypes.PositiveInteger: return kit.regexp.PositiveInteger;
                    case TNumericTypes.Double: return kit.regexp.Double;
                    case TNumericTypes.PositiveDouble: return kit.regexp.PositiveDouble;
                }
            };
            NumericUIField.prototype.isValidateValue = function (value) {
                if (!_super.prototype.isValidateValue.call(this, value)) {
                    return false;
                }
                var isValid = true;
                if (!this.valueIsEmpty(value)) {
                    if (!is_numeric(value)) {
                        isValid = false;
                    }
                }
                return isValid;
            };
            NumericUIField.prototype.isValidateConstraintsValue = function (value, unvalidatedConstraints, infos) {
                if (!_super.prototype.isValidateConstraintsValue.call(this, value, unvalidatedConstraints, infos)) {
                    return false;
                }
                var isValid = true;
                if (this.valueIsEmpty(value)) {
                    return true;
                }
                var numbr = Number(value);
                var minLimit = this.minimum;
                if (minLimit || minLimit === 0) {
                    if (this.isMinimumExcluded) {
                        isValid = numbr > minLimit;
                    }
                    else {
                        isValid = numbr >= minLimit;
                    }
                }
                if (isValid) {
                    var maxLimit = this.maximum;
                    if (maxLimit || maxLimit === 0) {
                        if (this.isMaximumExcluded) {
                            isValid = numbr < maxLimit;
                        }
                        else {
                            isValid = numbr <= maxLimit;
                        }
                    }
                }
                return isValid;
            };
            NumericUIField.prototype.formatValue = function (value) {
                if (this.locale && !this.valueIsEmpty(value)) {
                    return kit.utils.formatDecimal(value, this.digits, this.locale());
                }
                return value;
            };
            NumericUIField.prototype.cleanFormatValue = function (value) {
                if (this.valueIsEmpty(value)) {
                    return value;
                }
                var n = Number(CString(value).replaceAll(" ", "").replaceAll(",", "."));
                return isNaN(n) ? value : CString(n.round(this.digits));
            };
            return NumericUIField;
        })(fields.TextUIField);
        fields.NumericUIField = NumericUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var CurrencyUIField = (function (_super) {
            __extends(CurrencyUIField, _super);
            function CurrencyUIField(id, value, required, readOnly) {
                _super.call(this, id, value, fields.TNumericTypes.PositiveDouble, required, readOnly);
                this.minimum = 0;
                this.digits = 2;
            }
            return CurrencyUIField;
        })(fields.NumericUIField);
        fields.CurrencyUIField = CurrencyUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var Option = (function () {
            function Option(value, resourceId, resourceTextId) {
                this.value = null;
                this.data = {};
                this.tooltip = new fields.Tooltip();
                this.disabled = ko.observable(false);
                this.text = ko.observable();
                this.value = value;
                this.resourceId = resourceId || value;
                this.resourceTextId = resourceTextId || this.resourceId;
                this.text = app.i18n.getObservableString(this.resourceTextId + '.label', this.resourceId);
                this.tooltip.setText(this.resourceTextId + '.tooltip');
            }
            Option.afterRenderFunction = function (option, item) {
                if (item) {
                    ko.applyBindingsToNode(option, { disable: item.disabled }, item);
                }
            };
            return Option;
        })();
        fields.Option = Option;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
/// <reference path="./classes/Option.class.ts"/>
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var SelectUIField = (function (_super) {
            __extends(SelectUIField, _super);
            function SelectUIField(id, choices, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.choices = [];
                this._valueToSet = null;
                this._valueToForce = null;
                this.options = ko.observableArray();
                this.view = ko.observable('default');
                this.inline = ko.observable(false);
                this.selectedOptionText = ko.observable();
                this.inputTemplate = "ui-field-select-template";
                this.updateChoices(choices);
                this.options.subscribe(function () {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                });
                this.options.subscribe(function () {
                    clearTimeout(_this.__optionsThrottle);
                    _this.__optionsThrottle = defer(function () {
                        var options_ = _this.options();
                        if (_this._valueToForce != null) {
                            _this.forceValue(_this._valueToForce);
                        }
                        if (_this._valueToSet != null) {
                            if (_this.isValidateValue(_this._valueToSet)) {
                                var v_ = _this._valueToSet;
                                _this._valueToSet = null;
                                _this.outputValue(v_);
                            }
                        }
                        _this.value.notifySubscribers(_this.value());
                    });
                });
                this.value.immediateSubscribe(function (v) {
                    var options_ = _this.options();
                    var option_ = options_[_this.choices.indexOf(v)];
                    _this.selectedOptionText(option_ ? option_.text() : '');
                    if (_this.choices.length == 1 && _this.choices[0] == v) {
                        _this.hasBeenVisited(true);
                    }
                });
            }
            SelectUIField.prototype.isValidateValue = function (value) {
                var isValid = _super.prototype.isValidateValue.call(this, value);
                if (isValid && !this.valueIsEmpty(value)) {
                    var choices = this.choices;
                    if (choices) {
                        isValid = (choices.indexOf(String(value)) > -1);
                    }
                }
                return isValid;
            };
            SelectUIField.prototype.getValuable = function () {
                this.outputValue = _super.prototype.getValuable.call(this);
                this.valuableValue = ko.computed({
                    read: function () {
                        var value = this.outputValue();
                        if (this.isValidateValue(value)) {
                            return value;
                        }
                        return null;
                    },
                    write: function (value) {
                        if (value != null && !this.isValidateValue(value)) {
                            this._valueToSet = value;
                            value = this.choices ? this.choices[0] || null : null;
                        }
                        if (this.outputValue() != value) {
                            this.outputValue(value);
                        }
                        this.outputValue.notifySubscribers();
                    },
                    owner: this
                });
                return this.valuableValue;
            };
            SelectUIField.prototype.forceValue = function (value) {
                if (this.isValidateValue(value)) {
                    _super.prototype.forceValue.call(this, value);
                    this._valueToForce = null;
                }
                else {
                    this.oldValue(value);
                    this.value(value);
                    this._valueToForce = value;
                }
            };
            SelectUIField.prototype.getListOfOptions = function (newChoices) {
                var options;
                options = [];
                if (newChoices) {
                    if (!$.isArray(newChoices)) {
                        $.each(newChoices, function (v, k) {
                            options.push(new fields.Option(CString(v).trim(), CString(k).trim()));
                        });
                    }
                    else {
                        var choicesCount = newChoices.length;
                        for (var choiceIndex = 0; choiceIndex < choicesCount; choiceIndex++) {
                            var choice = CString(newChoices[choiceIndex]).trim();
                            options.push(new fields.Option(choice, choice, this.id + '.list[' + choice + ']'));
                        }
                    }
                }
                return options;
            };
            SelectUIField.prototype.addChoices = function (newChoices) {
                var options = this.getListOfOptions(newChoices);
                var options_ = this.options().concat(options);
                this.updateListOfChoices(options_);
                this.options(options_);
            };
            SelectUIField.prototype.removeChoices = function (oldchoices) {
                var options, optionsList;
                options = [];
                optionsList = this.options();
                if (oldchoices) {
                    if (!$.isArray(oldchoices)) {
                        $.each(oldchoices, function (v, k) {
                            var opt = optionsList.findBy('value', v);
                            if (opt) {
                                options.push(opt);
                            }
                        });
                    }
                    else {
                        var choicesCount = oldchoices.length;
                        for (var choiceIndex = 0; choiceIndex < choicesCount; choiceIndex++) {
                            var choice = oldchoices[choiceIndex];
                            var opt = optionsList.findBy('value', choice);
                            if (opt) {
                                options.push(opt);
                            }
                        }
                    }
                }
                this.options().removeAll(options);
                this.updateListOfChoices();
                this.options.valueHasMutated();
            };
            SelectUIField.prototype.updateChoices = function (newChoices) {
                var strNewChoices = JSON.stringify(newChoices);
                if (this._oldChoicesStringified == strNewChoices) {
                    return;
                }
                this._oldChoicesStringified = strNewChoices;
                var value_ = null;
                if (this._valueToSet == null && this._valueToForce == null) {
                    value_ = this.outputValue();
                }
                this.options().removeAll();
                this.choices.removeAll();
                this.addChoices(newChoices);
                if (value_ != null) {
                    this.outputValue(value_);
                }
            };
            SelectUIField.prototype.viewRadiosOptionClickFunction = function (option, e) {
                this.value(option.value);
                this.hasBeenVisited(true);
            };
            SelectUIField.prototype.hasChoice = function (choice) {
                return this.choices.contains(choice);
            };
            SelectUIField.prototype.sort = function (compareFn) {
                if (!compareFn) {
                    compareFn = function (a, b) {
                        return a.text().toLowerCase() > b.text().toLowerCase() ? 1 : -1;
                    };
                }
                var oOptionsList_ = this.options();
                var returnValue = oOptionsList_.sort(compareFn);
                this.updateListOfChoices();
                this.options.valueHasMutated();
                return returnValue;
            };
            SelectUIField.prototype.updateListOfChoices = function (options) {
                if (options === void 0) { options = this.options(); }
                this.choices = [];
                for (var i = 0, len = options.length; i < len; i++) {
                    var option_ = options[i];
                    this.choices.push(option_.value);
                }
            };
            SelectUIField.prototype.listCount = function () {
                return this.choices.length;
            };
            SelectUIField.prototype.selectFirst = function () {
                if (this.listCount() > 0) {
                    this.value(this.options()[0].value);
                }
            };
            SelectUIField.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                dispose(this.valuableValue);
                dispose(this._computedOptions);
            };
            return SelectUIField;
        })(fields.TextUIField);
        fields.SelectUIField = SelectUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var EmailUIField = (function (_super) {
            __extends(EmailUIField, _super);
            function EmailUIField(id, value, required, readOnly) {
                var _this = this;
                this.allowMultiple = ko.observable(false);
                this.allowMultiple.subscribe(function () {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                });
                _super.call(this, id, value, required, readOnly);
            }
            EmailUIField.prototype.isValidateValue = function (value) {
                var b = _super.prototype.isValidateValue.call(this, value);
                if (b && value) {
                    value = value.replace(",", EmailUIField.EMAIL_LIST_DELIMITER);
                    var emailsAsArray = value.split(EmailUIField.EMAIL_LIST_DELIMITER);
                    var i, anEmail;
                    var emailsCount = emailsAsArray.length;
                    var isListValid = true;
                    var reg = kit.regexp.Email;
                    if (!this.allowMultiple() && emailsCount > 1) {
                        isListValid = false;
                    }
                    else {
                        for (i = 0; i < emailsCount; i++) {
                            anEmail = emailsAsArray[i];
                            if (anEmail.trim() !== '' && !reg.test(anEmail.trim())) {
                                isListValid = false;
                                break;
                            }
                        }
                    }
                    return isListValid;
                }
                return b;
            };
            EmailUIField.EMAIL_LIST_DELIMITER = ";";
            return EmailUIField;
        })(fields.TextUIField);
        fields.EmailUIField = EmailUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var DateUIField = (function (_super) {
            __extends(DateUIField, _super);
            function DateUIField(id, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.minDate = ko.observable();
                this.maxDate = ko.observable();
                this.date = null;
                this.inputTemplate = "ui-field-date-template";
                this.minDate.subscribe(function (d) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                });
                this.maxDate.subscribe(function (d) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                });
                this.date = ko.computed(function () {
                    return _this.parseDate(_this.value());
                });
            }
            DateUIField.prototype.parseDate = function (value) {
                return kit.utils.parseLiteralDate(value, app.i18n.getCurrentLocale());
            };
            DateUIField.prototype.formatValue = function (value) {
                var oDate_ = kit.utils.parseLiteralDate(value, app.i18n.getCurrentLocale());
                if (oDate_) {
                    return kit.utils.formatDate(oDate_, app.i18n.getCurrentLocale().dateFormat);
                }
                return value;
            };
            DateUIField.prototype.cleanFormatValue = function (value) {
                var oDate_ = kit.utils.parseLiteralDate(value, app.i18n.getCurrentLocale());
                if (oDate_) {
                    return kit.utils.formatDate(oDate_, "ddmmyyyy");
                }
                return value;
            };
            DateUIField.prototype.isValidateValue = function (value) {
                var bValid_ = _super.prototype.isValidateValue.call(this, value);
                if (bValid_ && !this.valueIsEmpty(value)) {
                    var oDate_ = this.parseDate(value);
                    bValid_ = oDate_ != null;
                }
                return bValid_;
            };
            DateUIField.prototype.isValidateConstraintsValue = function (value, unvalidatedConstraints, infos) {
                var bValid_ = true;
                if (!this.valueIsEmpty(value)) {
                    var oDate_ = this.parseDate(value);
                    if (oDate_ != null) {
                        bValid_ = _super.prototype.isValidateConstraintsValue.call(this, oDate_.getTime(), unvalidatedConstraints, infos);
                    }
                    if (bValid_) {
                        var oMinDate_ = this.minDate();
                        var oMaxDate_ = this.maxDate();
                        bValid_ = oDate_ != null;
                        bValid_ = bValid_ && (!oMinDate_ || (oMinDate_.isPast(oDate_) || oMinDate_.isSameDate(oDate_)));
                        bValid_ = bValid_ && (!oMaxDate_ || (oMaxDate_.isFuture(oDate_) || oMaxDate_.isSameDate(oDate_)));
                    }
                }
                return bValid_;
            };
            return DateUIField;
        })(fields.TextUIField);
        fields.DateUIField = DateUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        var CodePostalUIField = (function (_super) {
            __extends(CodePostalUIField, _super);
            function CodePostalUIField(id, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.isLoadingValues = ko.observable(false);
                this.oSelectUIField = new fields.SelectUIField(id + ".select", [], null, required, readOnly);
                this.oTextUIField = new fields.TextUIField(id + ".text", "", false, readOnly);
                this.oTextUIField.setValidationRegExp(kit.regexp.CdPost);
                this.oTextUIField.maxLength = 5;
                this.oSelectUIField.isEditable.dependsOn(this.isEditable);
                this.oTextUIField.isEditable.dependsOn(this.isEditable);
                this.inputTemplate = "ui-field-codepostal-template";
                this.isRequired.immediateSubscribe(function (b) {
                    _this.oTextUIField.isRequired(b);
                    _this.oSelectUIField.isRequired(b);
                });
                this.isReadOnly.immediateSubscribe(function (b) {
                    _this.oSelectUIField.isReadOnly(b);
                    _this.oTextUIField.isReadOnly(b);
                });
                this.isDisabled.immediateSubscribe(function (b) {
                    _this.oSelectUIField.isDisabled(b);
                    _this.oTextUIField.isDisabled(b);
                });
                this.value.immediateSubscribe(function (v) {
                    if (_this.autoValidate()) {
                        _this.oTextUIField.value(v);
                    }
                });
                this.oTextUIField.isFocused.immediateSubscribe(function (b) {
                    if (_this.oTextUIField.value()) {
                        _this.oTextUIField.value(_this.oTextUIField.value().rPad('0', 5));
                    }
                });
                this.oSelectUIField.value.subscribe(function (v) {
                    if (_this.autoValidate()) {
                        _this.autoValidate(false);
                        _this.value(v);
                        _this.autoValidate(true);
                    }
                });
                this.oTextUIField.hasBeenVisited.subscribe(function (b) {
                    if (b && !_this.oTextUIField.hasChanged()) {
                        _this.hasBeenVisited(true);
                    }
                });
                this.isLoadingValues.subscribe(function (b) {
                    if (!b && _this.oTextUIField.hasBeenVisited()) {
                        _this.hasBeenVisited(true);
                    }
                });
                this.oSelectUIField.hasBeenVisited.subscribe(function (b) {
                    if (b) {
                        _this.hasBeenVisited(true);
                    }
                });
                this.oTextUIField.value.immediateSubscribe(function (v) {
                    if (_this.autoValidate()) {
                        _this.isLoadingValues(true);
                        if (typeof (CodePostalUIField.onSearchFn) == "function") {
                            CodePostalUIField.onSearchFn.call(_this, v, function (choices) {
                                this.oSelectUIField.updateChoices(choices);
                                this.isLoadingValues(false);
                            });
                        }
                    }
                });
            }
            CodePostalUIField.prototype.forceValue = function (value) {
                _super.prototype.forceValue.call(this, value);
                this.oTextUIField.applyChanges();
            };
            CodePostalUIField.prototype.forceValues = function (textValue, listValue) {
                var _this = this;
                this.autoValidate(false);
                _super.prototype.forceValue.call(this, listValue);
                this.autoValidate(true);
                this.oTextUIField.forceValue(textValue);
                this.isLoadingValues.subscribeOnce(function (b) {
                    if (!b) {
                        _this.oSelectUIField.forceValue(listValue);
                    }
                });
            };
            CodePostalUIField.prototype.getTextDataValue = function () {
                return this.oTextUIField.dataValue();
            };
            CodePostalUIField.prototype.isValidateValue = function (value) {
                var isValid = _super.prototype.isValidateValue.call(this, value);
                if (isValid && this.oSelectUIField) {
                    isValid = this.oSelectUIField.isLastInputValid();
                }
                return isValid;
            };
            return CodePostalUIField;
        })(fields.InputUIField);
        fields.CodePostalUIField = CodePostalUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
/// <reference path="./InputUIField.ts"/>
/// <reference path="./TextUIField.ts"/>
/// <reference path="./TextAreaUIField.ts"/>
/// <reference path="./ToggleUIField.ts"/>
/// <reference path="./LabelUIField.ts"/>
/// <reference path="./NumericUIField.ts"/>
/// <reference path="./CurrencyUIField.ts"/>
/// <reference path="./SelectUIField.ts"/>
/// <reference path="./EmailUIField.ts"/>
/// <reference path="./DateUIField.ts"/>
/// <reference path="./CodePostalUIField.ts"/>
var kit;
(function (kit) {
    var fields;
    (function (fields) {
        function getId(name, ind) {
            if (ind === void 0) { ind = null; }
            return (name + (ind != null ? '-' + ind : '')).replace(/[' \.]/gi, '_');
        }
        fields.getId = getId;
        var RegExpValidationRule = (function () {
            function RegExpValidationRule(regExp) {
                this.regExp = regExp;
            }
            RegExpValidationRule.prototype.test = function (value) {
                if (value && value != "") {
                    if (this.regExp.test(value)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                return true;
            };
            return RegExpValidationRule;
        })();
        fields.RegExpValidationRule = RegExpValidationRule;
        var ProgressBarUIField = (function (_super) {
            __extends(ProgressBarUIField, _super);
            function ProgressBarUIField(id, value) {
                var _this = this;
                _super.call(this, id, value, false);
                this.inputTemplate = "progressBarTemplate";
                this.value.immediateSubscribe(function (v) {
                    _this.refresh();
                });
            }
            ProgressBarUIField.prototype.refresh = function () {
                $('#' + this.uid + '-progressbar').progressbar({ value: this.value() });
            };
            return ProgressBarUIField;
        })(fields.InputUIField);
        fields.ProgressBarUIField = ProgressBarUIField;
        var StatusUIField = (function (_super) {
            __extends(StatusUIField, _super);
            function StatusUIField(id, value) {
                var _this = this;
                _super.call(this, id, value, false);
                this.isRunning = ko.observable(false);
                this.inputTemplate = "statusInputTemplate";
                this.isRunning.immediateSubscribe(function (b) {
                    defer(function () {
                        if (b) {
                            $('#' + _this.uid + '-progressbar').progressbar({ value: false });
                        }
                        else {
                            $('#' + _this.uid + '-progressbar').progressbar('destroy');
                        }
                    });
                });
            }
            return StatusUIField;
        })(fields.LabelUIField);
        fields.StatusUIField = StatusUIField;
        var CustomSelectUIField = (function (_super) {
            __extends(CustomSelectUIField, _super);
            function CustomSelectUIField(id, choices, value, required, readOnly, customUIField) {
                var _this = this;
                _super.call(this, id, value, required, readOnly);
                this.options = ko.observableArray();
                this.isCustomChoiceSelected = ko.observable(false);
                this.selectUIField = ko.observable();
                this.customUIField = ko.observable();
                this.selectUIField(new fields.SelectUIField(id, null, null, required, readOnly));
                if (!customUIField) {
                    customUIField = new fields.TextUIField(CustomSelectUIField.CUSTOM_CHOICE + id, "", false, true);
                }
                this.customUIField(customUIField);
                this.updateChoices(choices);
                this.template = "customRowPropertyTemplate";
                this.selectUIField.immediateSubscribe(function (uiField) {
                    uiField.value.subscribe(function (v) {
                        _this.isCustomChoiceSelected(v == CustomSelectUIField.CUSTOM_CHOICE);
                        if (!_this.isCustomChoiceSelected()) {
                            _this.value(v);
                        }
                        else {
                            _this.value(CustomSelectUIField.CUSTOM_CHOICE + _this.customUIField().value());
                        }
                    });
                });
                this.customUIField.immediateSubscribe(function (uiField) {
                    uiField.value.subscribe(function (v) {
                        if (_this.isCustomChoiceSelected()) {
                            _this.value(CustomSelectUIField.CUSTOM_CHOICE + v);
                        }
                    });
                });
                this.isRequired.immediateSubscribe(function (b) {
                    _this.selectUIField().isRequired(true);
                });
                this.isReadOnly.immediateSubscribe(function (b) {
                    _this.selectUIField().isReadOnly(b);
                    _this.customUIField().isReadOnly(!_this.isCustomChoiceSelected() || b);
                });
                this.isCustomChoiceSelected.immediateSubscribe(function (b) {
                    _this.customUIField().isRequired(b);
                    _this.customUIField().isReadOnly(_this.isReadOnly() || !b);
                });
                this.value.immediateSubscribe(function (v) {
                    if (_this.isCustomValue(v)) {
                        _this.selectUIField().value(CustomSelectUIField.CUSTOM_CHOICE);
                        _this.customUIField().value(_this.cleanCustomValue(v));
                    }
                    else {
                        _this.selectUIField().value(v);
                    }
                });
            }
            CustomSelectUIField.prototype.isCustomValue = function (v) {
                return v && v.indexOf(CustomSelectUIField.CUSTOM_CHOICE) != -1;
            };
            CustomSelectUIField.prototype.cleanCustomValue = function (v) {
                if (this.isCustomValue(v)) {
                    return v.substring(CustomSelectUIField.CUSTOM_CHOICE.length);
                }
                return v;
            };
            CustomSelectUIField.prototype.getCustomOption = function () {
                return this.selectUIField().options().findBy('value', CustomSelectUIField.CUSTOM_CHOICE);
            };
            CustomSelectUIField.prototype.hasCustomOption = function () {
                return this.getCustomOption() != null;
            };
            CustomSelectUIField.prototype.addRemoveCustomChoice = function (bAdd) {
                if (bAdd) {
                    if (!this.hasCustomOption()) {
                        this.selectUIField().addChoices([CustomSelectUIField.CUSTOM_CHOICE]);
                    }
                }
                else {
                    var opt = this.getCustomOption();
                    if (opt) {
                        this.selectUIField().removeChoices([CustomSelectUIField.CUSTOM_CHOICE]);
                    }
                }
            };
            CustomSelectUIField.prototype.isValidateValue = function (value) {
                var isValid = _super.prototype.isValidateValue.call(this, value);
                if (isValid && this.selectUIField) {
                    isValid = this.selectUIField().isLastInputValid() && this.customUIField().isLastInputValid();
                }
                return isValid;
            };
            CustomSelectUIField.prototype.updateChoices = function (newChoices) {
                this.selectUIField().updateChoices(newChoices);
                this.addRemoveCustomChoice(true);
            };
            CustomSelectUIField.CUSTOM_CHOICE = "custom:";
            return CustomSelectUIField;
        })(fields.InputUIField);
        fields.CustomSelectUIField = CustomSelectUIField;
        var AutoCompleteUIField = (function (_super) {
            __extends(AutoCompleteUIField, _super);
            function AutoCompleteUIField(id, value, required, readOnly) {
                _super.call(this, id, value, required, readOnly);
                this.valuesList = ko.observableArray();
                this.inputTemplate = "autoCompleteInputTemplate";
            }
            return AutoCompleteUIField;
        })(fields.TextUIField);
        fields.AutoCompleteUIField = AutoCompleteUIField;
        var SelectCondUIField = (function (_super) {
            __extends(SelectCondUIField, _super);
            function SelectCondUIField(id, condUIField, condValue, choices, value, required, readOnly) {
                var _this = this;
                _super.call(this, id, choices, value, required, readOnly);
                this.condUIField = condUIField;
                this.condValue = condValue;
                this.inputTemplate = "ui-field-selectcond-template";
                this.condUIField.value.immediateSubscribe(function (v) {
                    _this.isReadOnly(v != _this.condValue);
                    _this.validateValue();
                });
                this.isReadOnly.subscribe(function (b) {
                    if (_this.autoValidate()) {
                        _this.validateValue();
                    }
                });
                this.value.subscribe(function (v) {
                    if (v) {
                        _this.condUIField.value(_this.condValue);
                    }
                });
            }
            SelectCondUIField.prototype.isValidateValue = function (value) {
                if (!this.condUIField)
                    return false;
                var isValid = _super.prototype.isValidateValue.call(this, value);
                if (!this.condUIField.value() || !this.isReadOnly()) {
                    return isValid;
                }
                return true;
            };
            return SelectCondUIField;
        })(fields.SelectUIField);
        fields.SelectCondUIField = SelectCondUIField;
        var ActionUIField = (function (_super) {
            __extends(ActionUIField, _super);
            function ActionUIField(id, label, action, context, readOnly) {
                _super.call(this, id, null, false, readOnly);
                this.inputTemplate = "buttonTemplate";
                this.value = app.i18n.getObservableString(label);
                if (context) {
                    this.action = function (vm, jqEvent) {
                        action.call(context, vm, jqEvent);
                    };
                }
                else {
                    this.action = action;
                }
            }
            return ActionUIField;
        })(fields.InputUIField);
        fields.ActionUIField = ActionUIField;
    })(fields = kit.fields || (kit.fields = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var BaseUIField = kit.fields.BaseUIField;
    var GroupUIField = (function (_super) {
        __extends(GroupUIField, _super);
        function GroupUIField(id, PE_oListOfUIField, bShowLabel) {
            var _this = this;
            if (PE_oListOfUIField === void 0) { PE_oListOfUIField = []; }
            if (bShowLabel === void 0) { bShowLabel = true; }
            _super.call(this, id, bShowLabel);
            this.oListOfUIField = ko.observableArray();
            this.messages = ko.observableArray();
            this.hasBeenVisitedTrigger = false;
            this.hasBeenVisited = ko.observable(false);
            this.isRequired = this.createComputedBoolean('isRequired', true);
            this.isReadOnly = this.createComputedBoolean('isReadOnly', true, true);
            this.isDisabled = this.createComputedBoolean('isDisabled', true, true);
            this.isVisible = this.createComputedBoolean('isVisible', true);
            this.isEditable = this.createComputedBoolean('isEditable', true);
            this.isFocused = this.createComputedBoolean('isFocused', true, false, 50);
            this.hasChanged = this.createComputedBoolean('hasChanged', true);
            this.hasWarns = this.createComputedBoolean('hasWarns', true);
            this.showMessages = this.createComputedBoolean('showMessages', true);
            this.oComputedMessages = this.createComputedMessages();
            this.isLastInputValid = ko.computed(function () {
                return _this.readBoolean('isLastInputValid', true, true);
            });
            this.isFormValid = ko.computed(function () {
                return _this.readBoolean('isFormValid', true, true);
            });
            this.isEmpty = ko.computed(function () {
                return _this.readBoolean('isEmpty', true, true);
            });
            this.isFocused.subscribe(function (v) {
                if (!v) {
                    defer(function () {
                        _this.hasBeenVisited(true);
                    });
                }
            });
            this.oListOfUIField(PE_oListOfUIField);
        }
        GroupUIField.prototype.addUIField = function (PE_oUIField) {
            this.oListOfUIField.push(PE_oUIField);
        };
        GroupUIField.prototype.createComputedBoolean = function (subscribableName, testValue, allCombined, throttle) {
            var _this = this;
            if (allCombined === void 0) { allCombined = false; }
            if (throttle === void 0) { throttle = null; }
            return ko.computed({
                read: function () {
                    return _this.readBoolean(subscribableName, testValue, allCombined);
                },
                write: function (b) {
                    _this.writeBoolean(subscribableName, b);
                }
            }).extend({ throttle: throttle });
        };
        GroupUIField.prototype.createComputedMessages = function () {
            var _this = this;
            return ko.computed(function () {
                var oListOfUIFieldArray_ = _this.oListOfUIField();
                var len_ = oListOfUIFieldArray_.length;
                var ary_ = [];
                for (var i_ = 0; i_ < len_; i_++) {
                    var oInputUIField_ = oListOfUIFieldArray_[i_];
                    ary_ = ary_.concat(oInputUIField_.messages());
                }
                _this.messages(ary_);
            }, this);
        };
        GroupUIField.prototype.readBoolean = function (subscribableName, testValue, allCombined) {
            if (testValue === void 0) { testValue = false; }
            if (allCombined === void 0) { allCombined = false; }
            var oListOfUIFieldArray_ = this.oListOfUIField();
            var len_ = oListOfUIFieldArray_.length;
            var isValid_ = !testValue;
            for (var i_ = 0; i_ < len_; i_++) {
                var oInputUIField_ = oListOfUIFieldArray_[i_];
                if (oInputUIField_[subscribableName].call(oInputUIField_) == testValue) {
                    isValid_ = true;
                    if (!allCombined) {
                        break;
                    }
                }
                else {
                    if (allCombined) {
                        isValid_ = false;
                        break;
                    }
                }
            }
            return isValid_;
        };
        GroupUIField.prototype.writeBoolean = function (subscribableName, v) {
            this.runFunction(subscribableName, v);
        };
        GroupUIField.prototype.runFunction = function (functionName, args) {
            if (args === void 0) { args = null; }
            var oListOfUIFieldArray_ = this.oListOfUIField();
            var len_ = oListOfUIFieldArray_.length;
            for (var i_ = 0; i_ < len_; i_++) {
                var oInputUIField_ = oListOfUIFieldArray_[i_];
                oInputUIField_[functionName].call(oInputUIField_, args);
            }
        };
        GroupUIField.prototype.applyChanges = function () {
            this.runFunction('applyChanges');
        };
        GroupUIField.prototype.cancelChanges = function () {
            this.runFunction('cancelChanges');
        };
        GroupUIField.prototype.dispose = function () {
            dispose(this.isLastInputValid);
            dispose(this.isRequired);
            dispose(this.isReadOnly);
            dispose(this.hasChanged);
            dispose(this.isVisible);
            dispose(this.isDisabled);
            dispose(this.isEditable);
            dispose(this.isEmpty);
            dispose(this.isFormValid);
            dispose(this.isFocused);
            dispose(this.messages);
            dispose(this.showMessages);
            dispose(this.oComputedMessages);
        };
        return GroupUIField;
    })(BaseUIField);
    kit.GroupUIField = GroupUIField;
})(kit || (kit = {}));
var kit;
(function (kit) {
    var InputUIFieldMessage = kit.fields.InputUIFieldMessage;
    var FieldsValidatorDigest = (function (_super) {
        __extends(FieldsValidatorDigest, _super);
        function FieldsValidatorDigest(PE_oListOfIUIField, messagesArgs, inspectChilds) {
            var _this = this;
            if (PE_oListOfIUIField === void 0) { PE_oListOfIUIField = []; }
            if (messagesArgs === void 0) { messagesArgs = {}; }
            if (inspectChilds === void 0) { inspectChilds = true; }
            _super.call(this, null, PE_oListOfIUIField);
            this.messagesArgs = ko.observable();
            this.inspectChilds = ko.observable(true);
            this.messagesArgs(messagesArgs);
            this.inspectChilds(inspectChilds);
            this.oComputed = ko.computed(function () {
                var oListOfIUIFieldArray_ = _this.oListOfUIField();
                var messagesArgs_ = _this.messagesArgs();
                var bRecursive_ = _this.inspectChilds();
                _this.treatListOfFields(oListOfIUIFieldArray_, messagesArgs_, bRecursive_);
            }).extend({ throttle: 0 });
        }
        FieldsValidatorDigest.prototype.treatListOfFields = function (oListOfIUIFieldArray, messagesArgs, bRecursive) {
            var len_ = oListOfIUIFieldArray.length;
            for (var i_ = 0; i_ < len_; i_++) {
                var oIUIField_ = oListOfIUIFieldArray[i_];
                var oObservableString_ = null;
                oIUIField_.messages.removeAll();
                var oInputUIField_ = oIUIField_;
                var bConstraintsTriggered_ = false;
                if (oInputUIField_.unvalidatedConstraints) {
                    var oUnvalidatedConstraintsList_ = oInputUIField_.unvalidatedConstraints();
                    for (var j_ = 0, len2 = oUnvalidatedConstraintsList_.length; j_ < len2; j_++) {
                        var oValidationConstraint_ = oUnvalidatedConstraintsList_[j_];
                        var str_ = "";
                        var strId_ = oIUIField_.id + '.constraints.' + oValidationConstraint_.name;
                        if (!oValidationConstraint_.isWarn) {
                            bConstraintsTriggered_ = true;
                        }
                        if (typeof (oValidationConstraint_.messageFn) == 'function') {
                            str_ = oValidationConstraint_.messageFn.call(oInputUIField_, strId_);
                        }
                        else {
                            oObservableString_ = app.i18n.getObservableString(strId_);
                            str_ = oObservableString_();
                        }
                        var message_ = kit.utils.formatString(str_, messagesArgs);
                        oIUIField_.messages.push(new InputUIFieldMessage(message_, oValidationConstraint_.isWarn));
                    }
                }
                if (!oIUIField_.isFormValid()) {
                    if (oIUIField_.isEmpty()) {
                        oObservableString_ = app.i18n.getObservableString(oIUIField_.id + '.required', 'form.field.required');
                        var message_ = kit.utils.formatString(oObservableString_(), messagesArgs);
                        oIUIField_.messages.push(new InputUIFieldMessage(message_));
                    }
                    else {
                        if (!bConstraintsTriggered_) {
                            oObservableString_ = app.i18n.getObservableString(oIUIField_.id + '.invalid', 'form.field.invalid');
                            var message_ = kit.utils.formatString(oObservableString_(), messagesArgs);
                            oIUIField_.messages.push(new InputUIFieldMessage(message_));
                        }
                    }
                }
                if (oIUIField_.oListOfUIField && bRecursive) {
                    this.treatListOfFields(oIUIField_.oListOfUIField(), messagesArgs, bRecursive);
                }
            }
        };
        FieldsValidatorDigest.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            dispose(this.messagesArgs);
            dispose(this.oComputed);
        };
        return FieldsValidatorDigest;
    })(kit.GroupUIField);
    kit.FieldsValidatorDigest = FieldsValidatorDigest;
})(kit || (kit = {}));
var kit;
(function (kit) {
    kit.Locales = {
        "en": {
            "localeName": "English",
            "isoCode": "en_US",
            "unsupportedBrowserMsg": "The browser you are using is not supported by this application. We advise you to use a supported browser among those in the list here-below",
            "unsupportedBrowserVersionMsg": "The browser version you are using is not supported by this application. We advise you to upgrade your browser to a newer version.",
            "format": {
                "decimal": {
                    "groupSeparator": ",",
                    "groupDigits": 3,
                    "separator": "."
                },
                "date": {
                    "format": "yyyy-mm-dd",
                    "separator": "-",
                    "literalFormat": "YMD"
                },
                "currency": {
                    "symbol": "€"
                }
            }
        },
        "fr": {
            "localeName": "Français",
            "isoCode": "fr_FR",
            "isDefaultLanguage": "true",
            "unsupportedBrowserMsg": "Le navigateur que vous utilisez n'est pas supporté par cette application. Nous vous conseillons d'utiliser plutôt un des navigateurs de la liste ci-dessous",
            "unsupportedBrowserVersionMsg": "La version du navigateur que vous utilisez n'est pas supportée par cette application. Nous vous conseillons de mettre à jour votre navigateur à une version plus récente.",
            "format": {
                "decimal": {
                    "groupSeparator": " ",
                    "groupDigits": 3,
                    "separator": ","
                },
                "date": {
                    "format": "dd/mm/yyyy",
                    "separator": "/",
                    "literalFormat": "DMY"
                },
                "currency": {
                    "symbol": "€"
                }
            }
        }
    };
})(kit || (kit = {}));
var kit;
(function (kit) {
    var main;
    (function (main) {
        var Logger = kit.helpers.Logger;
        var LANGUAGE_HASH_KEY = "lang";
        var oLogger = Logger.getLogger('kit.main');
        var application;
        var location = window.location;
        var path = location.protocol + "//" + location.host + "/";
        application = {
            title: ko.observable(),
            isReady: ko.observable(false),
            version: null,
            context: {
                device: null,
                app: null,
                page: null
            },
            i18n: null,
            logLevel: 5,
            logConsole: false,
            manager: new kit.AppManager(),
            messageBox: null,
            doTrtQueryError: function (response) { },
            servicesPath: path,
            basePath: null,
            appPath: null,
            getFinalFileName: function (fileName) {
                if (this.version) {
                    fileName += (fileName.indexOf('?') == -1 ? '?' : '&') + '_v=' + encodeURIComponent(this.version);
                }
                return fileName;
            },
            navigateTo: function (href) {
                window.location.assign(href);
            },
            ready: function (fn, context) {
                if (this.isReady()) {
                    fn.call(context, fn);
                }
                else {
                    this.isReady.subscribe(function (b) {
                        if (b) {
                            fn.call(context, fn);
                        }
                    });
                }
            },
            init: function () {
                var oLogger_ = Logger.getLogger('main');
                oLogger_.info("Initialisation de l'application");
                this.i18n.init();
            },
            showTrace: function () {
                var sTrace_ = "";
                sTrace_ += "version: " + app.version + "\n";
                sTrace_ += "ready: " + app.isReady() + "\n";
                sTrace_ += "ready/i18n: " + (app.i18n ? app.i18n.isReady() : "N/A") + "\n";
                sTrace_ += "context.device: " + app.context.device + "\n";
                sTrace_ += "context.app: " + app.context.app + "\n";
                sTrace_ += "context.page: " + app.context.page + "\n";
                sTrace_ += "servicesPath: " + app.servicesPath + "\n";
                sTrace_ += "basePath: " + app.basePath + "\n";
                sTrace_ += "appPath: " + app.appPath + "\n";
                sTrace_ += "logLevel: " + app.logLevel + "\n";
                sTrace_ += "logConsole: " + app.logConsole + "\n";
                kit.alert(sTrace_);
            }
        };
        window.app = application;
        app.i18n = app.manager.register('i18n', new kit.manager.I18n(kit.Locales));
        app.manager.ready(['i18n'], function () {
            application.isReady(true);
        });
        $(document).ajaxSend(function (event, jqxhr, settings) {
            settings.url = app.getFinalFileName(settings.url);
        });
        $(document).ready(function () {
            $(document).on('dragend drop', 'input', function () {
                $(this).trigger('keydown');
            });
            $(window).keydown(function (event) {
                if (event.which == 27) {
                    event.preventDefault();
                }
            });
        });
    })(main = kit.main || (kit.main = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        var doReadOnly = function (element, valueAccessor) {
            var readonly = ko.utils.unwrapObservable(valueAccessor());
            if (element.type == "checkbox" || element.tagName == "SELECT" || element.tagName == "BUTTON" || element.tagName == "DIV" || element.tagName == "A") {
                if (readonly) {
                    $(element).attr('disabled', 'disabled');
                }
                else {
                    $(element).removeAttr('disabled');
                }
            }
            else {
                if (readonly) {
                    $(element).attr('readonly', 'readonly');
                }
                else {
                    $(element).removeAttr('readonly');
                }
            }
            if (readonly) {
                $(element).bind('mousedown.readOnlyBinding', function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
            }
            else {
                $(element).unbind('mousedown.readOnlyBinding');
            }
        };
        ko.bindingHandlers['readonly'] = {
            init: function (element, valueAccessor) {
                doReadOnly(element, valueAccessor);
            },
            update: function (element, valueAccessor) {
                doReadOnly(element, valueAccessor);
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        ko.bindingHandlers['datepicker'] = (function () {
            var getDateTimePickerOptions = function (_resourcesManager) {
                var _strings = {
                    january: _resourcesManager.getObservableString('january'),
                    february: _resourcesManager.getObservableString('february'),
                    march: _resourcesManager.getObservableString('march'),
                    april: _resourcesManager.getObservableString('april'),
                    may: _resourcesManager.getObservableString('may'),
                    june: _resourcesManager.getObservableString('june'),
                    july: _resourcesManager.getObservableString('july'),
                    august: _resourcesManager.getObservableString('august'),
                    september: _resourcesManager.getObservableString('september'),
                    october: _resourcesManager.getObservableString('october'),
                    november: _resourcesManager.getObservableString('november'),
                    december: _resourcesManager.getObservableString('december'),
                    januaryAbbr: _resourcesManager.getObservableString('januaryAbbr'),
                    februaryAbbr: _resourcesManager.getObservableString('februaryAbbr'),
                    marchAbbr: _resourcesManager.getObservableString('marchAbbr'),
                    aprilAbbr: _resourcesManager.getObservableString('aprilAbbr'),
                    mayAbbr: _resourcesManager.getObservableString('mayAbbr'),
                    juneAbbr: _resourcesManager.getObservableString('juneAbbr'),
                    julyAbbr: _resourcesManager.getObservableString('julyAbbr'),
                    augustAbbr: _resourcesManager.getObservableString('augustAbbr'),
                    septemberAbbr: _resourcesManager.getObservableString('septemberAbbr'),
                    octoberAbbr: _resourcesManager.getObservableString('octoberAbbr'),
                    novemberAbbr: _resourcesManager.getObservableString('novemberAbbr'),
                    decemberAbbr: _resourcesManager.getObservableString('decemberAbbr'),
                    monday: _resourcesManager.getObservableString('monday'),
                    tuesday: _resourcesManager.getObservableString('tuesday'),
                    wednesday: _resourcesManager.getObservableString('wednesday'),
                    thursday: _resourcesManager.getObservableString('thursday'),
                    friday: _resourcesManager.getObservableString('friday'),
                    saturday: _resourcesManager.getObservableString('saturday'),
                    sunday: _resourcesManager.getObservableString('sunday'),
                    mondayAbbr: _resourcesManager.getObservableString('mondayAbbr'),
                    tuesdayAbbr: _resourcesManager.getObservableString('tuesdayAbbr'),
                    wednesdayAbbr: _resourcesManager.getObservableString('wednesdayAbbr'),
                    thursdayAbbr: _resourcesManager.getObservableString('thursdayAbbr'),
                    fridayAbbr: _resourcesManager.getObservableString('fridayAbbr'),
                    saturdayAbbr: _resourcesManager.getObservableString('saturdayAbbr'),
                    sundayAbbr: _resourcesManager.getObservableString('sundayAbbr'),
                    firstDayOfTheWeek: _resourcesManager.getObservableString('firstDayOfTheWeek'),
                    today: _resourcesManager.getObservableString('today'),
                    previous: _resourcesManager.getObservableString('previous'),
                    next: _resourcesManager.getObservableString('next'),
                    close: _resourcesManager.getObservableString('close')
                };
                var options = {
                    onClose: function () { },
                    dateFormat: getDateFormat(_resourcesManager),
                    onSelect: null,
                    closeText: _strings.close(),
                    prevText: _strings.previous(),
                    changeYear: true,
                    showOn: "none",
                    nextText: _strings.next(),
                    currentText: _strings.today(),
                    showButtonPanel: false,
                    firstDay: getFirstDayOfTheWeek(_strings),
                    monthNames: [
                        _strings.january(), _strings.february(), _strings.march(), _strings.april(), _strings.may(), _strings.june(),
                        _strings.july(), _strings.august(), _strings.september(), _strings.october(), _strings.november(), _strings.december()
                    ],
                    monthNamesShort: [
                        _strings.januaryAbbr(), _strings.februaryAbbr(), _strings.marchAbbr(), _strings.aprilAbbr(), _strings.mayAbbr(), _strings.juneAbbr(),
                        _strings.julyAbbr(), _strings.augustAbbr(), _strings.septemberAbbr(), _strings.octoberAbbr(), _strings.novemberAbbr(), _strings.decemberAbbr()
                    ],
                    dayNames: [
                        _strings.sunday(), _strings.monday(), _strings.tuesday(), _strings.wednesday(), _strings.thursday(), _strings.friday(), _strings.saturday()
                    ],
                    dayNamesMin: [
                        _strings.sundayAbbr(), _strings.mondayAbbr(), _strings.tuesdayAbbr(), _strings.wednesdayAbbr(), _strings.thursdayAbbr(), _strings.fridayAbbr(), _strings.saturdayAbbr()
                    ]
                };
                return options;
            };
            var getDateFormat = function (_resourcesManager) {
                var dateFormat = _resourcesManager.getCurrentLocale().dateFormat;
                return dateFormat.replace("yyyy", "yy");
            };
            var getFirstDayOfTheWeek = function (_strings) {
                var firstDayOfTheWeek = _strings.firstDayOfTheWeek();
                switch (firstDayOfTheWeek) {
                    case _strings.monday():
                        firstDayOfTheWeek = 1;
                        break;
                    case _strings.tuesday():
                        firstDayOfTheWeek = 2;
                        break;
                    case _strings.wednesday():
                        firstDayOfTheWeek = 3;
                        break;
                    case _strings.thursday():
                        firstDayOfTheWeek = 4;
                        break;
                    case _strings.friday():
                        firstDayOfTheWeek = 5;
                        break;
                    case _strings.saturday():
                        firstDayOfTheWeek = 6;
                        break;
                    default:
                        firstDayOfTheWeek = 0;
                        break;
                }
                return firstDayOfTheWeek;
            };
            var getFirstVisibleInput = function (id) {
                var $elements = $('[id=' + id + ']');
                for (var i = 0; i < $elements.length; i++) {
                    var $this = $($elements[i]);
                    if ($this.is(':visible')) {
                        return $this;
                    }
                }
                return $('#' + id);
            };
            return {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    var value_ = valueAccessor();
                    app.manager.ready(['i18n'], function (_resourcesManager) {
                        var o = $.extend(value_.options || {}, getDateTimePickerOptions(_resourcesManager));
                        o['yearRange'] = (o.minDate ? o.minDate.getFullYear() : "c-100") + ":" + (o.maxDate ? o.maxDate.getFullYear() : "c+100");
                        $(element).bind('click.datepicker', function () {
                            getFirstVisibleInput(value_.id).datepicker('show');
                        });
                        defer(function () {
                            getFirstVisibleInput(value_.id).datepicker(o);
                        });
                    });
                },
                update: function (element, valueAccessor) {
                    var value_ = valueAccessor();
                    app.manager.ready(['i18n'], function (_resourcesManager) {
                        var o = $.extend(value_.options || {}, getDateTimePickerOptions(_resourcesManager));
                        o['yearRange'] = (o.minDate ? o.minDate.getFullYear() : "c-100") + ":" + (o.maxDate ? o.maxDate.getFullYear() : "c+100");
                        getFirstVisibleInput(value_.id).datepicker('destroy');
                        getFirstVisibleInput(value_.id).datepicker(o);
                    });
                }
            };
        }());
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        ko.bindingHandlers['tooltip'] = {
            init: function (element, valueAccessor) {
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    var $this = $(element);
                    if ($this.tooltipster) {
                        try {
                            $this.tooltipster('destroy').off('.tooltipster');
                        }
                        catch (e) { }
                    }
                });
            },
            update: function (element, valueAccessor) {
                var content = ko.unwrap(valueAccessor());
                var $this = $(element);
                if (typeof (content) == "object") {
                    content = {
                        text: ko.unwrap(content.text),
                        animation: ko.unwrap(content.animation),
                        position: ko.unwrap(content.position)
                    };
                }
                else {
                    content = {
                        text: ko.unwrap(content)
                    };
                }
                var oldContent = $this.data("kotooltipster");
                if (content != oldContent) {
                    var position = content.position || $this.attr('data-ttposition');
                    var animation = content.animation || $this.attr('data-ttanimation');
                    if (oldContent) {
                        if ($this.tooltipster) {
                            try {
                                $this.tooltipster('destroy');
                            }
                            catch (e) { }
                        }
                    }
                    $this.data("kotooltipster", content);
                    if ($this.tooltipster) {
                        $this.attr("title", content.text);
                        $this.tooltipster({
                            animation: animation,
                            updateAnimation: false,
                            contentAsHTML: true,
                            delay: 100,
                            position: position,
                            hideOnClick: true,
                            autoClose: true,
                            onlyOne: true,
                            touchDevices: true,
                            trigger: (app.context.device == 'computer' ? 'hover' : 'click')
                        });
                    }
                    else {
                        $this.attr("title", content.text.text().replaceAll("&nbsp;", " "));
                    }
                }
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        ko.bindingHandlers['accordion'] = {
            init: function (element, valueAccessor) {
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(element).accordion("destroy");
                });
            },
            update: function (element, valueAccessor) {
                var options = valueAccessor() || {};
                var $element = $(element);
                $element.accordion(options).accordion("option", "icons", {
                    "header": "ui-icon-expand",
                    "activeHeader": "ui-icon-collapse"
                });
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        var format = function (content) {
            var oLocale_ = app.i18n.getCurrentLocale();
            if (content.name == "percent") {
                return "%s &#37;".format(kit.utils.formatDecimal(content.value, content.digit || 2, oLocale_));
            }
            if (content.name == "currency") {
                return "%s %s".format(kit.utils.formatDecimal(content.value, content.digit || 2, oLocale_), oLocale_.currencySymbol);
            }
            if (content.name == "replace") {
                return kit.utils.formatString(content.value, content.data);
            }
            if (content.name == "month") {
                return "%s %s".format(content.value, app.i18n.getString('month'));
            }
        };
        var getValueAccessor = function (content, name) {
            if (typeof (content) == "object") {
                return function () {
                    return {
                        value: content.value,
                        name: name,
                        data: content.data
                    };
                };
            }
            return function () {
                return {
                    value: content,
                    name: name
                };
            };
        };
        ko.bindingHandlers['formatCurrency'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $this = $(element);
                ko.bindingHandlers['format'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                valueAccessor = getValueAccessor(content, 'currency');
                ko.bindingHandlers['format'].update(element, valueAccessor, allBindings, viewModel, bindingContext);
            }
        };
        ko.bindingHandlers['formatPercent'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $this = $(element);
                ko.bindingHandlers['format'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                valueAccessor = getValueAccessor(content, 'percent');
                ko.bindingHandlers['format'].update(element, valueAccessor, allBindings, viewModel, bindingContext);
            }
        };
        ko.bindingHandlers['formatMonth'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $this = $(element);
                ko.bindingHandlers['tooltip'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
                ko.bindingHandlers['format'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                valueAccessor = getValueAccessor(content, 'month');
                var iNbMois_ = Number(ko.unwrap(valueAccessor().value));
                var sRetour_ = kit.utils.formatMonthToYear(iNbMois_, false);
                $this.addClass('infotip');
                var tooltipAccessor = $this.data("koformatMonthTooltipster");
                if (!tooltipAccessor) {
                    var tooltip = new kit.fields.Tooltip();
                    tooltipAccessor = function () { return tooltip; };
                }
                tooltipAccessor().text(sRetour_);
                $this.data("koformatMonthTooltipster", tooltipAccessor);
                ko.bindingHandlers['tooltip'].update(element, tooltipAccessor, allBindings, viewModel, bindingContext);
                ko.bindingHandlers['format'].update(element, valueAccessor, allBindings, viewModel, bindingContext);
            }
        };
        ko.bindingHandlers['format'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $this = $(element);
                $this.data("koformat", { value: $this.html() });
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                var oldContent = $this.data("koformat");
                if (typeof (content) == "object") {
                    content = {
                        value: ko.unwrap(content.value),
                        name: ko.unwrap(content.name),
                        digit: ko.unwrap(content.digit),
                        data: ko.unwrap(content.data || viewModel)
                    };
                }
                else {
                    content = {
                        value: oldContent.value,
                        name: ko.unwrap(content),
                        data: ko.unwrap(viewModel)
                    };
                }
                if (content != oldContent) {
                    $this.data("koformat", content);
                    $this.html(format(content));
                }
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        var getValueAccessor = function (content, viewModel) {
            if (typeof (content) == "object") {
                if (content.sdata) {
                    return function () { return app.i18n.getObservableString(content.prop)().format(content.sdata); };
                }
                return function () { return kit.utils.formatString(app.i18n.getObservableString(content.prop)(), content.data || viewModel); };
            }
            return function () { return kit.utils.formatString(app.i18n.getObservableString(content)(), viewModel); };
        };
        ko.bindingHandlers['i18n'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                valueAccessor = getValueAccessor(content, viewModel);
                ko.bindingHandlers['html'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var content = valueAccessor();
                var $this = $(element);
                valueAccessor = getValueAccessor(content, viewModel);
                ko.bindingHandlers['html'].update(element, valueAccessor, allBindings, viewModel, bindingContext);
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        function openWithPostData(url, data_get, data_post) {
            var idForm_ = "kopostform";
            var urlDataPrefix_ = "";
            if (!url)
                return;
            if (url.indexOf("?") == -1) {
                urlDataPrefix_ = "?";
            }
            $.each(data_get || {}, function (k, v) {
                url += urlDataPrefix_ + encodeURIComponent(k) + "=" + encodeURIComponent(v);
                urlDataPrefix_ = "&";
            });
            var sDataForm_ = "";
            $.each(data_post || {}, function (k, v) {
                sDataForm_ += "<input type='hidden' name='" + k + "' value='" + v + "'>";
            });
            var $form = $("#" + idForm_);
            if ($form.length > 0) {
                $form.attr("action", url);
                $form.html(sDataForm_);
            }
            else {
                $("body").append("<form id='" + idForm_ + "' action='" + url + "' method='POST' target='_blank'>" + sDataForm_ + "</form>");
            }
            $("#" + idForm_).submit();
        }
        ko.bindingHandlers['post'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) { },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var data = valueAccessor();
                if (data) {
                    $(element).off('click.kopost');
                    $(element).on('click.kopost', function () {
                        openWithPostData(ko.unwrap(data.url), ko.unwrap(data.params), ko.unwrap(data.data));
                    });
                }
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        ko.bindingHandlers['load'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) { },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var url = valueAccessor();
                var $element = $(element);
                $element.load(url);
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
var kit;
(function (kit) {
    var bindings;
    (function (bindings) {
        ko.bindingHandlers['loadMention'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) { },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var options = ko.unwrap(valueAccessor());
                var mentions = options.mentions;
                var url = options.url;
                var $element = $(element);
                $element.html("");
                var results = [];
                function buildMentions() {
                    for (var i = 0; i < results.length; i++) {
                        if (results[i] != "" && results[i] != "&nbsp;") {
                            if (isFirst) {
                                isFirst = false;
                            }
                            else {
                                $element.append("<br/>");
                            }
                            $element.append("<div>" + results[i] + "</div>");
                        }
                    }
                }
                ;
                function getMention(i) {
                    results[i] = null;
                    $.get(url + "/" + mentions[i], function (result) {
                        results[i] = result;
                        counter++;
                        if (counter == mentions.length) {
                            buildMentions();
                        }
                    });
                }
                ;
                var counter = 0;
                var isFirst = true;
                for (var i = 0; i < mentions.length; i++) {
                    getMention(i);
                }
            }
        };
    })(bindings = kit.bindings || (kit.bindings = {}));
})(kit || (kit = {}));
/// <reference path="definitions/jquery.d.ts"/>
/// <reference path="definitions/jqueryui.d.ts"/>
/// <reference path="definitions/knockout.d.ts"/>
/// <reference path="./ext/knockout.ext.ts"/>
/// <reference path="./commons/prototypes/Object.prototype.ts"/>
/// <reference path="./commons/prototypes/String.prototype.ts"/>
/// <reference path="./commons/prototypes/Date.prototype.ts"/>
/// <reference path="./commons/prototypes/Array.prototype.ts"/>
/// <reference path="./commons/prototypes/Number.prototype.ts"/>
/// <reference path="./commons/utils.ts"/>
/// <reference path="./commons/regexp.ts"/>
/// <reference path="./init.ts"/>
/// <reference path="./commons/helper/logger.ts"/>
/// <reference path="./commons/helper/query.ts"/>
/// <reference path="./commons/helper/storage.ts"/>
/// <reference path="./commons/helper/browser.ts"/>
/// <reference path="./commons/helper/files.ts"/>
/// <reference path="./commons/helper/xml.ts"/>
/// <reference path="./commons/classes/AppManager.class.ts"/>
/// <reference path="./commons/classes/EventsBinder.class.ts"/>
/// <reference path="./commons/classes/Manager.class.ts"/>
/// <reference path="./commons/classes/MVVM.class.ts"/>
/// <reference path="./managers/I18n/i18n.ts"/>
/// <reference path="./commons/ui/messageBox/messageBox.ts"/>
/// <reference path="./commons/ui/glassPanel/glassPanel.ts"/>
/// <reference path="./commons/fields/index.ts"/>
/// <reference path="./commons/classes/GroupUIField.class.ts"/>
/// <reference path="./commons/classes/FieldsValidatorDigest.class.ts"/>
/// <reference path="./locales.ts"/>
/// <reference path="./main.ts"/>
/// <reference path="./customBindings/readonly.ts"/>
/// <reference path="./customBindings/datepicker.ts"/>
/// <reference path="./customBindings/tooltipster.ts"/>
/// <reference path="./customBindings/accordion.ts"/>
/// <reference path="./customBindings/format.ts"/>
/// <reference path="./customBindings/i18n.ts"/>
/// <reference path="./customBindings/post.ts"/>
/// <reference path="./customBindings/load.ts"/>
/// <reference path="./customBindings/loadMention.ts"/> 
