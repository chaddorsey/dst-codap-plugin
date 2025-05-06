"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.shortMonthNames = exports.unitsStringToMilliseconds = exports.secondsConverter = exports.DatePrecision = exports.dateUnits = exports.EDateTimeLevel = void 0
exports.determineLevels = determineLevels
exports.mapLevelToPrecision = mapLevelToPrecision
exports.isDate = isDate
exports.checkDate = checkDate
exports.formatDate = formatDate
exports.defaultToEpochSecs = defaultToEpochSecs
exports.createDate = createDate
exports.convertToDate = convertToDate
exports.stringValuesToDateSeconds = stringValuesToDateSeconds
let date_parser_1 = require("./date-parser")
let math_utils_1 = require("./math-utils")
let locale_1 = require("./translation/locale")
let translate_1 = require("./translation/translate")
let EDateTimeLevel;
(function (EDateTimeLevel) {
    EDateTimeLevel[EDateTimeLevel.eSecond = 0] = "eSecond"
    EDateTimeLevel[EDateTimeLevel.eMinute = 1] = "eMinute"
    EDateTimeLevel[EDateTimeLevel.eHour = 2] = "eHour"
    EDateTimeLevel[EDateTimeLevel.eDay = 3] = "eDay"
    EDateTimeLevel[EDateTimeLevel.eMonth = 4] = "eMonth"
    EDateTimeLevel[EDateTimeLevel.eYear = 5] = "eYear"
})(EDateTimeLevel || (exports.EDateTimeLevel = EDateTimeLevel = {}))
// note that these strings should match the order of strings in DG.CaseTable.attributeEditor.datePrecisionOptions
exports.dateUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"]
let DatePrecision;
(function (DatePrecision) {
    DatePrecision.None = ""
    DatePrecision.Millisecond = "millisecond"
    DatePrecision.Second = "second"
    DatePrecision.Minute = "minute"
    DatePrecision.Hour = "hour"
    DatePrecision.Day = "day"
    DatePrecision.Month = "month"
    DatePrecision.Year = "year"
})(DatePrecision || (exports.DatePrecision = DatePrecision = {}))
// Constants for converting between units of time and milliseconds
exports.secondsConverter = {
    kSecond: 1000,
    kMinute: 1000 * 60,
    kHour: ((1000) * 60) * 60,
    kDay: (((1000) * 60) * 60) * 24,
    kMonth: ((((1000) * 60) * 60) * 24) * 30,
    kYear: ((((1000) * 60) * 60) * 24) * 365
}
let unitsStringToMilliseconds = function (unitString) {
    switch (unitString.toLowerCase()) {
        case 'millisecond':
            return 1
        case 'second':
            return exports.secondsConverter.kSecond
        case 'minute':
            return exports.secondsConverter.kMinute
        case 'hour':
            return exports.secondsConverter.kHour
        case 'day':
            return exports.secondsConverter.kDay
        case 'month':
            return exports.secondsConverter.kMonth
        case 'year':
            return exports.secondsConverter.kYear
        default:
            return 0
    }
}
exports.unitsStringToMilliseconds = unitsStringToMilliseconds
exports.shortMonthNames = [
    'DG.Formula.DateShortMonthJanuary',
    'DG.Formula.DateShortMonthFebruary',
    'DG.Formula.DateShortMonthMarch',
    'DG.Formula.DateShortMonthApril',
    'DG.Formula.DateShortMonthMay',
    'DG.Formula.DateShortMonthJune',
    'DG.Formula.DateShortMonthJuly',
    'DG.Formula.DateShortMonthAugust',
    'DG.Formula.DateShortMonthSeptember',
    'DG.Formula.DateShortMonthOctober',
    'DG.Formula.DateShortMonthNovember',
    'DG.Formula.DateShortMonthDecember'
].map(function (m) { return (0, translate_1.translate)(m) })
/**
 * 1. Compute the outermost date-time level that changes from the
 * minimum to the maximum date.
 * 2. The inner level is one smaller than this unless the difference of
 * the min and max outer levels is greater than some arbitrary minimum,
 * in which case the inner is the same as the outer.
 *
 * @param iMinDate { Number } milliseconds
 * @param iMaxDate { Number } milliseconds
 * @return {{outerLevel: EDateTimeLevel, innerLevel: EDateTimeLevel, increment: {Number}}}
 */
function determineLevels(iMinDate, iMaxDate) {
    let tDateDiff = iMaxDate - iMinDate
    let tIncrement = 1 // Will only be something else if inner level is year
    let tOuterLevel
    let tInnerLevel
    if (tDateDiff < 3 * exports.secondsConverter.kMinute) {
        tOuterLevel = EDateTimeLevel.eDay
        tInnerLevel = EDateTimeLevel.eSecond
    }
    else if (tDateDiff < 3 * exports.secondsConverter.kHour) {
        tOuterLevel = EDateTimeLevel.eDay
        tInnerLevel = EDateTimeLevel.eMinute
    }
    else if (tDateDiff < 3 * exports.secondsConverter.kDay) {
        tOuterLevel = EDateTimeLevel.eDay
        tInnerLevel = EDateTimeLevel.eHour
    }
    else if (tDateDiff < 3 * exports.secondsConverter.kMonth) {
        tOuterLevel = EDateTimeLevel.eMonth
        tInnerLevel = EDateTimeLevel.eDay
    }
    else if (tDateDiff < 3 * exports.secondsConverter.kYear) {
        tOuterLevel = EDateTimeLevel.eYear
        tInnerLevel = EDateTimeLevel.eMonth
    }
    else {
        tOuterLevel = EDateTimeLevel.eYear
        tInnerLevel = EDateTimeLevel.eYear
        tIncrement = Math.max(1, (0, math_utils_1.goodTickValue)(0, tDateDiff / (exports.secondsConverter.kYear * 5)))
    }
    return {
        increment: tIncrement,
        outerLevel: tOuterLevel,
        innerLevel: tInnerLevel
    }
}
function mapLevelToPrecision(iLevel) {
    let tPrecision = DatePrecision.None
    switch (iLevel) {
        case EDateTimeLevel.eSecond:
            tPrecision = DatePrecision.Second
            break
        case EDateTimeLevel.eMinute:
            tPrecision = DatePrecision.Minute
            break
        case EDateTimeLevel.eHour:
            tPrecision = DatePrecision.Hour
            break
        case EDateTimeLevel.eDay:
            tPrecision = DatePrecision.Day
            break
        case EDateTimeLevel.eMonth:
            tPrecision = DatePrecision.Month
            break
        case EDateTimeLevel.eYear:
            tPrecision = DatePrecision.Year
            break
    }
    return tPrecision
}
/**
  Returns true if the specified value is a DG date object.
 */
function isDate(iValue) {
    return iValue instanceof Date
}
// returns whether the specified value is interpretable as a date, and if so its date value
function checkDate(value) {
    if (value instanceof Date)
        {return [true, value]}
    let result = (0, date_parser_1.parseDate)(value)
    return result ? [true, result] : [false]
}
/**
 * Default formatting for Date objects.
 * @param date {Date | number | string | null }
 * @param precision {number}
 * @return {string}
 */
function formatDate(x, precision) {
    let _a
    if (precision === void 0) { precision = DatePrecision.None }
    let formatPrecisions = (_a = {},
        _a[DatePrecision.Year] = { year: 'numeric' },
        _a[DatePrecision.Month] = { year: 'numeric', month: 'numeric' },
        _a[DatePrecision.Day] = { year: 'numeric', month: 'numeric', day: 'numeric' },
        _a[DatePrecision.Hour] = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' },
        _a[DatePrecision.Minute] = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' },
        _a[DatePrecision.Second] = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
            second: 'numeric' },
        _a[DatePrecision.Millisecond] = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric',
            minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3 },
        _a)
    if (!(x && (isDate(x) || (0, date_parser_1.isDateString)(x) || (0, math_utils_1.isFiniteNumber)(x)))) {
        return null
    }
    if ((0, math_utils_1.isFiniteNumber)(x) || isDate(x)) {
        // Note that this differs from the original implementation in V2 date_utilities.js because isFiniteNumber behaves
        // differently from DG.MathUtilities.isNumeric in V2. The original isNumeric function in V2 returns true for
        // Date objects, which was probably not planned (as `isNaN(new Date())` actually returns `false`), but is necessary
        // here. Since isFiniteNumber() is more strict, we need an explicit check for Date objects here.
        x = new Date(x.valueOf())
    }
    else if ((0, date_parser_1.isDateString)(x)) {
        x = new Date(x)
    }
    // not convertible to a date
    if (typeof x === "string")
        {return null}
    // default to minutes if the value contains time information, or days if it doesn't
    let precisionFormat = formatPrecisions[precision]
    if (!precisionFormat) {
        precisionFormat = (x.getHours() > 0 || x.getMinutes() > 0)
            ? formatPrecisions.minute
            : formatPrecisions.day
    }
    return locale_1.gLocale.formatDate(x, precisionFormat)
}
/**
 Returns true if the specified value should be treated as epoch
 seconds when provided as the only argument to the date() function,
 false if the value should be treated as a year.
 date(2000) should be treated as a year, but date(12345) should not.
 */
function defaultToEpochSecs(iValue) {
    return Math.abs(iValue) >= 5000
}
function createDate() {
    let args = []
    for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i]
    }
    if (args.length === 0) {
        return new Date()
    }
    let yearOrSeconds = args[0] != null ? Number(args[0]) : null
    if (args.length === 1 && yearOrSeconds != null && defaultToEpochSecs(yearOrSeconds)) {
        // Only one argument and it's a number that should be treated as epoch seconds.
        // Convert from seconds to milliseconds.
        let dateFromEpoch = new Date(yearOrSeconds * 1000)
        return isNaN(dateFromEpoch.valueOf()) ? null : dateFromEpoch
    }
    let year = yearOrSeconds // at this point, yearOrSeconds is always interpreted as a year
    let monthIndex = args[1] != null ? Math.max(0, Number(args[1]) - 1) : 0
    let day = args[2] != null ? Number(args[2]) : 1
    let hours = args[3] != null ? Number(args[3]) : 0
    let minutes = args[4] != null ? Number(args[4]) : 0
    let seconds = args[5] != null ? Number(args[5]) : 0
    let milliseconds = args[6] != null ? Number(args[6]) : 0
    // Logic ported from V2 for backwards compatibility
    if (year == null) {
        year = new Date().getFullYear() // default to current year
    }
    // Apply the same interpretation of the year value  as the date parser
    // (e.g. numbers below 100 are treated as 20xx or 19xx).
    year = (0, date_parser_1.fixYear)(year)
    let date = new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
    return isNaN(date.valueOf()) ? null : date
}
function convertToDate(date) {
    if (isDate(date)) {
        return date
    }
    if (typeof date === "string" && !(0, math_utils_1.isNumber)(date)) {
        return (0, date_parser_1.parseDate)(date, true)
    }
    if ((0, math_utils_1.isNumber)(date)) {
        return createDate(Number(date))
    }
    return null
}
function stringValuesToDateSeconds(values) {
    return values.map(function (value) {
        let date = (0, date_parser_1.parseDate)(value, true)
        return date ? date.getTime() / 1000 : NaN
    }).filter(math_utils_1.isFiniteNumber)
}
