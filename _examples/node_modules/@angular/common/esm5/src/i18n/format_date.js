/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { FormStyle, FormatWidth, NumberSymbol, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat } from './locale_data_api';
export var ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
var NAMED_FORMATS = {};
var DATE_FORMATS_SPLIT = /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var ZoneWidth;
(function (ZoneWidth) {
    ZoneWidth[ZoneWidth["Short"] = 0] = "Short";
    ZoneWidth[ZoneWidth["ShortGMT"] = 1] = "ShortGMT";
    ZoneWidth[ZoneWidth["Long"] = 2] = "Long";
    ZoneWidth[ZoneWidth["Extended"] = 3] = "Extended";
})(ZoneWidth || (ZoneWidth = {}));
var DateType;
(function (DateType) {
    DateType[DateType["FullYear"] = 0] = "FullYear";
    DateType[DateType["Month"] = 1] = "Month";
    DateType[DateType["Date"] = 2] = "Date";
    DateType[DateType["Hours"] = 3] = "Hours";
    DateType[DateType["Minutes"] = 4] = "Minutes";
    DateType[DateType["Seconds"] = 5] = "Seconds";
    DateType[DateType["Milliseconds"] = 6] = "Milliseconds";
    DateType[DateType["Day"] = 7] = "Day";
})(DateType || (DateType = {}));
var TranslationType;
(function (TranslationType) {
    TranslationType[TranslationType["DayPeriods"] = 0] = "DayPeriods";
    TranslationType[TranslationType["Days"] = 1] = "Days";
    TranslationType[TranslationType["Months"] = 2] = "Months";
    TranslationType[TranslationType["Eras"] = 3] = "Eras";
})(TranslationType || (TranslationType = {}));
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * Where:
 * - `value` is a Date, a number (milliseconds since UTC epoch) or an ISO string
 *   (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. See {@link DatePipe} for more
 *   details.
 * - `locale` is a `string` defining the locale to use.
 * - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *   abbreviations, but for general use, use a time zone offset (e.g. `'+0430'`).
 *   If not specified, host system settings are used.
 *
 * See {@link DatePipe} for more details.
 *
 *
 */
export function formatDate(value, format, locale, timezone) {
    var date = toDate(value);
    var namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    var parts = [];
    var match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            var part = parts.pop();
            if (!part) {
                break;
            }
            format = part;
        }
        else {
            parts.push(format);
            break;
        }
    }
    var dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    var text = '';
    parts.forEach(function (value) {
        var dateFormatter = getDateFormatter(value);
        text += dateFormatter ?
            dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
function getNamedFormat(locale, format) {
    var localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    var formatValue = '';
    switch (format) {
        case 'shortDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
            break;
        case 'mediumDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
            break;
        case 'longDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
            break;
        case 'fullDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
            break;
        case 'shortTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
            break;
        case 'mediumTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
            break;
        case 'longTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
            break;
        case 'fullTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
            break;
        case 'short':
            var shortTime = getNamedFormat(locale, 'shortTime');
            var shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
            break;
        case 'medium':
            var mediumTime = getNamedFormat(locale, 'mediumTime');
            var mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
            break;
        case 'long':
            var longTime = getNamedFormat(locale, 'longTime');
            var longDate = getNamedFormat(locale, 'longDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
            break;
        case 'full':
            var fullTime = getNamedFormat(locale, 'fullTime');
            var fullDate = getNamedFormat(locale, 'fullDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
            break;
    }
    if (formatValue) {
        NAMED_FORMATS[localeId][format] = formatValue;
    }
    return formatValue;
}
function formatDateTime(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{([^}]+)}/g, function (match, key) {
            return (opt_values != null && key in opt_values) ? opt_values[key] : match;
        });
    }
    return str;
}
function padNumber(num, digits, minusSign, trim, negWrap) {
    if (minusSign === void 0) { minusSign = '-'; }
    var neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    var strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.substr(strNum.length - digits);
    }
    return neg + strNum;
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset, trim, negWrap) {
    if (offset === void 0) { offset = 0; }
    if (trim === void 0) { trim = false; }
    if (negWrap === void 0) { negWrap = false; }
    return function (date, locale) {
        var part = getDatePart(name, date, size);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours && part === 0 && offset === -12) {
            part = 12;
        }
        return padNumber(part, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim, negWrap);
    };
}
function getDatePart(name, date, size) {
    switch (name) {
        case DateType.FullYear:
            return date.getFullYear();
        case DateType.Month:
            return date.getMonth();
        case DateType.Date:
            return date.getDate();
        case DateType.Hours:
            return date.getHours();
        case DateType.Minutes:
            return date.getMinutes();
        case DateType.Seconds:
            return date.getSeconds();
        case DateType.Milliseconds:
            var div = size === 1 ? 100 : (size === 2 ? 10 : 1);
            return Math.round(date.getMilliseconds() / div);
        case DateType.Day:
            return date.getDay();
        default:
            throw new Error("Unknown DateType value \"" + name + "\".");
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form, extended) {
    if (form === void 0) { form = FormStyle.Format; }
    if (extended === void 0) { extended = false; }
    return function (date, locale) {
        return getDateTranslation(date, locale, name, width, form, extended);
    };
}
/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(date, locale, name, width, form, extended) {
    switch (name) {
        case TranslationType.Months:
            return getLocaleMonthNames(locale, form, width)[date.getMonth()];
        case TranslationType.Days:
            return getLocaleDayNames(locale, form, width)[date.getDay()];
        case TranslationType.DayPeriods:
            var currentHours_1 = date.getHours();
            var currentMinutes_1 = date.getMinutes();
            if (extended) {
                var rules = getLocaleExtraDayPeriodRules(locale);
                var dayPeriods_1 = getLocaleExtraDayPeriods(locale, form, width);
                var result_1;
                rules.forEach(function (rule, index) {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        var _a = rule[0], hoursFrom = _a.hours, minutesFrom = _a.minutes;
                        var _b = rule[1], hoursTo = _b.hours, minutesTo = _b.minutes;
                        if (currentHours_1 >= hoursFrom && currentMinutes_1 >= minutesFrom &&
                            (currentHours_1 < hoursTo ||
                                (currentHours_1 === hoursTo && currentMinutes_1 < minutesTo))) {
                            result_1 = dayPeriods_1[index];
                        }
                    }
                    else {
                        var hours = rule.hours, minutes = rule.minutes;
                        if (hours === currentHours_1 && minutes === currentMinutes_1) {
                            result_1 = dayPeriods_1[index];
                        }
                    }
                });
                if (result_1) {
                    return result_1;
                }
            }
            // if no rules for the day periods, we use am/pm by default
            return getLocaleDayPeriods(locale, form, width)[currentHours_1 < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            var unexpected = name;
            throw new Error("unexpected translation type " + unexpected);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        var zone = -1 * offset;
        var minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        var hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
        switch (width) {
            case ZoneWidth.Short:
                return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.ShortGMT:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 1, minusSign);
            case ZoneWidth.Long:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.Extended:
                if (offset === 0) {
                    return 'Z';
                }
                else {
                    return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                        padNumber(Math.abs(zone % 60), 2, minusSign);
                }
            default:
                throw new Error("Unknown zone width \"" + width + "\"");
        }
    };
}
var JANUARY = 0;
var THURSDAY = 4;
function getFirstThursdayOfYear(year) {
    var firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
    return new Date(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
function weekGetter(size, monthBased) {
    if (monthBased === void 0) { monthBased = false; }
    return function (date, locale) {
        var result;
        if (monthBased) {
            var nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            var today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            var firstThurs = getFirstThursdayOfYear(date.getFullYear());
            var thisThurs = getThursdayThisWeek(date);
            var diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
var DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: Y, U, Q, D, F, e, c, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    var formatter;
    switch (format) {
        // Era name (AD/BC)
        case 'G':
        case 'GG':
        case 'GGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
            break;
        case 'GGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
            break;
        case 'GGGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
            break;
        // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'y':
            formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
            break;
        // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yy':
            formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
            break;
        // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yyy':
            formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
            break;
        // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'yyyy':
            formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
            break;
        // Month of the year (1-12), numeric
        case 'M':
        case 'L':
            formatter = dateGetter(DateType.Month, 1, 1);
            break;
        case 'MM':
        case 'LL':
            formatter = dateGetter(DateType.Month, 2, 1);
            break;
        // Month of the year (January, ...), string, format
        case 'MMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
            break;
        case 'MMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
            break;
        case 'MMMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
            break;
        // Month of the year (January, ...), string, standalone
        case 'LLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'LLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'LLLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        // Week of the year (1, ... 52)
        case 'w':
            formatter = weekGetter(1);
            break;
        case 'ww':
            formatter = weekGetter(2);
            break;
        // Week of the month (1, ...)
        case 'W':
            formatter = weekGetter(1, true);
            break;
        // Day of the month (1-31)
        case 'd':
            formatter = dateGetter(DateType.Date, 1);
            break;
        case 'dd':
            formatter = dateGetter(DateType.Date, 2);
            break;
        // Day of the Week
        case 'E':
        case 'EE':
        case 'EEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
            break;
        case 'EEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
            break;
        case 'EEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
            break;
        case 'EEEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
            break;
        // Generic period of the day (am-pm)
        case 'a':
        case 'aa':
        case 'aaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
            break;
        case 'aaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
            break;
        case 'aaaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
            break;
        // Extended period of the day (midnight, at night, ...), standalone
        case 'b':
        case 'bb':
        case 'bbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
            break;
        case 'bbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
            break;
        case 'bbbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
            break;
        // Extended period of the day (midnight, night, ...), standalone
        case 'B':
        case 'BB':
        case 'BBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
            break;
        case 'BBBB':
            formatter =
                dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
            break;
        case 'BBBBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
            break;
        // Hour in AM/PM, (1-12)
        case 'h':
            formatter = dateGetter(DateType.Hours, 1, -12);
            break;
        case 'hh':
            formatter = dateGetter(DateType.Hours, 2, -12);
            break;
        // Hour of the day (0-23)
        case 'H':
            formatter = dateGetter(DateType.Hours, 1);
            break;
        // Hour in day, padded (00-23)
        case 'HH':
            formatter = dateGetter(DateType.Hours, 2);
            break;
        // Minute of the hour (0-59)
        case 'm':
            formatter = dateGetter(DateType.Minutes, 1);
            break;
        case 'mm':
            formatter = dateGetter(DateType.Minutes, 2);
            break;
        // Second of the minute (0-59)
        case 's':
            formatter = dateGetter(DateType.Seconds, 1);
            break;
        case 'ss':
            formatter = dateGetter(DateType.Seconds, 2);
            break;
        // Fractional second padded (0-9)
        case 'S':
            formatter = dateGetter(DateType.Milliseconds, 1);
            break;
        case 'SS':
            formatter = dateGetter(DateType.Milliseconds, 2);
            break;
        // = millisecond
        case 'SSS':
            formatter = dateGetter(DateType.Milliseconds, 3);
            break;
        // Timezone ISO8601 short format (-0430)
        case 'Z':
        case 'ZZ':
        case 'ZZZ':
            formatter = timeZoneGetter(ZoneWidth.Short);
            break;
        // Timezone ISO8601 extended format (-04:30)
        case 'ZZZZZ':
            formatter = timeZoneGetter(ZoneWidth.Extended);
            break;
        // Timezone GMT short format (GMT+4)
        case 'O':
        case 'OO':
        case 'OOO':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'z':
        case 'zz':
        case 'zzz':
            formatter = timeZoneGetter(ZoneWidth.ShortGMT);
            break;
        // Timezone GMT long format (GMT+0430)
        case 'OOOO':
        case 'ZZZZ':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'zzzz':
            formatter = timeZoneGetter(ZoneWidth.Long);
            break;
        default:
            return null;
    }
    DATE_FORMATS[format] = formatter;
    return formatter;
}
function timezoneToOffset(timezone, fallback) {
    // Support: IE 9-11 only, Edge 13-15+
    // IE/Edge do not "understand" colon (`:`) in timezone
    timezone = timezone.replace(/:/g, '');
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
    var reverseValue = reverse ? -1 : 1;
    var dateTimezoneOffset = date.getTimezoneOffset();
    var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
export function toDate(value) {
    if (isDate(value)) {
        return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
        return new Date(value);
    }
    if (typeof value === 'string') {
        value = value.trim();
        var parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(value - parsedNb)) {
            return new Date(parsedNb);
        }
        if (/^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            /* For ISO Strings without time the day, month and year must be extracted from the ISO String
            before Date creation to avoid time offset and errors in the new Date.
            If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
            date, some browsers (e.g. IE 9) will throw an invalid Date error.
            If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
            is applied.
            Note: ISO months are 0 for January, 1 for February, ... */
            var _a = tslib_1.__read(value.split('-').map(function (val) { return +val; }), 3), y = _a[0], m = _a[1], d = _a[2];
            return new Date(y, m - 1, d);
        }
        var match = void 0;
        if (match = value.match(ISO8601_DATE_REGEX)) {
            return isoStringToDate(match);
        }
    }
    var date = new Date(value);
    if (!isDate(date)) {
        throw new Error("Unable to convert \"" + value + "\" into a date");
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match) {
    var date = new Date(0);
    var tzHour = 0;
    var tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    var dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    var timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    var h = Number(match[4] || 0) - tzHour;
    var m = Number(match[5] || 0) - tzMin;
    var s = Number(match[6] || 0);
    var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBUSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSw0QkFBNEIsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUU5VSxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FDM0Isc0dBQXNHLENBQUM7QUFDM0csZ0dBQWdHO0FBQ2hHLElBQU0sYUFBYSxHQUFxRCxFQUFFLENBQUM7QUFDM0UsSUFBTSxrQkFBa0IsR0FDcEIsbU1BQW1NLENBQUM7QUFFeE0sSUFBSyxTQUtKO0FBTEQsV0FBSyxTQUFTO0lBQ1osMkNBQUssQ0FBQTtJQUNMLGlEQUFRLENBQUE7SUFDUix5Q0FBSSxDQUFBO0lBQ0osaURBQVEsQ0FBQTtBQUNWLENBQUMsRUFMSSxTQUFTLEtBQVQsU0FBUyxRQUtiO0FBRUQsSUFBSyxRQVNKO0FBVEQsV0FBSyxRQUFRO0lBQ1gsK0NBQVEsQ0FBQTtJQUNSLHlDQUFLLENBQUE7SUFDTCx1Q0FBSSxDQUFBO0lBQ0oseUNBQUssQ0FBQTtJQUNMLDZDQUFPLENBQUE7SUFDUCw2Q0FBTyxDQUFBO0lBQ1AsdURBQVksQ0FBQTtJQUNaLHFDQUFHLENBQUE7QUFDTCxDQUFDLEVBVEksUUFBUSxLQUFSLFFBQVEsUUFTWjtBQUVELElBQUssZUFLSjtBQUxELFdBQUssZUFBZTtJQUNsQixpRUFBVSxDQUFBO0lBQ1YscURBQUksQ0FBQTtJQUNKLHlE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LENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3pDLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hDLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEMsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLGlCQUFpQixLQUFVO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9ybVN0eWxlLCBGb3JtYXRXaWR0aCwgTnVtYmVyU3ltYm9sLCBUaW1lLCBUcmFuc2xhdGlvbldpZHRoLCBnZXRMb2NhbGVEYXRlRm9ybWF0LCBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCwgZ2V0TG9jYWxlRGF5TmFtZXMsIGdldExvY2FsZURheVBlcmlvZHMsIGdldExvY2FsZUVyYU5hbWVzLCBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzLCBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHMsIGdldExvY2FsZUlkLCBnZXRMb2NhbGVNb250aE5hbWVzLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldExvY2FsZVRpbWVGb3JtYXR9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IElTTzg2MDFfREFURV9SRUdFWCA9XG4gICAgL14oXFxkezR9KS0/KFxcZFxcZCktPyhcXGRcXGQpKD86VChcXGRcXGQpKD86Oj8oXFxkXFxkKSg/Ojo/KFxcZFxcZCkoPzpcXC4oXFxkKykpPyk/KT8oWnwoWystXSkoXFxkXFxkKTo/KFxcZFxcZCkpPyk/JC87XG4vLyAgICAxICAgICAgICAyICAgICAgIDMgICAgICAgICA0ICAgICAgICAgIDUgICAgICAgICAgNiAgICAgICAgICA3ICAgICAgICAgIDggIDkgICAgIDEwICAgICAgMTFcbmNvbnN0IE5BTUVEX0ZPUk1BVFM6IHtbbG9jYWxlSWQ6IHN0cmluZ106IHtbZm9ybWF0OiBzdHJpbmddOiBzdHJpbmd9fSA9IHt9O1xuY29uc3QgREFURV9GT1JNQVRTX1NQTElUID1cbiAgICAvKCg/OlteR3lNTHdXZEVhYkJoSG1zU3paTyddKyl8KD86Jyg/OlteJ118JycpKicpfCg/Okd7MSw1fXx5ezEsNH18TXsxLDV9fEx7MSw1fXx3ezEsMn18V3sxfXxkezEsMn18RXsxLDZ9fGF7MSw1fXxiezEsNX18QnsxLDV9fGh7MSwyfXxIezEsMn18bXsxLDJ9fHN7MSwyfXxTezEsM318ensxLDR9fFp7MSw1fXxPezEsNH0pKShbXFxzXFxTXSopLztcblxuZW51bSBab25lV2lkdGgge1xuICBTaG9ydCxcbiAgU2hvcnRHTVQsXG4gIExvbmcsXG4gIEV4dGVuZGVkXG59XG5cbmVudW0gRGF0ZVR5cGUge1xuICBGdWxsWWVhcixcbiAgTW9udGgsXG4gIERhdGUsXG4gIEhvdXJzLFxuICBNaW51dGVzLFxuICBTZWNvbmRzLFxuICBNaWxsaXNlY29uZHMsXG4gIERheVxufVxuXG5lbnVtIFRyYW5zbGF0aW9uVHlwZSB7XG4gIERheVBlcmlvZHMsXG4gIERheXMsXG4gIE1vbnRocyxcbiAgRXJhc1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBkYXRlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogV2hlcmU6XG4gKiAtIGB2YWx1ZWAgaXMgYSBEYXRlLCBhIG51bWJlciAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCkgb3IgYW4gSVNPIHN0cmluZ1xuICogICAoaHR0cHM6Ly93d3cudzMub3JnL1RSL05PVEUtZGF0ZXRpbWUpLlxuICogLSBgZm9ybWF0YCBpbmRpY2F0ZXMgd2hpY2ggZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZS4gU2VlIHtAbGluayBEYXRlUGlwZX0gZm9yIG1vcmVcbiAqICAgZGV0YWlscy5cbiAqIC0gYGxvY2FsZWAgaXMgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZS5cbiAqIC0gYHRpbWV6b25lYCB0byBiZSB1c2VkIGZvciBmb3JtYXR0aW5nLiBJdCB1bmRlcnN0YW5kcyBVVEMvR01UIGFuZCB0aGUgY29udGluZW50YWwgVVMgdGltZSB6b25lXG4gKiAgIGFiYnJldmlhdGlvbnMsIGJ1dCBmb3IgZ2VuZXJhbCB1c2UsIHVzZSBhIHRpbWUgem9uZSBvZmZzZXQgKGUuZy4gYCcrMDQzMCdgKS5cbiAqICAgSWYgbm90IHNwZWNpZmllZCwgaG9zdCBzeXN0ZW0gc2V0dGluZ3MgYXJlIHVzZWQuXG4gKlxuICogU2VlIHtAbGluayBEYXRlUGlwZX0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZShcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSwgZm9ybWF0OiBzdHJpbmcsIGxvY2FsZTogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBkYXRlID0gdG9EYXRlKHZhbHVlKTtcbiAgY29uc3QgbmFtZWRGb3JtYXQgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsIGZvcm1hdCk7XG4gIGZvcm1hdCA9IG5hbWVkRm9ybWF0IHx8IGZvcm1hdDtcblxuICBsZXQgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKGZvcm1hdCkge1xuICAgIG1hdGNoID0gREFURV9GT1JNQVRTX1NQTElULmV4ZWMoZm9ybWF0KTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuY29uY2F0KG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0cy5wb3AoKTtcbiAgICAgIGlmICghcGFydCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZvcm1hdCA9IHBhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2goZm9ybWF0KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGxldCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGlmICh0aW1lem9uZSkge1xuICAgIGRhdGVUaW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XG4gICAgZGF0ZSA9IGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUsIHRydWUpO1xuICB9XG5cbiAgbGV0IHRleHQgPSAnJztcbiAgcGFydHMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgY29uc3QgZGF0ZUZvcm1hdHRlciA9IGdldERhdGVGb3JtYXR0ZXIodmFsdWUpO1xuICAgIHRleHQgKz0gZGF0ZUZvcm1hdHRlciA/XG4gICAgICAgIGRhdGVGb3JtYXR0ZXIoZGF0ZSwgbG9jYWxlLCBkYXRlVGltZXpvbmVPZmZzZXQpIDpcbiAgICAgICAgdmFsdWUgPT09ICdcXCdcXCcnID8gJ1xcJycgOiB2YWx1ZS5yZXBsYWNlKC8oXid8JyQpL2csICcnKS5yZXBsYWNlKC8nJy9nLCAnXFwnJyk7XG4gIH0pO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBnZXROYW1lZEZvcm1hdChsb2NhbGU6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsb2NhbGVJZCA9IGdldExvY2FsZUlkKGxvY2FsZSk7XG4gIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdID0gTkFNRURfRk9STUFUU1tsb2NhbGVJZF0gfHwge307XG5cbiAgaWYgKE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF0pIHtcbiAgICByZXR1cm4gTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XTtcbiAgfVxuXG4gIGxldCBmb3JtYXRWYWx1ZSA9ICcnO1xuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgJ3Nob3J0RGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW1EYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLk1lZGl1bSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGxEYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvcnRUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bVRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmdUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbFRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG9ydCc6XG4gICAgICBjb25zdCBzaG9ydFRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdzaG9ydFRpbWUnKTtcbiAgICAgIGNvbnN0IHNob3J0RGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ3Nob3J0RGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPSBmb3JtYXREYXRlVGltZShcbiAgICAgICAgICBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KSwgW3Nob3J0VGltZSwgc2hvcnREYXRlXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgY29uc3QgbWVkaXVtVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bVRpbWUnKTtcbiAgICAgIGNvbnN0IG1lZGl1bURhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdtZWRpdW1EYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKFxuICAgICAgICAgIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKSwgW21lZGl1bVRpbWUsIG1lZGl1bURhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmcnOlxuICAgICAgY29uc3QgbG9uZ1RpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nVGltZScpO1xuICAgICAgY29uc3QgbG9uZ0RhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPVxuICAgICAgICAgIGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyksIFtsb25nVGltZSwgbG9uZ0RhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgY29uc3QgZnVsbFRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsVGltZScpO1xuICAgICAgY29uc3QgZnVsbERhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPVxuICAgICAgICAgIGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCksIFtmdWxsVGltZSwgZnVsbERhdGVdKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChmb3JtYXRWYWx1ZSkge1xuICAgIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF0gPSBmb3JtYXRWYWx1ZTtcbiAgfVxuICByZXR1cm4gZm9ybWF0VmFsdWU7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVUaW1lKHN0cjogc3RyaW5nLCBvcHRfdmFsdWVzOiBzdHJpbmdbXSkge1xuICBpZiAob3B0X3ZhbHVlcykge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHsoW159XSspfS9nLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XG4gICAgICByZXR1cm4gKG9wdF92YWx1ZXMgIT0gbnVsbCAmJiBrZXkgaW4gb3B0X3ZhbHVlcykgPyBvcHRfdmFsdWVzW2tleV0gOiBtYXRjaDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBwYWROdW1iZXIoXG4gICAgbnVtOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyLCBtaW51c1NpZ24gPSAnLScsIHRyaW0/OiBib29sZWFuLCBuZWdXcmFwPzogYm9vbGVhbik6IHN0cmluZyB7XG4gIGxldCBuZWcgPSAnJztcbiAgaWYgKG51bSA8IDAgfHwgKG5lZ1dyYXAgJiYgbnVtIDw9IDApKSB7XG4gICAgaWYgKG5lZ1dyYXApIHtcbiAgICAgIG51bSA9IC1udW0gKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBudW0gPSAtbnVtO1xuICAgICAgbmVnID0gbWludXNTaWduO1xuICAgIH1cbiAgfVxuICBsZXQgc3RyTnVtID0gU3RyaW5nKG51bSk7XG4gIHdoaWxlIChzdHJOdW0ubGVuZ3RoIDwgZGlnaXRzKSB7XG4gICAgc3RyTnVtID0gJzAnICsgc3RyTnVtO1xuICB9XG4gIGlmICh0cmltKSB7XG4gICAgc3RyTnVtID0gc3RyTnVtLnN1YnN0cihzdHJOdW0ubGVuZ3RoIC0gZGlnaXRzKTtcbiAgfVxuICByZXR1cm4gbmVnICsgc3RyTnVtO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGludG8gaXRzIGxvY2FsZSBkaWdpdCByZXByZXNlbnRhdGlvblxuICovXG5mdW5jdGlvbiBkYXRlR2V0dGVyKFxuICAgIG5hbWU6IERhdGVUeXBlLCBzaXplOiBudW1iZXIsIG9mZnNldDogbnVtYmVyID0gMCwgdHJpbSA9IGZhbHNlLFxuICAgIG5lZ1dyYXAgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0ID0gZ2V0RGF0ZVBhcnQobmFtZSwgZGF0ZSwgc2l6ZSk7XG4gICAgaWYgKG9mZnNldCA+IDAgfHwgcGFydCA+IC1vZmZzZXQpIHtcbiAgICAgIHBhcnQgKz0gb2Zmc2V0O1xuICAgIH1cbiAgICBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuSG91cnMgJiYgcGFydCA9PT0gMCAmJiBvZmZzZXQgPT09IC0xMikge1xuICAgICAgcGFydCA9IDEyO1xuICAgIH1cbiAgICByZXR1cm4gcGFkTnVtYmVyKFxuICAgICAgICBwYXJ0LCBzaXplLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSwgdHJpbSwgbmVnV3JhcCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERhdGVQYXJ0KG5hbWU6IERhdGVUeXBlLCBkYXRlOiBEYXRlLCBzaXplOiBudW1iZXIpOiBudW1iZXIge1xuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIERhdGVUeXBlLkZ1bGxZZWFyOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1vbnRoOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbiAgICBjYXNlIERhdGVUeXBlLkRhdGU6XG4gICAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5Ib3VyczpcbiAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5NaW51dGVzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuU2Vjb25kczpcbiAgICAgIHJldHVybiBkYXRlLmdldFNlY29uZHMoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1pbGxpc2Vjb25kczpcbiAgICAgIGNvbnN0IGRpdiA9IHNpemUgPT09IDEgPyAxMDAgOiAoc2l6ZSA9PT0gMiA/IDEwIDogMSk7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChkYXRlLmdldE1pbGxpc2Vjb25kcygpIC8gZGl2KTtcbiAgICBjYXNlIERhdGVUeXBlLkRheTpcbiAgICAgIHJldHVybiBkYXRlLmdldERheSgpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gRGF0ZVR5cGUgdmFsdWUgXCIke25hbWV9XCIuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGRhdGVTdHJHZXR0ZXIoXG4gICAgbmFtZTogVHJhbnNsYXRpb25UeXBlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCwgZm9ybTogRm9ybVN0eWxlID0gRm9ybVN0eWxlLkZvcm1hdCxcbiAgICBleHRlbmRlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldERhdGVUcmFuc2xhdGlvbihkYXRlLCBsb2NhbGUsIG5hbWUsIHdpZHRoLCBmb3JtLCBleHRlbmRlZCk7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG9jYWxlIHRyYW5zbGF0aW9uIG9mIGEgZGF0ZSBmb3IgYSBnaXZlbiBmb3JtLCB0eXBlIGFuZCB3aWR0aFxuICovXG5mdW5jdGlvbiBnZXREYXRlVHJhbnNsYXRpb24oXG4gICAgZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsIGZvcm06IEZvcm1TdHlsZSxcbiAgICBleHRlbmRlZDogYm9vbGVhbikge1xuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5Nb250aHM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlTW9udGhOYW1lcyhsb2NhbGUsIGZvcm0sIHdpZHRoKVtkYXRlLmdldE1vbnRoKCldO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkRheXM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRGF5TmFtZXMobG9jYWxlLCBmb3JtLCB3aWR0aClbZGF0ZS5nZXREYXkoKV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kczpcbiAgICAgIGNvbnN0IGN1cnJlbnRIb3VycyA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRNaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgICBpZiAoZXh0ZW5kZWQpIHtcbiAgICAgICAgY29uc3QgcnVsZXMgPSBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZSk7XG4gICAgICAgIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHMobG9jYWxlLCBmb3JtLCB3aWR0aCk7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIHJ1bGVzLmZvckVhY2goKHJ1bGU6IFRpbWUgfCBbVGltZSwgVGltZV0sIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgLy8gbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodFxuICAgICAgICAgICAgY29uc3Qge2hvdXJzOiBob3Vyc0Zyb20sIG1pbnV0ZXM6IG1pbnV0ZXNGcm9tfSA9IHJ1bGVbMF07XG4gICAgICAgICAgICBjb25zdCB7aG91cnM6IGhvdXJzVG8sIG1pbnV0ZXM6IG1pbnV0ZXNUb30gPSBydWxlWzFdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3VycyA+PSBob3Vyc0Zyb20gJiYgY3VycmVudE1pbnV0ZXMgPj0gbWludXRlc0Zyb20gJiZcbiAgICAgICAgICAgICAgICAoY3VycmVudEhvdXJzIDwgaG91cnNUbyB8fFxuICAgICAgICAgICAgICAgICAoY3VycmVudEhvdXJzID09PSBob3Vyc1RvICYmIGN1cnJlbnRNaW51dGVzIDwgbWludXRlc1RvKSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGF5UGVyaW9kc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHsgIC8vIG5vb24gb3IgbWlkbmlnaHRcbiAgICAgICAgICAgIGNvbnN0IHtob3VycywgbWludXRlc30gPSBydWxlO1xuICAgICAgICAgICAgaWYgKGhvdXJzID09PSBjdXJyZW50SG91cnMgJiYgbWludXRlcyA9PT0gY3VycmVudE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGF5UGVyaW9kc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlmIG5vIHJ1bGVzIGZvciB0aGUgZGF5IHBlcmlvZHMsIHdlIHVzZSBhbS9wbSBieSBkZWZhdWx0XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRGF5UGVyaW9kcyhsb2NhbGUsIGZvcm0sIDxUcmFuc2xhdGlvbldpZHRoPndpZHRoKVtjdXJyZW50SG91cnMgPCAxMiA/IDAgOiAxXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5FcmFzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZUVyYU5hbWVzKGxvY2FsZSwgPFRyYW5zbGF0aW9uV2lkdGg+d2lkdGgpW2RhdGUuZ2V0RnVsbFllYXIoKSA8PSAwID8gMCA6IDFdO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBUaGlzIGRlZmF1bHQgY2FzZSBpcyBub3QgbmVlZGVkIGJ5IFR5cGVTY3JpcHQgY29tcGlsZXIsIGFzIHRoZSBzd2l0Y2ggaXMgZXhoYXVzdGl2ZS5cbiAgICAgIC8vIEhvd2V2ZXIgQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgYW5kIHJlcG9ydHMgYW4gZXJyb3IgaW4gdHlwZWQgbW9kZS5cbiAgICAgIC8vIFRoZSBgdGhyb3cgbmV3IEVycm9yYCBiZWxvdyB3b3JrcyBhcm91bmQgdGhlIHByb2JsZW0sIGFuZCB0aGUgdW5leHBlY3RlZDogbmV2ZXIgdmFyaWFibGVcbiAgICAgIC8vIG1ha2VzIHN1cmUgdHNjIHN0aWxsIGNoZWNrcyB0aGlzIGNvZGUgaXMgdW5yZWFjaGFibGUuXG4gICAgICBjb25zdCB1bmV4cGVjdGVkOiBuZXZlciA9IG5hbWU7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuZXhwZWN0ZWQgdHJhbnNsYXRpb24gdHlwZSAke3VuZXhwZWN0ZWR9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBhbmQgYW4gb2Zmc2V0IGludG8gYSB0aW1lem9uZSB3aXRoIElTTzg2MDEgb3JcbiAqIEdNVCBmb3JtYXQgZGVwZW5kaW5nIG9uIHRoZSB3aWR0aCAoZWc6IHNob3J0ID0gKzA0MzAsIHNob3J0OkdNVCA9IEdNVCs0LCBsb25nID0gR01UKzA0OjMwLFxuICogZXh0ZW5kZWQgPSArMDQ6MzApXG4gKi9cbmZ1bmN0aW9uIHRpbWVab25lR2V0dGVyKHdpZHRoOiBab25lV2lkdGgpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikge1xuICAgIGNvbnN0IHpvbmUgPSAtMSAqIG9mZnNldDtcbiAgICBjb25zdCBtaW51c1NpZ24gPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKTtcbiAgICBjb25zdCBob3VycyA9IHpvbmUgPiAwID8gTWF0aC5mbG9vcih6b25lIC8gNjApIDogTWF0aC5jZWlsKHpvbmUgLyA2MCk7XG4gICAgc3dpdGNoICh3aWR0aCkge1xuICAgICAgY2FzZSBab25lV2lkdGguU2hvcnQ6XG4gICAgICAgIHJldHVybiAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydEdNVDpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAxLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguTG9uZzpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICsgJzonICtcbiAgICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguRXh0ZW5kZWQ6XG4gICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJ1onO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgKyAnOicgK1xuICAgICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKTtcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHpvbmUgd2lkdGggXCIke3dpZHRofVwiYCk7XG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBKQU5VQVJZID0gMDtcbmNvbnN0IFRIVVJTREFZID0gNDtcbmZ1bmN0aW9uIGdldEZpcnN0VGh1cnNkYXlPZlllYXIoeWVhcjogbnVtYmVyKSB7XG4gIGNvbnN0IGZpcnN0RGF5T2ZZZWFyID0gKG5ldyBEYXRlKHllYXIsIEpBTlVBUlksIDEpKS5nZXREYXkoKTtcbiAgcmV0dXJuIG5ldyBEYXRlKFxuICAgICAgeWVhciwgMCwgMSArICgoZmlyc3REYXlPZlllYXIgPD0gVEhVUlNEQVkpID8gVEhVUlNEQVkgOiBUSFVSU0RBWSArIDcpIC0gZmlyc3REYXlPZlllYXIpO1xufVxuXG5mdW5jdGlvbiBnZXRUaHVyc2RheVRoaXNXZWVrKGRhdGV0aW1lOiBEYXRlKSB7XG4gIHJldHVybiBuZXcgRGF0ZShcbiAgICAgIGRhdGV0aW1lLmdldEZ1bGxZZWFyKCksIGRhdGV0aW1lLmdldE1vbnRoKCksXG4gICAgICBkYXRldGltZS5nZXREYXRlKCkgKyAoVEhVUlNEQVkgLSBkYXRldGltZS5nZXREYXkoKSkpO1xufVxuXG5mdW5jdGlvbiB3ZWVrR2V0dGVyKHNpemU6IG51bWJlciwgbW9udGhCYXNlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZykge1xuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKG1vbnRoQmFzZWQpIHtcbiAgICAgIGNvbnN0IG5iRGF5c0JlZm9yZTFzdERheU9mTW9udGggPVxuICAgICAgICAgIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSAtIDE7XG4gICAgICBjb25zdCB0b2RheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGguZmxvb3IoKHRvZGF5ICsgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCkgLyA3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmlyc3RUaHVycyA9IGdldEZpcnN0VGh1cnNkYXlPZlllYXIoZGF0ZS5nZXRGdWxsWWVhcigpKTtcbiAgICAgIGNvbnN0IHRoaXNUaHVycyA9IGdldFRodXJzZGF5VGhpc1dlZWsoZGF0ZSk7XG4gICAgICBjb25zdCBkaWZmID0gdGhpc1RodXJzLmdldFRpbWUoKSAtIGZpcnN0VGh1cnMuZ2V0VGltZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGgucm91bmQoZGlmZiAvIDYuMDQ4ZTgpOyAgLy8gNi4wNDhlOCBtcyBwZXIgd2Vla1xuICAgIH1cblxuICAgIHJldHVybiBwYWROdW1iZXIocmVzdWx0LCBzaXplLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG4gIH07XG59XG5cbnR5cGUgRGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgb2Zmc2V0PzogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbmNvbnN0IERBVEVfRk9STUFUUzoge1tmb3JtYXQ6IHN0cmluZ106IERhdGVGb3JtYXR0ZXJ9ID0ge307XG5cbi8vIEJhc2VkIG9uIENMRFIgZm9ybWF0czpcbi8vIFNlZSBjb21wbGV0ZSBsaXN0OiBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbi8vIFNlZSBhbHNvIGV4cGxhbmF0aW9uczogaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lXG4vLyBUT0RPKG9jb21iZSk6IHN1cHBvcnQgYWxsIG1pc3NpbmcgY2xkciBmb3JtYXRzOiBZLCBVLCBRLCBELCBGLCBlLCBjLCBqLCBKLCBDLCBBLCB2LCBWLCBYLCB4XG5mdW5jdGlvbiBnZXREYXRlRm9ybWF0dGVyKGZvcm1hdDogc3RyaW5nKTogRGF0ZUZvcm1hdHRlcnxudWxsIHtcbiAgaWYgKERBVEVfRk9STUFUU1tmb3JtYXRdKSB7XG4gICAgcmV0dXJuIERBVEVfRk9STUFUU1tmb3JtYXRdO1xuICB9XG4gIGxldCBmb3JtYXR0ZXI7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgLy8gRXJhIG5hbWUgKEFEL0JDKVxuICAgIGNhc2UgJ0cnOlxuICAgIGNhc2UgJ0dHJzpcbiAgICBjYXNlICdHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIDEgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIGUuZy4gKEFEIDEgPT4gMSwgQUQgMTk5ID0+IDE5OSlcbiAgICBjYXNlICd5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDEsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIHBhZGRlZCAoMDAtOTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDIsIDAsIHRydWUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMyBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMDAtOTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQUQgMjAxMCA9PiAxMClcbiAgICBjYXNlICd5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMywgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gNCBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICBjYXNlICd5eXl5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDQsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKDEtMTIpLCBudW1lcmljXG4gICAgY2FzZSAnTSc6XG4gICAgY2FzZSAnTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAxLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NJzpcbiAgICBjYXNlICdMTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAyLCAxKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKEphbnVhcnksIC4uLiksIHN0cmluZywgZm9ybWF0XG4gICAgY2FzZSAnTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdywgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSB5ZWFyICgxLCAuLi4gNTIpXG4gICAgY2FzZSAndyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd3cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gV2VlayBvZiB0aGUgbW9udGggKDEsIC4uLilcbiAgICBjYXNlICdXJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIERheSBvZiB0aGUgbW9udGggKDEtMzEpXG4gICAgY2FzZSAnZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGQnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5EYXRlLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBXZWVrXG4gICAgY2FzZSAnRSc6XG4gICAgY2FzZSAnRUUnOlxuICAgIGNhc2UgJ0VFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gR2VuZXJpYyBwZXJpb2Qgb2YgdGhlIGRheSAoYW0tcG0pXG4gICAgY2FzZSAnYSc6XG4gICAgY2FzZSAnYWEnOlxuICAgIGNhc2UgJ2FhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXh0ZW5kZWQgcGVyaW9kIG9mIHRoZSBkYXkgKG1pZG5pZ2h0LCBhdCBuaWdodCwgLi4uKSwgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ2InOlxuICAgIGNhc2UgJ2JiJzpcbiAgICBjYXNlICdiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCwgRm9ybVN0eWxlLlN0YW5kYWxvbmUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmJiYic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5TdGFuZGFsb25lLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEV4dGVuZGVkIHBlcmlvZCBvZiB0aGUgZGF5IChtaWRuaWdodCwgbmlnaHQsIC4uLiksIHN0YW5kYWxvbmVcbiAgICBjYXNlICdCJzpcbiAgICBjYXNlICdCQic6XG4gICAgY2FzZSAnQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5Gb3JtYXQsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQkJCQic6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCQic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdywgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEhvdXIgaW4gQU0vUE0sICgxLTEyKVxuICAgIGNhc2UgJ2gnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMSwgLTEyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2hoJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDIsIC0xMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIEhvdXIgb2YgdGhlIGRheSAoMC0yMylcbiAgICBjYXNlICdIJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSG91ciBpbiBkYXksIHBhZGRlZCAoMDAtMjMpXG4gICAgY2FzZSAnSEgnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1pbnV0ZSBvZiB0aGUgaG91ciAoMC01OSlcbiAgICBjYXNlICdtJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWludXRlcywgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtbSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1pbnV0ZXMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBTZWNvbmQgb2YgdGhlIG1pbnV0ZSAoMC01OSlcbiAgICBjYXNlICdzJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuU2Vjb25kcywgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzcyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLlNlY29uZHMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBGcmFjdGlvbmFsIHNlY29uZCBwYWRkZWQgKDAtOSlcbiAgICBjYXNlICdTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWlsbGlzZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWlsbGlzZWNvbmRzLCAyKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vID0gbWlsbGlzZWNvbmRcbiAgICBjYXNlICdTU1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaWxsaXNlY29uZHMsIDMpO1xuICAgICAgYnJlYWs7XG5cblxuICAgIC8vIFRpbWV6b25lIElTTzg2MDEgc2hvcnQgZm9ybWF0ICgtMDQzMClcbiAgICBjYXNlICdaJzpcbiAgICBjYXNlICdaWic6XG4gICAgY2FzZSAnWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBJU084NjAxIGV4dGVuZGVkIGZvcm1hdCAoLTA0OjMwKVxuICAgIGNhc2UgJ1paWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5FeHRlbmRlZCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFRpbWV6b25lIEdNVCBzaG9ydCBmb3JtYXQgKEdNVCs0KVxuICAgIGNhc2UgJ08nOlxuICAgIGNhc2UgJ09PJzpcbiAgICBjYXNlICdPT08nOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3onOlxuICAgIGNhc2UgJ3p6JzpcbiAgICBjYXNlICd6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLlNob3J0R01UKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRpbWV6b25lIEdNVCBsb25nIGZvcm1hdCAoR01UKzA0MzApXG4gICAgY2FzZSAnT09PTyc6XG4gICAgY2FzZSAnWlpaWic6XG4gICAgLy8gU2hvdWxkIGJlIGxvY2F0aW9uLCBidXQgZmFsbGJhY2sgdG8gZm9ybWF0IE8gaW5zdGVhZCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGRhdGEgeWV0XG4gICAgY2FzZSAnenp6eic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgREFURV9GT1JNQVRTW2Zvcm1hdF0gPSBmb3JtYXR0ZXI7XG4gIHJldHVybiBmb3JtYXR0ZXI7XG59XG5cbmZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmU6IHN0cmluZywgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIC8vIFN1cHBvcnQ6IElFIDktMTEgb25seSwgRWRnZSAxMy0xNStcbiAgLy8gSUUvRWRnZSBkbyBub3QgXCJ1bmRlcnN0YW5kXCIgY29sb24gKGA6YCkgaW4gdGltZXpvbmVcbiAgdGltZXpvbmUgPSB0aW1lem9uZS5yZXBsYWNlKC86L2csICcnKTtcbiAgY29uc3QgcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQgPSBEYXRlLnBhcnNlKCdKYW4gMDEsIDE5NzAgMDA6MDA6MDAgJyArIHRpbWV6b25lKSAvIDYwMDAwO1xuICByZXR1cm4gaXNOYU4ocmVxdWVzdGVkVGltZXpvbmVPZmZzZXQpID8gZmFsbGJhY2sgOiByZXF1ZXN0ZWRUaW1lem9uZU9mZnNldDtcbn1cblxuZnVuY3Rpb24gYWRkRGF0ZU1pbnV0ZXMoZGF0ZTogRGF0ZSwgbWludXRlczogbnVtYmVyKSB7XG4gIGRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XG4gIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIG1pbnV0ZXMpO1xuICByZXR1cm4gZGF0ZTtcbn1cblxuZnVuY3Rpb24gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlOiBEYXRlLCB0aW1lem9uZTogc3RyaW5nLCByZXZlcnNlOiBib29sZWFuKTogRGF0ZSB7XG4gIGNvbnN0IHJldmVyc2VWYWx1ZSA9IHJldmVyc2UgPyAtMSA6IDE7XG4gIGNvbnN0IGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgY29uc3QgdGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xuICByZXR1cm4gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgcmV2ZXJzZVZhbHVlICogKHRpbWV6b25lT2Zmc2V0IC0gZGF0ZVRpbWV6b25lT2Zmc2V0KSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSB2YWx1ZSB0byBkYXRlLlxuICpcbiAqIFN1cHBvcnRlZCBpbnB1dCBmb3JtYXRzOlxuICogLSBgRGF0ZWBcbiAqIC0gbnVtYmVyOiB0aW1lc3RhbXBcbiAqIC0gc3RyaW5nOiBudW1lcmljIChlLmcuIFwiMTIzNFwiKSwgSVNPIGFuZCBkYXRlIHN0cmluZ3MgaW4gYSBmb3JtYXQgc3VwcG9ydGVkIGJ5XG4gKiAgIFtEYXRlLnBhcnNlKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0RhdGUvcGFyc2UpLlxuICogICBOb3RlOiBJU08gc3RyaW5ncyB3aXRob3V0IHRpbWUgcmV0dXJuIGEgZGF0ZSB3aXRob3V0IHRpbWVvZmZzZXQuXG4gKlxuICogVGhyb3dzIGlmIHVuYWJsZSB0byBjb252ZXJ0IHRvIGEgZGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvRGF0ZSh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSk6IERhdGUge1xuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodmFsdWUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcblxuICAgIGNvbnN0IHBhcnNlZE5iID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG5cbiAgICAvLyBhbnkgc3RyaW5nIHRoYXQgb25seSBjb250YWlucyBudW1iZXJzLCBsaWtlIFwiMTIzNFwiIGJ1dCBub3QgbGlrZSBcIjEyMzRoZWxsb1wiXG4gICAgaWYgKCFpc05hTih2YWx1ZSBhcyBhbnkgLSBwYXJzZWROYikpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZWROYik7XG4gICAgfVxuXG4gICAgaWYgKC9eKFxcZHs0fS1cXGR7MSwyfS1cXGR7MSwyfSkkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLyogRm9yIElTTyBTdHJpbmdzIHdpdGhvdXQgdGltZSB0aGUgZGF5LCBtb250aCBhbmQgeWVhciBtdXN0IGJlIGV4dHJhY3RlZCBmcm9tIHRoZSBJU08gU3RyaW5nXG4gICAgICBiZWZvcmUgRGF0ZSBjcmVhdGlvbiB0byBhdm9pZCB0aW1lIG9mZnNldCBhbmQgZXJyb3JzIGluIHRoZSBuZXcgRGF0ZS5cbiAgICAgIElmIHdlIG9ubHkgcmVwbGFjZSAnLScgd2l0aCAnLCcgaW4gdGhlIElTTyBTdHJpbmcgKFwiMjAxNSwwMSwwMVwiKSwgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXdcbiAgICAgIGRhdGUsIHNvbWUgYnJvd3NlcnMgKGUuZy4gSUUgOSkgd2lsbCB0aHJvdyBhbiBpbnZhbGlkIERhdGUgZXJyb3IuXG4gICAgICBJZiB3ZSBsZWF2ZSB0aGUgJy0nIChcIjIwMTUtMDEtMDFcIikgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXcgRGF0ZShcIjIwMTUtMDEtMDFcIikgdGhlIHRpbWVvZmZzZXRcbiAgICAgIGlzIGFwcGxpZWQuXG4gICAgICBOb3RlOiBJU08gbW9udGhzIGFyZSAwIGZvciBKYW51YXJ5LCAxIGZvciBGZWJydWFyeSwgLi4uICovXG4gICAgICBjb25zdCBbeSwgbSwgZF0gPSB2YWx1ZS5zcGxpdCgnLScpLm1hcCgodmFsOiBzdHJpbmcpID0+ICt2YWwpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHksIG0gLSAxLCBkKTtcbiAgICB9XG5cbiAgICBsZXQgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXl8bnVsbDtcbiAgICBpZiAobWF0Y2ggPSB2YWx1ZS5tYXRjaChJU084NjAxX0RBVEVfUkVHRVgpKSB7XG4gICAgICByZXR1cm4gaXNvU3RyaW5nVG9EYXRlKG1hdGNoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUgYXMgYW55KTtcbiAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0IFwiJHt2YWx1ZX1cIiBpbnRvIGEgZGF0ZWApO1xuICB9XG4gIHJldHVybiBkYXRlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGF0ZSBpbiBJU084NjAxIHRvIGEgRGF0ZS5cbiAqIFVzZWQgaW5zdGVhZCBvZiBgRGF0ZS5wYXJzZWAgYmVjYXVzZSBvZiBicm93c2VyIGRpc2NyZXBhbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc29TdHJpbmdUb0RhdGUobWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXkpOiBEYXRlIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDApO1xuICBsZXQgdHpIb3VyID0gMDtcbiAgbGV0IHR6TWluID0gMDtcblxuICAvLyBtYXRjaFs4XSBtZWFucyB0aGF0IHRoZSBzdHJpbmcgY29udGFpbnMgXCJaXCIgKFVUQykgb3IgYSB0aW1lem9uZSBsaWtlIFwiKzAxOjAwXCIgb3IgXCIrMDEwMFwiXG4gIGNvbnN0IGRhdGVTZXR0ZXIgPSBtYXRjaFs4XSA/IGRhdGUuc2V0VVRDRnVsbFllYXIgOiBkYXRlLnNldEZ1bGxZZWFyO1xuICBjb25zdCB0aW1lU2V0dGVyID0gbWF0Y2hbOF0gPyBkYXRlLnNldFVUQ0hvdXJzIDogZGF0ZS5zZXRIb3VycztcblxuICAvLyBpZiB0aGVyZSBpcyBhIHRpbWV6b25lIGRlZmluZWQgbGlrZSBcIiswMTowMFwiIG9yIFwiKzAxMDBcIlxuICBpZiAobWF0Y2hbOV0pIHtcbiAgICB0ekhvdXIgPSBOdW1iZXIobWF0Y2hbOV0gKyBtYXRjaFsxMF0pO1xuICAgIHR6TWluID0gTnVtYmVyKG1hdGNoWzldICsgbWF0Y2hbMTFdKTtcbiAgfVxuICBkYXRlU2V0dGVyLmNhbGwoZGF0ZSwgTnVtYmVyKG1hdGNoWzFdKSwgTnVtYmVyKG1hdGNoWzJdKSAtIDEsIE51bWJlcihtYXRjaFszXSkpO1xuICBjb25zdCBoID0gTnVtYmVyKG1hdGNoWzRdIHx8IDApIC0gdHpIb3VyO1xuICBjb25zdCBtID0gTnVtYmVyKG1hdGNoWzVdIHx8IDApIC0gdHpNaW47XG4gIGNvbnN0IHMgPSBOdW1iZXIobWF0Y2hbNl0gfHwgMCk7XG4gIGNvbnN0IG1zID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCcwLicgKyAobWF0Y2hbN10gfHwgMCkpICogMTAwMCk7XG4gIHRpbWVTZXR0ZXIuY2FsbChkYXRlLCBoLCBtLCBzLCBtcyk7XG4gIHJldHVybiBkYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBEYXRlIHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4odmFsdWUudmFsdWVPZigpKTtcbn1cbiJdfQ==