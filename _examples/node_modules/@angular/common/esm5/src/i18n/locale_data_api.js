/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import localeEn from './locale_en';
import { LOCALE_DATA } from './locale_data';
import { CURRENCIES_EN } from './currencies';
/**
 * The different format styles that can be used to represent numbers.
 * Used by the function {@link getLocaleNumberFormat}.
 *
 * @experimental i18n support is experimental.
 */
export var NumberFormatStyle;
(function (NumberFormatStyle) {
    NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
    NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
    NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
    NumberFormatStyle[NumberFormatStyle["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
/** @experimental */
export var Plural;
(function (Plural) {
    Plural[Plural["Zero"] = 0] = "Zero";
    Plural[Plural["One"] = 1] = "One";
    Plural[Plural["Two"] = 2] = "Two";
    Plural[Plural["Few"] = 3] = "Few";
    Plural[Plural["Many"] = 4] = "Many";
    Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
/**
 * Some languages use two different forms of strings (standalone and format) depending on the
 * context.
 * Typically the standalone version is the nominative form of the word, and the format version is in
 * the genitive.
 * See [the CLDR website](http://cldr.unicode.org/translation/date-time) for more information.
 *
 * @experimental i18n support is experimental.
 */
export var FormStyle;
(function (FormStyle) {
    FormStyle[FormStyle["Format"] = 0] = "Format";
    FormStyle[FormStyle["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
/**
 * Multiple widths are available for translations: narrow (1 character), abbreviated (3 characters),
 * wide (full length), and short (2 characters, only for days).
 *
 * For example the day `Sunday` will be:
 * - Narrow: `S`
 * - Short: `Su`
 * - Abbreviated: `Sun`
 * - Wide: `Sunday`
 *
 * @experimental i18n support is experimental.
 */
export var TranslationWidth;
(function (TranslationWidth) {
    TranslationWidth[TranslationWidth["Narrow"] = 0] = "Narrow";
    TranslationWidth[TranslationWidth["Abbreviated"] = 1] = "Abbreviated";
    TranslationWidth[TranslationWidth["Wide"] = 2] = "Wide";
    TranslationWidth[TranslationWidth["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
/**
 * Multiple widths are available for formats: short (minimal amount of data), medium (small amount
 * of data), long (complete amount of data), full (complete amount of data and extra information).
 *
 * For example the date-time formats for the english locale will be:
 *  - `'short'`: `'M/d/yy, h:mm a'` (e.g. `6/15/15, 9:03 AM`)
 *  - `'medium'`: `'MMM d, y, h:mm:ss a'` (e.g. `Jun 15, 2015, 9:03:01 AM`)
 *  - `'long'`: `'MMMM d, y, h:mm:ss a z'` (e.g. `June 15, 2015 at 9:03:01 AM GMT+1`)
 *  - `'full'`: `'EEEE, MMMM d, y, h:mm:ss a zzzz'` (e.g. `Monday, June 15, 2015 at
 * 9:03:01 AM GMT+01:00`)
 *
 * @experimental i18n support is experimental.
 */
export var FormatWidth;
(function (FormatWidth) {
    FormatWidth[FormatWidth["Short"] = 0] = "Short";
    FormatWidth[FormatWidth["Medium"] = 1] = "Medium";
    FormatWidth[FormatWidth["Long"] = 2] = "Long";
    FormatWidth[FormatWidth["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
/**
 * Number symbol that can be used to replace placeholders in number patterns.
 * The placeholders are based on english values:
 *
 * | Name                   | Example for en-US | Meaning                                     |
 * |------------------------|-------------------|---------------------------------------------|
 * | decimal                | 2,345`.`67        | decimal separator                           |
 * | group                  | 2`,`345.67        | grouping separator, typically for thousands |
 * | plusSign               | `+`23             | the plus sign used with numbers             |
 * | minusSign              | `-`23             | the minus sign used with numbers            |
 * | percentSign            | 23.4`%`           | the percent sign (out of 100)               |
 * | perMille               | 234`‰`            | the permille sign (out of 1000)             |
 * | exponential            | 1.2`E`3           | used in computers for 1.2×10³.              |
 * | superscriptingExponent | 1.2`×`103         | human-readable format of exponential        |
 * | infinity               | `∞`               | used in +∞ and -∞.                          |
 * | nan                    | `NaN`             | "not a number".                             |
 * | timeSeparator          | 10`:`52           | symbol used between time units              |
 * | currencyDecimal        | $2,345`.`67       | decimal separator, fallback to "decimal"    |
 * | currencyGroup          | $2`,`345.67       | grouping separator, fallback to "group"     |
 *
 * @experimental i18n support is experimental.
 */
export var NumberSymbol;
(function (NumberSymbol) {
    NumberSymbol[NumberSymbol["Decimal"] = 0] = "Decimal";
    NumberSymbol[NumberSymbol["Group"] = 1] = "Group";
    NumberSymbol[NumberSymbol["List"] = 2] = "List";
    NumberSymbol[NumberSymbol["PercentSign"] = 3] = "PercentSign";
    NumberSymbol[NumberSymbol["PlusSign"] = 4] = "PlusSign";
    NumberSymbol[NumberSymbol["MinusSign"] = 5] = "MinusSign";
    NumberSymbol[NumberSymbol["Exponential"] = 6] = "Exponential";
    NumberSymbol[NumberSymbol["SuperscriptingExponent"] = 7] = "SuperscriptingExponent";
    NumberSymbol[NumberSymbol["PerMille"] = 8] = "PerMille";
    NumberSymbol[NumberSymbol["Infinity"] = 9] = "Infinity";
    NumberSymbol[NumberSymbol["NaN"] = 10] = "NaN";
    NumberSymbol[NumberSymbol["TimeSeparator"] = 11] = "TimeSeparator";
    NumberSymbol[NumberSymbol["CurrencyDecimal"] = 12] = "CurrencyDecimal";
    NumberSymbol[NumberSymbol["CurrencyGroup"] = 13] = "CurrencyGroup";
})(NumberSymbol || (NumberSymbol = {}));
/**
 * The value for each day of the week, based on the en-US locale
 *
 * @experimental
 */
export var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
    WeekDay[WeekDay["Monday"] = 1] = "Monday";
    WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
    WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
    WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
    WeekDay[WeekDay["Friday"] = 5] = "Friday";
    WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
/**
 * The locale id for the chosen locale (e.g `en-GB`).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleId(locale) {
    return findLocaleData(locale)[0 /* LocaleId */];
}
/**
 * Periods of the day (e.g. `[AM, PM]` for en-US).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    var data = findLocaleData(locale);
    var amPmData = [data[1 /* DayPeriodsFormat */], data[2 /* DayPeriodsStandalone */]];
    var amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Days of the week for the Gregorian calendar (e.g. `[Sunday, Monday, ... Saturday]` for en-US).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleDayNames(locale, formStyle, width) {
    var data = findLocaleData(locale);
    var daysData = [data[3 /* DaysFormat */], data[4 /* DaysStandalone */]];
    var days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Months of the year for the Gregorian calendar (e.g. `[January, February, ...]` for en-US).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    var data = findLocaleData(locale);
    var monthsData = [data[5 /* MonthsFormat */], data[6 /* MonthsStandalone */]];
    var months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Eras for the Gregorian calendar (e.g. AD/BC).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleEraNames(locale, width) {
    var data = findLocaleData(locale);
    var erasData = data[7 /* Eras */];
    return getLastDefinedValue(erasData, width);
}
/**
 * First day of the week for this locale, based on english days (Sunday = 0, Monday = 1, ...).
 * For example in french the value would be 1 because the first day of the week is Monday.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleFirstDayOfWeek(locale) {
    var data = findLocaleData(locale);
    return data[8 /* FirstDayOfWeek */];
}
/**
 * Range of days in the week that represent the week-end for this locale, based on english days
 * (Sunday = 0, Monday = 1, ...).
 * For example in english the value would be [6,0] for Saturday to Sunday.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleWeekEndRange(locale) {
    var data = findLocaleData(locale);
    return data[9 /* WeekendRange */];
}
/**
 * Date format that depends on the locale.
 *
 * There are four basic date formats:
 * - `full` should contain long-weekday (EEEE), year (y), long-month (MMMM), day (d).
 *
 *  For example, English uses `EEEE, MMMM d, y`, corresponding to a date like
 *  "Tuesday, September 14, 1999".
 *
 * - `long` should contain year, long-month, day.
 *
 *  For example, `MMMM d, y`, corresponding to a date like "September 14, 1999".
 *
 * - `medium` should contain year, abbreviated-month (MMM), day.
 *
 *  For example, `MMM d, y`, corresponding to a date like "Sep 14, 1999".
 *  For languages that do not use abbreviated months, use the numeric month (MM/M). For example,
 *  `y/MM/dd`, corresponding to a date like "1999/09/14".
 *
 * - `short` should contain year, numeric-month (MM/M), and day.
 *
 *  For example, `M/d/yy`, corresponding to a date like "9/14/99".
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleDateFormat(locale, width) {
    var data = findLocaleData(locale);
    return getLastDefinedValue(data[10 /* DateFormat */], width);
}
/**
 * Time format that depends on the locale.
 *
 * The standard formats include four basic time formats:
 * - `full` should contain hour (h/H), minute (mm), second (ss), and zone (zzzz).
 * - `long` should contain hour, minute, second, and zone (z)
 * - `medium` should contain hour, minute, second.
 * - `short` should contain hour, minute.
 *
 * Note: The patterns depend on whether the main country using your language uses 12-hour time or
 * not:
 * - For 12-hour time, use a pattern like `hh:mm a` using h to mean a 12-hour clock cycle running
 * 1 through 12 (midnight plus 1 minute is 12:01), or using K to mean a 12-hour clock cycle
 * running 0 through 11 (midnight plus 1 minute is 0:01).
 * - For 24-hour time, use a pattern like `HH:mm` using H to mean a 24-hour clock cycle running 0
 * through 23 (midnight plus 1 minute is 0:01), or using k to mean a 24-hour clock cycle running
 * 1 through 24 (midnight plus 1 minute is 24:01).
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleTimeFormat(locale, width) {
    var data = findLocaleData(locale);
    return getLastDefinedValue(data[11 /* TimeFormat */], width);
}
/**
 * Date-time format that depends on the locale.
 *
 * The date-time pattern shows how to combine separate patterns for date (represented by {1})
 * and time (represented by {0}) into a single pattern. It usually doesn't need to be changed.
 * What you want to pay attention to are:
 * - possibly removing a space for languages that don't use it, such as many East Asian languages
 * - possibly adding a comma, other punctuation, or a combining word
 *
 * For example:
 * - English uses `{1} 'at' {0}` or `{1}, {0}` (depending on date style), while Japanese uses
 *  `{1}{0}`.
 * - An English formatted date-time using the combining pattern `{1}, {0}` could be
 *  `Dec 10, 2010, 3:59:49 PM`. Notice the comma and space between the date portion and the time
 *  portion.
 *
 * There are four formats (`full`, `long`, `medium`, `short`); the determination of which to use
 * is normally based on the date style. For example, if the date has a full month and weekday
 * name, the full combining pattern will be used to combine that with a time. If the date has
 * numeric month, the short version of the combining pattern will be used to combine that with a
 * time. English uses `{1} 'at' {0}` for full and long styles, and `{1}, {0}` for medium and short
 * styles.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleDateTimeFormat(locale, width) {
    var data = findLocaleData(locale);
    var dateTimeFormatData = data[12 /* DateTimeFormat */];
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Number symbol that can be used to replace placeholders in number formats.
 * See {@link NumberSymbol} for more information.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleNumberSymbol(locale, symbol) {
    var data = findLocaleData(locale);
    var res = data[13 /* NumberSymbols */][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[13 /* NumberSymbols */][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[13 /* NumberSymbols */][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Number format that depends on the locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,67". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders;
 * they stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders; for example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the Number Symbols for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | This will be replaced by a currency symbol, such as $ or USD. |
 * | % | This marks a percent format. The % symbol may change position, but must be retained. |
 * | E | This marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * You can find more information
 * [on the CLDR website](http://cldr.unicode.org/translation/number-patterns)
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleNumberFormat(locale, type) {
    var data = findLocaleData(locale);
    return data[14 /* NumberFormats */][type];
}
/**
 * The symbol used to represent the currency for the main country using this locale (e.g. $ for
 * the locale en-US).
 * The symbol will be `null` if the main country cannot be determined.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleCurrencySymbol(locale) {
    var data = findLocaleData(locale);
    return data[15 /* CurrencySymbol */] || null;
}
/**
 * The name of the currency for the main country using this locale (e.g. USD for the locale
 * en-US).
 * The name will be `null` if the main country cannot be determined.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleCurrencyName(locale) {
    var data = findLocaleData(locale);
    return data[16 /* CurrencyName */] || null;
}
/**
 * Returns the currency values for the locale
 */
function getLocaleCurrencies(locale) {
    var data = findLocaleData(locale);
    return data[17 /* Currencies */];
}
/**
 * The locale plural function used by ICU expressions to determine the plural case to use.
 * See {@link NgPlural} for more information.
 *
 * @experimental i18n support is experimental.
 */
export function getLocalePluralCase(locale) {
    var data = findLocaleData(locale);
    return data[18 /* PluralCase */];
}
function checkFullData(data) {
    if (!data[19 /* ExtraData */]) {
        throw new Error("Missing extra locale data for the locale \"" + data[0 /* LocaleId */] + "\". Use \"registerLocaleData\" to load new data. See the \"I18n guide\" on angular.io to know more.");
    }
}
/**
 * Rules used to determine which day period to use (See `dayPeriods` below).
 * The rules can either be an array or a single value. If it's an array, consider it as "from"
 * and "to". If it's a single value then it means that the period is only valid at this exact
 * value.
 * There is always the same number of rules as the number of day periods, which means that the
 * first rule is applied to the first day period and so on.
 * You should fallback to AM/PM when there are no rules available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleExtraDayPeriodRules(locale) {
    var data = findLocaleData(locale);
    checkFullData(data);
    var rules = data[19 /* ExtraData */][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map(function (rule) {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Day Periods indicate roughly how the day is broken up in different languages (e.g. morning,
 * noon, afternoon, midnight, ...).
 * You should use the function {@link getLocaleExtraDayPeriodRules} to determine which period to
 * use.
 * You should fallback to AM/PM when there are no day periods available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * @experimental i18n support is experimental.
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    var data = findLocaleData(locale);
    checkFullData(data);
    var dayPeriodsData = [
        data[19 /* ExtraData */][0 /* ExtraDayPeriodFormats */],
        data[19 /* ExtraData */][1 /* ExtraDayPeriodStandalone */]
    ];
    var dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Returns the first value that is defined in an array, going backwards.
 *
 * To avoid repeating the same data (e.g. when "format" and "standalone" are the same) we only
 * add the first one to the locale data arrays, the other ones are only defined when different.
 * We use this function to retrieve the first defined value.
 *
 * @experimental i18n support is experimental.
 */
function getLastDefinedValue(data, index) {
    for (var i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extract the hours and minutes from a string like "15:45"
 */
function extractTime(time) {
    var _a = tslib_1.__read(time.split(':'), 2), h = _a[0], m = _a[1];
    return { hours: +h, minutes: +m };
}
/**
 * Finds the locale data for a locale id
 *
 * @experimental i18n support is experimental.
 */
export function findLocaleData(locale) {
    var normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
    var match = LOCALE_DATA[normalizedLocale];
    if (match) {
        return match;
    }
    // let's try to find a parent locale
    var parentLocale = normalizedLocale.split('-')[0];
    match = LOCALE_DATA[parentLocale];
    if (match) {
        return match;
    }
    if (parentLocale === 'en') {
        return localeEn;
    }
    throw new Error("Missing locale data for the locale \"" + locale + "\".");
}
/**
 * Returns the currency symbol for a given currency code, or the code if no symbol available
 * (e.g.: format narrow = $, format wide = US$, code = USD)
 * If no locale is provided, it uses the locale "en" by default
 *
 * @experimental i18n support is experimental.
 */
export function getCurrencySymbol(code, format, locale) {
    if (locale === void 0) { locale = 'en'; }
    var currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    var symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
var DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Returns the number of decimal digits for the given currency.
 * Its value depends upon the presence of cents in that particular currency.
 *
 * @experimental i18n support is experimental.
 */
export function getNumberOfCurrencyDigits(code) {
    var digits;
    var currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxXQUFXLEVBQXVELE1BQU0sZUFBZSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxhQUFhLEVBQW9CLE1BQU0sY0FBYyxDQUFDO0FBRTlEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFOLElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQiwrREFBTyxDQUFBO0lBQ1AsK0RBQU8sQ0FBQTtJQUNQLGlFQUFRLENBQUE7SUFDUixxRUFBVSxDQUFBO0FBQ1osQ0FBQyxFQUxXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFLNUI7QUFFRCxvQkFBb0I7QUFDcEIsTUFBTSxDQUFOLElBQVksTUFPWDtBQVBELFdBQVksTUFBTTtJQUNoQixtQ0FBUSxDQUFBO0lBQ1IsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxpQ0FBTyxDQUFBO0lBQ1AsbUNBQVEsQ0FBQTtJQUNSLHFDQUFTLENBQUE7QUFDWCxDQUFDLEVBUFcsTUFBTSxLQUFOLE1BQU0sUUFPakI7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBTixJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDbkIsNkNBQU0sQ0FBQTtJQUNOLHFEQUFVLENBQUE7QUFDWixDQUFDLEVBSFcsU0FBUyxLQUFULFNBQVMsUUFHcEI7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sQ0FBTixJQUFZLGdCQUtYO0FBTEQsV0FBWSxnQkFBZ0I7SUFDMUIsMkRBQU0sQ0FBQTtJQUNOLHFFQUFXLENBQUE7SUFDWCx1REFBSSxDQUFBO0lBQ0oseURBQUssQ0FB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LE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLGdCQUFzQixJQUFJLElBQUksQ0FBQztBQUNoRCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELElBQU0sNkJBQTZCLEdBQUcsQ0FBQyxDQUFDO0FBRXhDOzs7OztHQUtHO0FBQ0gsTUFBTSxvQ0FBb0MsSUFBWTtJQUNwRCxJQUFJLE1BQU0sQ0FBQztJQUNYLElBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2IsTUFBTSxHQUFHLFFBQVEsb0JBQTBCLENBQUM7SUFDOUMsQ0FBQztJQUNELE1BQU0sQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUM7QUFDN0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGxvY2FsZUVuIGZyb20gJy4vbG9jYWxlX2VuJztcbmltcG9ydCB7TE9DQUxFX0RBVEEsIExvY2FsZURhdGFJbmRleCwgRXh0cmFMb2NhbGVEYXRhSW5kZXgsIEN1cnJlbmN5SW5kZXh9IGZyb20gJy4vbG9jYWxlX2RhdGEnO1xuaW1wb3J0IHtDVVJSRU5DSUVTX0VOLCBDdXJyZW5jaWVzU3ltYm9sc30gZnJvbSAnLi9jdXJyZW5jaWVzJztcblxuLyoqXG4gKiBUaGUgZGlmZmVyZW50IGZvcm1hdCBzdHlsZXMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXByZXNlbnQgbnVtYmVycy5cbiAqIFVzZWQgYnkgdGhlIGZ1bmN0aW9uIHtAbGluayBnZXRMb2NhbGVOdW1iZXJGb3JtYXR9LlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGVudW0gTnVtYmVyRm9ybWF0U3R5bGUge1xuICBEZWNpbWFsLFxuICBQZXJjZW50LFxuICBDdXJyZW5jeSxcbiAgU2NpZW50aWZpY1xufVxuXG4vKiogQGV4cGVyaW1lbnRhbCAqL1xuZXhwb3J0IGVudW0gUGx1cmFsIHtcbiAgWmVybyA9IDAsXG4gIE9uZSA9IDEsXG4gIFR3byA9IDIsXG4gIEZldyA9IDMsXG4gIE1hbnkgPSA0LFxuICBPdGhlciA9IDUsXG59XG5cbi8qKlxuICogU29tZSBsYW5ndWFnZXMgdXNlIHR3byBkaWZmZXJlbnQgZm9ybXMgb2Ygc3RyaW5ncyAoc3RhbmRhbG9uZSBhbmQgZm9ybWF0KSBkZXBlbmRpbmcgb24gdGhlXG4gKiBjb250ZXh0LlxuICogVHlwaWNhbGx5IHRoZSBzdGFuZGFsb25lIHZlcnNpb24gaXMgdGhlIG5vbWluYXRpdmUgZm9ybSBvZiB0aGUgd29yZCwgYW5kIHRoZSBmb3JtYXQgdmVyc2lvbiBpcyBpblxuICogdGhlIGdlbml0aXZlLlxuICogU2VlIFt0aGUgQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWUpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGVudW0gRm9ybVN0eWxlIHtcbiAgRm9ybWF0LFxuICBTdGFuZGFsb25lXG59XG5cbi8qKlxuICogTXVsdGlwbGUgd2lkdGhzIGFyZSBhdmFpbGFibGUgZm9yIHRyYW5zbGF0aW9uczogbmFycm93ICgxIGNoYXJhY3RlciksIGFiYnJldmlhdGVkICgzIGNoYXJhY3RlcnMpLFxuICogd2lkZSAoZnVsbCBsZW5ndGgpLCBhbmQgc2hvcnQgKDIgY2hhcmFjdGVycywgb25seSBmb3IgZGF5cykuXG4gKlxuICogRm9yIGV4YW1wbGUgdGhlIGRheSBgU3VuZGF5YCB3aWxsIGJlOlxuICogLSBOYXJyb3c6IGBTYFxuICogLSBTaG9ydDogYFN1YFxuICogLSBBYmJyZXZpYXRlZDogYFN1bmBcbiAqIC0gV2lkZTogYFN1bmRheWBcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBlbnVtIFRyYW5zbGF0aW9uV2lkdGgge1xuICBOYXJyb3csXG4gIEFiYnJldmlhdGVkLFxuICBXaWRlLFxuICBTaG9ydFxufVxuXG4vKipcbiAqIE11bHRpcGxlIHdpZHRocyBhcmUgYXZhaWxhYmxlIGZvciBmb3JtYXRzOiBzaG9ydCAobWluaW1hbCBhbW91bnQgb2YgZGF0YSksIG1lZGl1bSAoc21hbGwgYW1vdW50XG4gKiBvZiBkYXRhKSwgbG9uZyAoY29tcGxldGUgYW1vdW50IG9mIGRhdGEpLCBmdWxsIChjb21wbGV0ZSBhbW91bnQgb2YgZGF0YSBhbmQgZXh0cmEgaW5mb3JtYXRpb24pLlxuICpcbiAqIEZvciBleGFtcGxlIHRoZSBkYXRlLXRpbWUgZm9ybWF0cyBmb3IgdGhlIGVuZ2xpc2ggbG9jYWxlIHdpbGwgYmU6XG4gKiAgLSBgJ3Nob3J0J2A6IGAnTS9kL3l5LCBoOm1tIGEnYCAoZS5nLiBgNi8xNS8xNSwgOTowMyBBTWApXG4gKiAgLSBgJ21lZGl1bSdgOiBgJ01NTSBkLCB5LCBoOm1tOnNzIGEnYCAoZS5nLiBgSnVuIDE1LCAyMDE1LCA5OjAzOjAxIEFNYClcbiAqICAtIGAnbG9uZydgOiBgJ01NTU0gZCwgeSwgaDptbTpzcyBhIHonYCAoZS5nLiBgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCsxYClcbiAqICAtIGAnZnVsbCdgOiBgJ0VFRUUsIE1NTU0gZCwgeSwgaDptbTpzcyBhIHp6enonYCAoZS5nLiBgTW9uZGF5LCBKdW5lIDE1LCAyMDE1IGF0XG4gKiA5OjAzOjAxIEFNIEdNVCswMTowMGApXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZW51bSBGb3JtYXRXaWR0aCB7XG4gIFNob3J0LFxuICBNZWRpdW0sXG4gIExvbmcsXG4gIEZ1bGxcbn1cblxuLyoqXG4gKiBOdW1iZXIgc3ltYm9sIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gbnVtYmVyIHBhdHRlcm5zLlxuICogVGhlIHBsYWNlaG9sZGVycyBhcmUgYmFzZWQgb24gZW5nbGlzaCB2YWx1ZXM6XG4gKlxuICogfCBOYW1lICAgICAgICAgICAgICAgICAgIHwgRXhhbXBsZSBmb3IgZW4tVVMgfCBNZWFuaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IGRlY2ltYWwgICAgICAgICAgICAgICAgfCAyLDM0NWAuYDY3ICAgICAgICB8IGRlY2ltYWwgc2VwYXJhdG9yICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBncm91cCAgICAgICAgICAgICAgICAgIHwgMmAsYDM0NS42NyAgICAgICAgfCBncm91cGluZyBzZXBhcmF0b3IsIHR5cGljYWxseSBmb3IgdGhvdXNhbmRzIHxcbiAqIHwgcGx1c1NpZ24gICAgICAgICAgICAgICB8IGArYDIzICAgICAgICAgICAgIHwgdGhlIHBsdXMgc2lnbiB1c2VkIHdpdGggbnVtYmVycyAgICAgICAgICAgICB8XG4gKiB8IG1pbnVzU2lnbiAgICAgICAgICAgICAgfCBgLWAyMyAgICAgICAgICAgICB8IHRoZSBtaW51cyBzaWduIHVzZWQgd2l0aCBudW1iZXJzICAgICAgICAgICAgfFxuICogfCBwZXJjZW50U2lnbiAgICAgICAgICAgIHwgMjMuNGAlYCAgICAgICAgICAgfCB0aGUgcGVyY2VudCBzaWduIChvdXQgb2YgMTAwKSAgICAgICAgICAgICAgIHxcbiAqIHwgcGVyTWlsbGUgICAgICAgICAgICAgICB8IDIzNGDigLBgICAgICAgICAgICAgfCB0aGUgcGVybWlsbGUgc2lnbiAob3V0IG9mIDEwMDApICAgICAgICAgICAgIHxcbiAqIHwgZXhwb25lbnRpYWwgICAgICAgICAgICB8IDEuMmBFYDMgICAgICAgICAgIHwgdXNlZCBpbiBjb21wdXRlcnMgZm9yIDEuMsOXMTDCsy4gICAgICAgICAgICAgIHxcbiAqIHwgc3VwZXJzY3JpcHRpbmdFeHBvbmVudCB8IDEuMmDDl2AxMDMgICAgICAgICB8IGh1bWFuLXJlYWRhYmxlIGZvcm1hdCBvZiBleHBvbmVudGlhbCAgICAgICAgfFxuICogfCBpbmZpbml0eSAgICAgICAgICAgICAgIHwgYOKInmAgICAgICAgICAgICAgICB8IHVzZWQgaW4gK+KIniBhbmQgLeKIni4gICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgbmFuICAgICAgICAgICAgICAgICAgICB8IGBOYU5gICAgICAgICAgICAgIHwgXCJub3QgYSBudW1iZXJcIi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgdGltZVNlcGFyYXRvciAgICAgICAgICB8IDEwYDpgNTIgICAgICAgICAgIHwgc3ltYm9sIHVzZWQgYmV0d2VlbiB0aW1lIHVuaXRzICAgICAgICAgICAgICB8XG4gKiB8IGN1cnJlbmN5RGVjaW1hbCAgICAgICAgfCAkMiwzNDVgLmA2NyAgICAgICB8IGRlY2ltYWwgc2VwYXJhdG9yLCBmYWxsYmFjayB0byBcImRlY2ltYWxcIiAgICB8XG4gKiB8IGN1cnJlbmN5R3JvdXAgICAgICAgICAgfCAkMmAsYDM0NS42NyAgICAgICB8IGdyb3VwaW5nIHNlcGFyYXRvciwgZmFsbGJhY2sgdG8gXCJncm91cFwiICAgICB8XG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZW51bSBOdW1iZXJTeW1ib2wge1xuICBEZWNpbWFsLFxuICBHcm91cCxcbiAgTGlzdCxcbiAgUGVyY2VudFNpZ24sXG4gIFBsdXNTaWduLFxuICBNaW51c1NpZ24sXG4gIEV4cG9uZW50aWFsLFxuICBTdXBlcnNjcmlwdGluZ0V4cG9uZW50LFxuICBQZXJNaWxsZSxcbiAgSW5maW5pdHksXG4gIE5hTixcbiAgVGltZVNlcGFyYXRvcixcbiAgQ3VycmVuY3lEZWNpbWFsLFxuICBDdXJyZW5jeUdyb3VwXG59XG5cbi8qKlxuICogVGhlIHZhbHVlIGZvciBlYWNoIGRheSBvZiB0aGUgd2VlaywgYmFzZWQgb24gdGhlIGVuLVVTIGxvY2FsZVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGVudW0gV2Vla0RheSB7XG4gIFN1bmRheSA9IDAsXG4gIE1vbmRheSxcbiAgVHVlc2RheSxcbiAgV2VkbmVzZGF5LFxuICBUaHVyc2RheSxcbiAgRnJpZGF5LFxuICBTYXR1cmRheVxufVxuXG4vKipcbiAqIFRoZSBsb2NhbGUgaWQgZm9yIHRoZSBjaG9zZW4gbG9jYWxlIChlLmcgYGVuLUdCYCkuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlSWQobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZmluZExvY2FsZURhdGEobG9jYWxlKVtMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdO1xufVxuXG4vKipcbiAqIFBlcmlvZHMgb2YgdGhlIGRheSAoZS5nLiBgW0FNLCBQTV1gIGZvciBlbi1VUykuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBhbVBtRGF0YSA9IDxbXG4gICAgc3RyaW5nLCBzdHJpbmdcbiAgXVtdW10+W2RhdGFbTG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNGb3JtYXRdLCBkYXRhW0xvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBhbVBtID0gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoYW1QbSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIERheXMgb2YgdGhlIHdlZWsgZm9yIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIgKGUuZy4gYFtTdW5kYXksIE1vbmRheSwgLi4uIFNhdHVyZGF5XWAgZm9yIGVuLVVTKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlOYW1lcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgZGF5c0RhdGEgPVxuICAgICAgPHN0cmluZ1tdW11bXT5bZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF5c0Zvcm1hdF0sIGRhdGFbTG9jYWxlRGF0YUluZGV4LkRheXNTdGFuZGFsb25lXV07XG4gIGNvbnN0IGRheXMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogTW9udGhzIG9mIHRoZSB5ZWFyIGZvciB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyIChlLmcuIGBbSmFudWFyeSwgRmVicnVhcnksIC4uLl1gIGZvciBlbi1VUykuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTW9udGhOYW1lcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgbW9udGhzRGF0YSA9XG4gICAgICA8c3RyaW5nW11bXVtdPltkYXRhW0xvY2FsZURhdGFJbmRleC5Nb250aHNGb3JtYXRdLCBkYXRhW0xvY2FsZURhdGFJbmRleC5Nb250aHNTdGFuZGFsb25lXV07XG4gIGNvbnN0IG1vbnRocyA9IGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogRXJhcyBmb3IgdGhlIEdyZWdvcmlhbiBjYWxlbmRhciAoZS5nLiBBRC9CQykuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXJhTmFtZXMobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBlcmFzRGF0YSA9IDxbc3RyaW5nLCBzdHJpbmddW10+ZGF0YVtMb2NhbGVEYXRhSW5kZXguRXJhc107XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGVyYXNEYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogRmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGZvciB0aGlzIGxvY2FsZSwgYmFzZWQgb24gZW5nbGlzaCBkYXlzIChTdW5kYXkgPSAwLCBNb25kYXkgPSAxLCAuLi4pLlxuICogRm9yIGV4YW1wbGUgaW4gZnJlbmNoIHRoZSB2YWx1ZSB3b3VsZCBiZSAxIGJlY2F1c2UgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2VlayBpcyBNb25kYXkuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRmlyc3REYXlPZldlZWsobG9jYWxlOiBzdHJpbmcpOiBXZWVrRGF5IHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5GaXJzdERheU9mV2Vla107XG59XG5cbi8qKlxuICogUmFuZ2Ugb2YgZGF5cyBpbiB0aGUgd2VlayB0aGF0IHJlcHJlc2VudCB0aGUgd2Vlay1lbmQgZm9yIHRoaXMgbG9jYWxlLCBiYXNlZCBvbiBlbmdsaXNoIGRheXNcbiAqIChTdW5kYXkgPSAwLCBNb25kYXkgPSAxLCAuLi4pLlxuICogRm9yIGV4YW1wbGUgaW4gZW5nbGlzaCB0aGUgdmFsdWUgd291bGQgYmUgWzYsMF0gZm9yIFNhdHVyZGF5IHRvIFN1bmRheS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UobG9jYWxlOiBzdHJpbmcpOiBbV2Vla0RheSwgV2Vla0RheV0ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LldlZWtlbmRSYW5nZV07XG59XG5cbi8qKlxuICogRGF0ZSBmb3JtYXQgdGhhdCBkZXBlbmRzIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogVGhlcmUgYXJlIGZvdXIgYmFzaWMgZGF0ZSBmb3JtYXRzOlxuICogLSBgZnVsbGAgc2hvdWxkIGNvbnRhaW4gbG9uZy13ZWVrZGF5IChFRUVFKSwgeWVhciAoeSksIGxvbmctbW9udGggKE1NTU0pLCBkYXkgKGQpLlxuICpcbiAqICBGb3IgZXhhbXBsZSwgRW5nbGlzaCB1c2VzIGBFRUVFLCBNTU1NIGQsIHlgLCBjb3JyZXNwb25kaW5nIHRvIGEgZGF0ZSBsaWtlXG4gKiAgXCJUdWVzZGF5LCBTZXB0ZW1iZXIgMTQsIDE5OTlcIi5cbiAqXG4gKiAtIGBsb25nYCBzaG91bGQgY29udGFpbiB5ZWFyLCBsb25nLW1vbnRoLCBkYXkuXG4gKlxuICogIEZvciBleGFtcGxlLCBgTU1NTSBkLCB5YCwgY29ycmVzcG9uZGluZyB0byBhIGRhdGUgbGlrZSBcIlNlcHRlbWJlciAxNCwgMTk5OVwiLlxuICpcbiAqIC0gYG1lZGl1bWAgc2hvdWxkIGNvbnRhaW4geWVhciwgYWJicmV2aWF0ZWQtbW9udGggKE1NTSksIGRheS5cbiAqXG4gKiAgRm9yIGV4YW1wbGUsIGBNTU0gZCwgeWAsIGNvcnJlc3BvbmRpbmcgdG8gYSBkYXRlIGxpa2UgXCJTZXAgMTQsIDE5OTlcIi5cbiAqICBGb3IgbGFuZ3VhZ2VzIHRoYXQgZG8gbm90IHVzZSBhYmJyZXZpYXRlZCBtb250aHMsIHVzZSB0aGUgbnVtZXJpYyBtb250aCAoTU0vTSkuIEZvciBleGFtcGxlLFxuICogIGB5L01NL2RkYCwgY29ycmVzcG9uZGluZyB0byBhIGRhdGUgbGlrZSBcIjE5OTkvMDkvMTRcIi5cbiAqXG4gKiAtIGBzaG9ydGAgc2hvdWxkIGNvbnRhaW4geWVhciwgbnVtZXJpYy1tb250aCAoTU0vTSksIGFuZCBkYXkuXG4gKlxuICogIEZvciBleGFtcGxlLCBgTS9kL3l5YCwgY29ycmVzcG9uZGluZyB0byBhIGRhdGUgbGlrZSBcIjkvMTQvOTlcIi5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF0ZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBUaW1lIGZvcm1hdCB0aGF0IGRlcGVuZHMgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBUaGUgc3RhbmRhcmQgZm9ybWF0cyBpbmNsdWRlIGZvdXIgYmFzaWMgdGltZSBmb3JtYXRzOlxuICogLSBgZnVsbGAgc2hvdWxkIGNvbnRhaW4gaG91ciAoaC9IKSwgbWludXRlIChtbSksIHNlY29uZCAoc3MpLCBhbmQgem9uZSAoenp6eikuXG4gKiAtIGBsb25nYCBzaG91bGQgY29udGFpbiBob3VyLCBtaW51dGUsIHNlY29uZCwgYW5kIHpvbmUgKHopXG4gKiAtIGBtZWRpdW1gIHNob3VsZCBjb250YWluIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLlxuICogLSBgc2hvcnRgIHNob3VsZCBjb250YWluIGhvdXIsIG1pbnV0ZS5cbiAqXG4gKiBOb3RlOiBUaGUgcGF0dGVybnMgZGVwZW5kIG9uIHdoZXRoZXIgdGhlIG1haW4gY291bnRyeSB1c2luZyB5b3VyIGxhbmd1YWdlIHVzZXMgMTItaG91ciB0aW1lIG9yXG4gKiBub3Q6XG4gKiAtIEZvciAxMi1ob3VyIHRpbWUsIHVzZSBhIHBhdHRlcm4gbGlrZSBgaGg6bW0gYWAgdXNpbmcgaCB0byBtZWFuIGEgMTItaG91ciBjbG9jayBjeWNsZSBydW5uaW5nXG4gKiAxIHRocm91Z2ggMTIgKG1pZG5pZ2h0IHBsdXMgMSBtaW51dGUgaXMgMTI6MDEpLCBvciB1c2luZyBLIHRvIG1lYW4gYSAxMi1ob3VyIGNsb2NrIGN5Y2xlXG4gKiBydW5uaW5nIDAgdGhyb3VnaCAxMSAobWlkbmlnaHQgcGx1cyAxIG1pbnV0ZSBpcyAwOjAxKS5cbiAqIC0gRm9yIDI0LWhvdXIgdGltZSwgdXNlIGEgcGF0dGVybiBsaWtlIGBISDptbWAgdXNpbmcgSCB0byBtZWFuIGEgMjQtaG91ciBjbG9jayBjeWNsZSBydW5uaW5nIDBcbiAqIHRocm91Z2ggMjMgKG1pZG5pZ2h0IHBsdXMgMSBtaW51dGUgaXMgMDowMSksIG9yIHVzaW5nIGsgdG8gbWVhbiBhIDI0LWhvdXIgY2xvY2sgY3ljbGUgcnVubmluZ1xuICogMSB0aHJvdWdoIDI0IChtaWRuaWdodCBwbHVzIDEgbWludXRlIGlzIDI0OjAxKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0YVtMb2NhbGVEYXRhSW5kZXguVGltZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBEYXRlLXRpbWUgZm9ybWF0IHRoYXQgZGVwZW5kcyBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIFRoZSBkYXRlLXRpbWUgcGF0dGVybiBzaG93cyBob3cgdG8gY29tYmluZSBzZXBhcmF0ZSBwYXR0ZXJucyBmb3IgZGF0ZSAocmVwcmVzZW50ZWQgYnkgezF9KVxuICogYW5kIHRpbWUgKHJlcHJlc2VudGVkIGJ5IHswfSkgaW50byBhIHNpbmdsZSBwYXR0ZXJuLiBJdCB1c3VhbGx5IGRvZXNuJ3QgbmVlZCB0byBiZSBjaGFuZ2VkLlxuICogV2hhdCB5b3Ugd2FudCB0byBwYXkgYXR0ZW50aW9uIHRvIGFyZTpcbiAqIC0gcG9zc2libHkgcmVtb3ZpbmcgYSBzcGFjZSBmb3IgbGFuZ3VhZ2VzIHRoYXQgZG9uJ3QgdXNlIGl0LCBzdWNoIGFzIG1hbnkgRWFzdCBBc2lhbiBsYW5ndWFnZXNcbiAqIC0gcG9zc2libHkgYWRkaW5nIGEgY29tbWEsIG90aGVyIHB1bmN0dWF0aW9uLCBvciBhIGNvbWJpbmluZyB3b3JkXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKiAtIEVuZ2xpc2ggdXNlcyBgezF9ICdhdCcgezB9YCBvciBgezF9LCB7MH1gIChkZXBlbmRpbmcgb24gZGF0ZSBzdHlsZSksIHdoaWxlIEphcGFuZXNlIHVzZXNcbiAqICBgezF9ezB9YC5cbiAqIC0gQW4gRW5nbGlzaCBmb3JtYXR0ZWQgZGF0ZS10aW1lIHVzaW5nIHRoZSBjb21iaW5pbmcgcGF0dGVybiBgezF9LCB7MH1gIGNvdWxkIGJlXG4gKiAgYERlYyAxMCwgMjAxMCwgMzo1OTo0OSBQTWAuIE5vdGljZSB0aGUgY29tbWEgYW5kIHNwYWNlIGJldHdlZW4gdGhlIGRhdGUgcG9ydGlvbiBhbmQgdGhlIHRpbWVcbiAqICBwb3J0aW9uLlxuICpcbiAqIFRoZXJlIGFyZSBmb3VyIGZvcm1hdHMgKGBmdWxsYCwgYGxvbmdgLCBgbWVkaXVtYCwgYHNob3J0YCk7IHRoZSBkZXRlcm1pbmF0aW9uIG9mIHdoaWNoIHRvIHVzZVxuICogaXMgbm9ybWFsbHkgYmFzZWQgb24gdGhlIGRhdGUgc3R5bGUuIEZvciBleGFtcGxlLCBpZiB0aGUgZGF0ZSBoYXMgYSBmdWxsIG1vbnRoIGFuZCB3ZWVrZGF5XG4gKiBuYW1lLCB0aGUgZnVsbCBjb21iaW5pbmcgcGF0dGVybiB3aWxsIGJlIHVzZWQgdG8gY29tYmluZSB0aGF0IHdpdGggYSB0aW1lLiBJZiB0aGUgZGF0ZSBoYXNcbiAqIG51bWVyaWMgbW9udGgsIHRoZSBzaG9ydCB2ZXJzaW9uIG9mIHRoZSBjb21iaW5pbmcgcGF0dGVybiB3aWxsIGJlIHVzZWQgdG8gY29tYmluZSB0aGF0IHdpdGggYVxuICogdGltZS4gRW5nbGlzaCB1c2VzIGB7MX0gJ2F0JyB7MH1gIGZvciBmdWxsIGFuZCBsb25nIHN0eWxlcywgYW5kIGB7MX0sIHswfWAgZm9yIG1lZGl1bSBhbmQgc2hvcnRcbiAqIHN0eWxlcy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRhdGVUaW1lRm9ybWF0RGF0YSA9IDxzdHJpbmdbXT5kYXRhW0xvY2FsZURhdGFJbmRleC5EYXRlVGltZUZvcm1hdF07XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGVUaW1lRm9ybWF0RGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIE51bWJlciBzeW1ib2wgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgZm9ybWF0cy5cbiAqIFNlZSB7QGxpbmsgTnVtYmVyU3ltYm9sfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlOiBzdHJpbmcsIHN5bWJvbDogTnVtYmVyU3ltYm9sKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IHJlcyA9IGRhdGFbTG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW3N5bWJvbF07XG4gIGlmICh0eXBlb2YgcmVzID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeURlY2ltYWwpIHtcbiAgICAgIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuRGVjaW1hbF07XG4gICAgfSBlbHNlIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwKSB7XG4gICAgICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bTnVtYmVyU3ltYm9sLkdyb3VwXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBOdW1iZXIgZm9ybWF0IHRoYXQgZGVwZW5kcyBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIE51bWJlcnMgYXJlIGZvcm1hdHRlZCB1c2luZyBwYXR0ZXJucywgbGlrZSBgIywjIyMuMDBgLiBGb3IgZXhhbXBsZSwgdGhlIHBhdHRlcm4gYCMsIyMjLjAwYFxuICogd2hlbiB1c2VkIHRvIGZvcm1hdCB0aGUgbnVtYmVyIDEyMzQ1LjY3OCBjb3VsZCByZXN1bHQgaW4gXCIxMiczNDUsNjdcIi4gVGhhdCB3b3VsZCBoYXBwZW4gaWYgdGhlXG4gKiBncm91cGluZyBzZXBhcmF0b3IgZm9yIHlvdXIgbGFuZ3VhZ2UgaXMgYW4gYXBvc3Ryb3BoZSwgYW5kIHRoZSBkZWNpbWFsIHNlcGFyYXRvciBpcyBhIGNvbW1hLlxuICpcbiAqIDxiPkltcG9ydGFudDo8L2I+IFRoZSBjaGFyYWN0ZXJzIGAuYCBgLGAgYDBgIGAjYCAoYW5kIG90aGVycyBiZWxvdykgYXJlIHNwZWNpYWwgcGxhY2Vob2xkZXJzO1xuICogdGhleSBzdGFuZCBmb3IgdGhlIGRlY2ltYWwgc2VwYXJhdG9yLCBhbmQgc28gb24sIGFuZCBhcmUgTk9UIHJlYWwgY2hhcmFjdGVycy5cbiAqIFlvdSBtdXN0IE5PVCBcInRyYW5zbGF0ZVwiIHRoZSBwbGFjZWhvbGRlcnM7IGZvciBleGFtcGxlLCBkb24ndCBjaGFuZ2UgYC5gIHRvIGAsYCBldmVuIHRob3VnaCBpblxuICogeW91ciBsYW5ndWFnZSB0aGUgZGVjaW1hbCBwb2ludCBpcyB3cml0dGVuIHdpdGggYSBjb21tYS4gVGhlIHN5bWJvbHMgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHRoZVxuICogbG9jYWwgZXF1aXZhbGVudHMsIHVzaW5nIHRoZSBOdW1iZXIgU3ltYm9scyBmb3IgeW91ciBsYW5ndWFnZS5cbiAqXG4gKiBIZXJlIGFyZSB0aGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgaW4gbnVtYmVyIHBhdHRlcm5zOlxuICpcbiAqIHwgU3ltYm9sIHwgTWVhbmluZyB8XG4gKiB8LS0tLS0tLS18LS0tLS0tLS0tfFxuICogfCAuIHwgUmVwbGFjZWQgYXV0b21hdGljYWxseSBieSB0aGUgY2hhcmFjdGVyIHVzZWQgZm9yIHRoZSBkZWNpbWFsIHBvaW50LiB8XG4gKiB8ICwgfCBSZXBsYWNlZCBieSB0aGUgXCJncm91cGluZ1wiICh0aG91c2FuZHMpIHNlcGFyYXRvci4gfFxuICogfCAwIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3IgemVybyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoIGRpZ2l0cykuIHxcbiAqIHwgIyB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIG5vdGhpbmcgaWYgdGhlcmUgYXJlbid0IGVub3VnaCkuIHxcbiAqIHwgwqQgfCBUaGlzIHdpbGwgYmUgcmVwbGFjZWQgYnkgYSBjdXJyZW5jeSBzeW1ib2wsIHN1Y2ggYXMgJCBvciBVU0QuIHxcbiAqIHwgJSB8IFRoaXMgbWFya3MgYSBwZXJjZW50IGZvcm1hdC4gVGhlICUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8IEUgfCBUaGlzIG1hcmtzIGEgc2NpZW50aWZpYyBmb3JtYXQuIFRoZSBFIHN5bWJvbCBtYXkgY2hhbmdlIHBvc2l0aW9uLCBidXQgbXVzdCBiZSByZXRhaW5lZC4gfFxuICogfCAnIHwgU3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgYXMgbGl0ZXJhbCBjaGFyYWN0ZXJzIGFyZSBxdW90ZWQgd2l0aCBBU0NJSSBzaW5nbGUgcXVvdGVzLiB8XG4gKlxuICogWW91IGNhbiBmaW5kIG1vcmUgaW5mb3JtYXRpb25cbiAqIFtvbiB0aGUgQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9udW1iZXItcGF0dGVybnMpXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB0eXBlOiBOdW1iZXJGb3JtYXRTdHlsZSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguTnVtYmVyRm9ybWF0c11bdHlwZV07XG59XG5cbi8qKlxuICogVGhlIHN5bWJvbCB1c2VkIHRvIHJlcHJlc2VudCB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnkgdXNpbmcgdGhpcyBsb2NhbGUgKGUuZy4gJCBmb3JcbiAqIHRoZSBsb2NhbGUgZW4tVVMpLlxuICogVGhlIHN5bWJvbCB3aWxsIGJlIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5U3ltYm9sKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5U3ltYm9sXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFRoZSBuYW1lIG9mIHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeSB1c2luZyB0aGlzIGxvY2FsZSAoZS5nLiBVU0QgZm9yIHRoZSBsb2NhbGVcbiAqIGVuLVVTKS5cbiAqIFRoZSBuYW1lIHdpbGwgYmUgYG51bGxgIGlmIHRoZSBtYWluIGNvdW50cnkgY2Fubm90IGJlIGRldGVybWluZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lOYW1lKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW5jeSB2YWx1ZXMgZm9yIHRoZSBsb2NhbGVcbiAqL1xuZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY2llcyhsb2NhbGU6IHN0cmluZyk6IHtbY29kZTogc3RyaW5nXTogQ3VycmVuY2llc1N5bWJvbHN9IHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5DdXJyZW5jaWVzXTtcbn1cblxuLyoqXG4gKiBUaGUgbG9jYWxlIHBsdXJhbCBmdW5jdGlvbiB1c2VkIGJ5IElDVSBleHByZXNzaW9ucyB0byBkZXRlcm1pbmUgdGhlIHBsdXJhbCBjYXNlIHRvIHVzZS5cbiAqIFNlZSB7QGxpbmsgTmdQbHVyYWx9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVBsdXJhbENhc2UobG9jYWxlOiBzdHJpbmcpOiAodmFsdWU6IG51bWJlcikgPT4gUGx1cmFsIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5QbHVyYWxDYXNlXTtcbn1cblxuZnVuY3Rpb24gY2hlY2tGdWxsRGF0YShkYXRhOiBhbnkpIHtcbiAgaWYgKCFkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7ZGF0YVtMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdfVwiLiBVc2UgXCJyZWdpc3RlckxvY2FsZURhdGFcIiB0byBsb2FkIG5ldyBkYXRhLiBTZWUgdGhlIFwiSTE4biBndWlkZVwiIG9uIGFuZ3VsYXIuaW8gdG8ga25vdyBtb3JlLmApO1xuICB9XG59XG5cbi8qKlxuICogUnVsZXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggZGF5IHBlcmlvZCB0byB1c2UgKFNlZSBgZGF5UGVyaW9kc2AgYmVsb3cpLlxuICogVGhlIHJ1bGVzIGNhbiBlaXRoZXIgYmUgYW4gYXJyYXkgb3IgYSBzaW5nbGUgdmFsdWUuIElmIGl0J3MgYW4gYXJyYXksIGNvbnNpZGVyIGl0IGFzIFwiZnJvbVwiXG4gKiBhbmQgXCJ0b1wiLiBJZiBpdCdzIGEgc2luZ2xlIHZhbHVlIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgcGVyaW9kIGlzIG9ubHkgdmFsaWQgYXQgdGhpcyBleGFjdFxuICogdmFsdWUuXG4gKiBUaGVyZSBpcyBhbHdheXMgdGhlIHNhbWUgbnVtYmVyIG9mIHJ1bGVzIGFzIHRoZSBudW1iZXIgb2YgZGF5IHBlcmlvZHMsIHdoaWNoIG1lYW5zIHRoYXQgdGhlXG4gKiBmaXJzdCBydWxlIGlzIGFwcGxpZWQgdG8gdGhlIGZpcnN0IGRheSBwZXJpb2QgYW5kIHNvIG9uLlxuICogWW91IHNob3VsZCBmYWxsYmFjayB0byBBTS9QTSB3aGVuIHRoZXJlIGFyZSBubyBydWxlcyBhdmFpbGFibGUuXG4gKlxuICogTm90ZTogdGhpcyBpcyBvbmx5IGF2YWlsYWJsZSBpZiB5b3UgbG9hZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuI2kxOG4tcGlwZXMpIHRvIGtub3cgaG93IHRvIGltcG9ydCBhZGRpdGlvbmFsIGxvY2FsZVxuICogZGF0YS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZTogc3RyaW5nKTogKFRpbWUgfCBbVGltZSwgVGltZV0pW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgcnVsZXMgPSBkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW0V4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kc1J1bGVzXSB8fCBbXTtcbiAgcmV0dXJuIHJ1bGVzLm1hcCgocnVsZTogc3RyaW5nIHwgW3N0cmluZywgc3RyaW5nXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBleHRyYWN0VGltZShydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtleHRyYWN0VGltZShydWxlWzBdKSwgZXh0cmFjdFRpbWUocnVsZVsxXSldO1xuICB9KTtcbn1cblxuLyoqXG4gKiBEYXkgUGVyaW9kcyBpbmRpY2F0ZSByb3VnaGx5IGhvdyB0aGUgZGF5IGlzIGJyb2tlbiB1cCBpbiBkaWZmZXJlbnQgbGFuZ3VhZ2VzIChlLmcuIG1vcm5pbmcsXG4gKiBub29uLCBhZnRlcm5vb24sIG1pZG5pZ2h0LCAuLi4pLlxuICogWW91IHNob3VsZCB1c2UgdGhlIGZ1bmN0aW9uIHtAbGluayBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzfSB0byBkZXRlcm1pbmUgd2hpY2ggcGVyaW9kIHRvXG4gKiB1c2UuXG4gKiBZb3Ugc2hvdWxkIGZhbGxiYWNrIHRvIEFNL1BNIHdoZW4gdGhlcmUgYXJlIG5vIGRheSBwZXJpb2RzIGF2YWlsYWJsZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIG9ubHkgYXZhaWxhYmxlIGlmIHlvdSBsb2FkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4jaTE4bi1waXBlcykgdG8ga25vdyBob3cgdG8gaW1wb3J0IGFkZGl0aW9uYWwgbG9jYWxlXG4gKiBkYXRhLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgZGF5UGVyaW9kc0RhdGEgPSA8c3RyaW5nW11bXVtdPltcbiAgICBkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW0V4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kRm9ybWF0c10sXG4gICAgZGF0YVtMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVtFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZFN0YW5kYWxvbmVdXG4gIF07XG4gIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHNEYXRhLCBmb3JtU3R5bGUpIHx8IFtdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzLCB3aWR0aCkgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgdmFsdWUgdGhhdCBpcyBkZWZpbmVkIGluIGFuIGFycmF5LCBnb2luZyBiYWNrd2FyZHMuXG4gKlxuICogVG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGRhdGEgKGUuZy4gd2hlbiBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBhcmUgdGhlIHNhbWUpIHdlIG9ubHlcbiAqIGFkZCB0aGUgZmlyc3Qgb25lIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIHRoZSBvdGhlciBvbmVzIGFyZSBvbmx5IGRlZmluZWQgd2hlbiBkaWZmZXJlbnQuXG4gKiBXZSB1c2UgdGhpcyBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgZmlyc3QgZGVmaW5lZCB2YWx1ZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmZ1bmN0aW9uIGdldExhc3REZWZpbmVkVmFsdWU8VD4oZGF0YTogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gIGZvciAobGV0IGkgPSBpbmRleDsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgZGF0YSBBUEk6IGxvY2FsZSBkYXRhIHVuZGVmaW5lZCcpO1xufVxuXG4vKipcbiAqIEEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRpbWUgd2l0aCBob3VycyBhbmQgbWludXRlc1xuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IHR5cGUgVGltZSA9IHtcbiAgaG91cnM6IG51bWJlcixcbiAgbWludXRlczogbnVtYmVyXG59O1xuXG4vKipcbiAqIEV4dHJhY3QgdGhlIGhvdXJzIGFuZCBtaW51dGVzIGZyb20gYSBzdHJpbmcgbGlrZSBcIjE1OjQ1XCJcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFRpbWUodGltZTogc3RyaW5nKTogVGltZSB7XG4gIGNvbnN0IFtoLCBtXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgcmV0dXJuIHtob3VyczogK2gsIG1pbnV0ZXM6ICttfTtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgbG9jYWxlIGRhdGEgZm9yIGEgbG9jYWxlIGlkXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZExvY2FsZURhdGEobG9jYWxlOiBzdHJpbmcpOiBhbnkge1xuICBjb25zdCBub3JtYWxpemVkTG9jYWxlID0gbG9jYWxlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXy9nLCAnLScpO1xuXG4gIGxldCBtYXRjaCA9IExPQ0FMRV9EQVRBW25vcm1hbGl6ZWRMb2NhbGVdO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICAvLyBsZXQncyB0cnkgdG8gZmluZCBhIHBhcmVudCBsb2NhbGVcbiAgY29uc3QgcGFyZW50TG9jYWxlID0gbm9ybWFsaXplZExvY2FsZS5zcGxpdCgnLScpWzBdO1xuICBtYXRjaCA9IExPQ0FMRV9EQVRBW3BhcmVudExvY2FsZV07XG5cbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoO1xuICB9XG5cbiAgaWYgKHBhcmVudExvY2FsZSA9PT0gJ2VuJykge1xuICAgIHJldHVybiBsb2NhbGVFbjtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7bG9jYWxlfVwiLmApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbmN5IHN5bWJvbCBmb3IgYSBnaXZlbiBjdXJyZW5jeSBjb2RlLCBvciB0aGUgY29kZSBpZiBubyBzeW1ib2wgYXZhaWxhYmxlXG4gKiAoZS5nLjogZm9ybWF0IG5hcnJvdyA9ICQsIGZvcm1hdCB3aWRlID0gVVMkLCBjb2RlID0gVVNEKVxuICogSWYgbm8gbG9jYWxlIGlzIHByb3ZpZGVkLCBpdCB1c2VzIHRoZSBsb2NhbGUgXCJlblwiIGJ5IGRlZmF1bHRcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnIHwgJ25hcnJvdycsIGxvY2FsZSA9ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBjdXJyZW5jeSA9IGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlKVtjb2RlXSB8fCBDVVJSRU5DSUVTX0VOW2NvZGVdIHx8IFtdO1xuICBjb25zdCBzeW1ib2xOYXJyb3cgPSBjdXJyZW5jeVtDdXJyZW5jeUluZGV4LlN5bWJvbE5hcnJvd107XG5cbiAgaWYgKGZvcm1hdCA9PT0gJ25hcnJvdycgJiYgdHlwZW9mIHN5bWJvbE5hcnJvdyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3ltYm9sTmFycm93O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5W0N1cnJlbmN5SW5kZXguU3ltYm9sXSB8fCBjb2RlO1xufVxuXG4vLyBNb3N0IGN1cnJlbmNpZXMgaGF2ZSBjZW50cywgdGhhdCdzIHdoeSB0aGUgZGVmYXVsdCBpcyAyXG5jb25zdCBERUZBVUxUX05CX09GX0NVUlJFTkNZX0RJR0lUUyA9IDI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzIGZvciB0aGUgZ2l2ZW4gY3VycmVuY3kuXG4gKiBJdHMgdmFsdWUgZGVwZW5kcyB1cG9uIHRoZSBwcmVzZW5jZSBvZiBjZW50cyBpbiB0aGF0IHBhcnRpY3VsYXIgY3VycmVuY3kuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnVtYmVyT2ZDdXJyZW5jeURpZ2l0cyhjb2RlOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgZGlnaXRzO1xuICBjb25zdCBjdXJyZW5jeSA9IENVUlJFTkNJRVNfRU5bY29kZV07XG4gIGlmIChjdXJyZW5jeSkge1xuICAgIGRpZ2l0cyA9IGN1cnJlbmN5W0N1cnJlbmN5SW5kZXguTmJPZkRpZ2l0c107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFM7XG59XG4iXX0=