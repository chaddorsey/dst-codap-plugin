"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.fixYear = fixYear
exports.fixHour = fixHour
exports.fixMonth = fixMonth
exports.extractDateProps = extractDateProps
exports.isValidDateSpec = isValidDateSpec
exports.parseDateV2Compatible = parseDateV2Compatible
exports.parseDateV3 = parseDateV3
exports.parseDate = parseDate
exports.isDateString = isDateString
let date_iso_utils_1 = require("./date-iso-utils")
let math_utils_1 = require("./math-utils")
let translate_1 = require("./translation/translate")
let timePart = '(\\d\\d?)(?::(\\d\\d?)(?::(\\d\\d)(?:\\.(\\d+))?)?)?'
let monthsFull = [
    'DG.Formula.DateLongMonthJanuary',
    'DG.Formula.DateLongMonthFebruary',
    'DG.Formula.DateLongMonthMarch',
    'DG.Formula.DateLongMonthApril',
    'DG.Formula.DateLongMonthMay',
    'DG.Formula.DateLongMonthJune',
    'DG.Formula.DateLongMonthJuly',
    'DG.Formula.DateLongMonthAugust',
    'DG.Formula.DateLongMonthSeptember',
    'DG.Formula.DateLongMonthOctober',
    'DG.Formula.DateLongMonthNovember',
    'DG.Formula.DateLongMonthDecember'
].map(function (m) { return (0, translate_1.t)(m).toLowerCase() })
let monthsAbbr = [
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
].map(function (m) { return (0, translate_1.t)(m).toLowerCase() })
let daysOfWeek = [
    "DG.Formula.DateLongDaySunday",
    "DG.Formula.DateLongDayMonday",
    "DG.Formula.DateLongDayTuesday",
    "DG.Formula.DateLongDayWednesday",
    "DG.Formula.DateLongDayThursday",
    "DG.Formula.DateLongDayFriday",
    "DG.Formula.DateLongDaySaturday",
].map(function (dow) { return (0, translate_1.t)(dow).toLowerCase() })
let daysOfWeekAbbr = [
    "DG.Formula.DateShortDaySunday",
    "DG.Formula.DateShortDayMonday",
    "DG.Formula.DateShortDayTuesday",
    "DG.Formula.DateShortDayWednesday",
    "DG.Formula.DateShortDayThursday",
    "DG.Formula.DateShortDayFriday",
    "DG.Formula.DateShortDaySaturday",
].map(function (dow) { return (0, translate_1.t)(dow).toLowerCase() })
let monthsProperAbbrRE = monthsAbbr.map(function (str) { return "".concat(str, "\\.") })
let monthsProperAbbr = monthsAbbr.map(function (str) { return "".concat(str, ".") })
// const ordinals='0th,1st,2nd,3rd,4th,5th,6th,7th,8th,9th'
let monthsArray = monthsAbbr.concat(monthsProperAbbr, monthsFull)
let monthsArrayRE = monthsAbbr.concat(monthsProperAbbrRE, monthsFull)
let daysOfWeekArray = daysOfWeek.concat(daysOfWeekAbbr)
// yyyy-MM-dd hh:mm:ss.SSSZ
let isoDateTimeRE = 
// eslint-disable-next-line @stylistic/max-len
/^(\d{4})-([01]\d)(?:-([0-3]\d)(?:[T ]([0-2]\d)(?::([0-5]\d)(?::([0-5]\d)(?:[.,](\d+))?)?)?(Z|(?:[+-]\d\d:?\d\d?)| ?[a-zA-Z]{1,4}T)?)?)?$/
let isoDateTimeGroupMap = { year: 1, month: 2, day: 3, hour: 4, min: 5, sec: 6, subsec: 7, timezone: 8 }
// MM/dd/yyyy hh:mm:ss.SSS PM
// eslint-disable-next-line @stylistic/max-len
let localDateTimeRE = /^([01]?\d)\/([0-3]?\d)\/(\d{4}|\d{2})(?:,? (\d\d?)(?::(\d\d?)(?::(\d\d)(?:\.(\d+))?)?)?(?: ?(am|pm|AM|PM))?)?$/
let localDateTimeGroupMap = { year: 3, month: 1, day: 2, hour: 4, min: 5, sec: 6, subsec: 7, ampm: 8, timezone: 9 }
// dd MMM, yyyy or MMM, yyyy
// eslint-disable-next-line @stylistic/max-len
let dateVar1 = new RegExp("^(\\d\\d?) (".concat(monthsArrayRE.join('|'), "),? (\\d{4})(?: ").concat(timePart, "(?: (am|pm))?)?$"), 'i')
let dateVar1GroupMap = { year: 3, month: 2, day: 1, hour: 4, min: 5, sec: 6, subsec: 7, ampm: 8 }
// yyyy-mm-dd, yyyy.mm.dd, yyyy/mm/dd
// Require all three parts
let dateVar2 = new RegExp("^(\\d{4})[./-](\\d\\d?)[./-](\\d\\d?)(?: ".concat(timePart, "(?: (am|pm|AM|PM))?)?$"))
let dateVar2GroupMap = { year: 1, month: 2, day: 3, hour: 4, min: 5, sec: 6, subsec: 7, ampm: 8 }
// MMM dd, yyyy or MMM yyyy
// eslint-disable-next-line @stylistic/max-len
let dateVar3 = new RegExp("^(?:(?:".concat(daysOfWeekArray.join('|'), "),? )?(").concat(monthsArrayRE.join('|'), ")(?: (\\d\\d?),)? (\\d{4})(?: ").concat(timePart, "(?: (am|pm))?)?$"), 'i')
let dateVar3GroupMap = { year: 3, month: 1, day: 2, hour: 4, min: 5, sec: 6, subsec: 7, ampm: 8 }
// 'hh:mm:ss AM/PM on dd/MM/yyyy'
let dateVar4 = /(\d\d?):(\d\d)(?::(\d\d))? (AM|PM) on (\d\d?)\/(\d\d?)\/(\d{4})/
let dateVar4GroupMap = { year: 5, month: 6, day: 7, hour: 1, min: 2, sec: 3, ampm: 4 }
// unix dates: Tue Jul  9 18:16:04 PDT 2019
// eslint-disable-next-line @stylistic/max-len
let unixDate = new RegExp("^(?:(?:".concat(daysOfWeekAbbr.join('|'), ") )?(").concat(monthsAbbr.join('|'), ") ([ \\d]\\d) ([ \\d]\\d):(\\d\\d):(\\d\\d) ([A-Z]{3}) (\\d{4})$"), 'i')
let unixDateGroupMap = { year: 7, month: 1, day: 2, hour: 3, min: 4, sec: 5, timezone: 6 }
// new Date().toString(), most browsers
// eslint-disable-next-line @stylistic/max-len
let browserDate = new RegExp("^(?:".concat(daysOfWeekAbbr.join('|'), ") (").concat(monthsAbbr.join('|'), ") (\\d\\d?),? (\\d{4})(?: ").concat(timePart, " (GMT(?:[+-]\\d{4})?(?: \\([\\w ]+\\))?))"), 'i')
let browserDateGroupMap = { year: 3, month: 1, day: 2, hour: 4, min: 5, sec: 6, subsec: 7, timezone: 8 }
// eslint-disable-next-line @stylistic/max-len
let utcDate = new RegExp("^(?:".concat(daysOfWeekAbbr.join('|'), "),? (\\d\\d?) (").concat(monthsAbbr.join('|'), ") (\\d{4}) ").concat(timePart, " GMT$"), 'i')
let utcDateGroupMap = { year: 3, month: 2, day: 1, hour: 4, min: 5, sec: 6, subsec: 7, timezone: 8 }
// yyyy
let dateVarYearOnly = /^\d{4}$/
let dateVarYearOnlyGroupMap = { year: 0 }
// MMMM dd, yyyy hh:mm:ss.SSS PM
let formatSpecs = [
    { strict: true, regex: localDateTimeRE, groupMap: localDateTimeGroupMap },
    { strict: true, regex: isoDateTimeRE, groupMap: isoDateTimeGroupMap },
    { strict: true, regex: unixDate, groupMap: unixDateGroupMap },
    { strict: true, regex: browserDate, groupMap: browserDateGroupMap },
    { strict: true, regex: utcDate, groupMap: utcDateGroupMap },
    { strict: false, regex: dateVar2, groupMap: dateVar2GroupMap },
    { strict: true, regex: dateVar1, groupMap: dateVar1GroupMap },
    { strict: true, regex: dateVar3, groupMap: dateVar3GroupMap },
    { strict: false, regex: dateVarYearOnly, groupMap: dateVarYearOnlyGroupMap },
    { strict: false, regex: dateVar4, groupMap: dateVar4GroupMap }
]
// dividing line between 20xx and 19xx years: [0, 50) -> 20xx, [50, 99] -> 19xx
let CUTOFF_YEAR = 50
function fixYear(y) {
    let yNumber = typeof y === 'string' ? Number(y) : y
    if (yNumber < CUTOFF_YEAR) {
        return 2000 + yNumber
    }
    else if (yNumber < 100) {
        return 1900 + yNumber
    }
    return yNumber
}
function fixHour(hr, amPm) {
    if (isNaN(Number(hr))) {
        return NaN
    }
    let newHr = Number(hr)
    if (amPm != null && (0 < newHr && newHr <= 12)) {
        newHr = newHr % 12
        if (amPm && amPm.toLowerCase() === 'pm') {
            newHr += 12
        }
    }
    return newHr
}
function fixMonth(m) {
    if (!isNaN(Number(m))) {
        return Number(m)
    }
    let lcMonth = m.toLowerCase()
    let monthIx = monthsArray.findIndex(function (monthName) { return monthName === lcMonth })
    return (monthIx % 12) + 1
}
function extractDateProps(match, map) {
    return {
        year: Number(fixYear(match[map.year])),
        month: fixMonth(match[map.month] || '1'),
        day: Number(match[map.day] || '1'),
        hour: fixHour(match[map.hour] || '0', match[map.ampm]),
        min: Number(match[map.min] || '0'),
        sec: Number(match[map.sec] || '0'),
        subsec: Number(match[map.subsec] || '0'),
    }
}
function isValidDateSpec(dateSpec) {
    // Note: we're allowing out-of-range values with the overflow/underflow
    // semantics defined by the Date constructor:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date.
    // This mirrors the v2 behavior (which was the result of an apparent coding bug) but has the
    // advantage of giving reasonable interpretations to constructions that would otherwise fail.
    let isValid = (0, math_utils_1.isFiniteNumber)(dateSpec.year) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.month) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.day) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.hour) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.min) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.sec) &&
        (0, math_utils_1.isFiniteNumber)(dateSpec.subsec)
    return isValid ? dateSpec : false
}
function parseDateV2Compatible(iValue, iLoose) {
    if (iValue == null) {
        return null
    }
    if (iValue instanceof Date) {
        return iValue
    }
    iValue = String(iValue)
    if ((0, date_iso_utils_1.isStdISODateString)(iValue)) {
        return (0, date_iso_utils_1.parseStdISODateString)(iValue)
    }
    let match
    let dateSpec
    let groupMap = null
    let date
    let spec = formatSpecs.some(function (_spec) {
        let m
        let parsed = false
        if (_spec.strict || iLoose) {
            m = iValue.match(_spec.regex)
            if (m) {
                match = m
                groupMap = _spec.groupMap
                parsed = true
            }
        }
        return parsed
    })
    if (spec && match && groupMap) {
        dateSpec = isValidDateSpec(extractDateProps(match, groupMap))
        if (dateSpec) {
            date = new Date(dateSpec.year, (-1 + dateSpec.month), dateSpec.day, dateSpec.hour, dateSpec.min, dateSpec.sec, dateSpec.subsec)
            return date
        }
    }
    return null
}
function parseDateV3(value) {
    // Built-in date parser might not be the best, but it likely supports more formats than we do currently and
    // it's only used in the loose mode.
    let date = new Date(value)
    return isNaN(date.valueOf()) ? null : date
}
function parseDate(value, loose) {
    let v2CompatibleParserResult = parseDateV2Compatible(value, loose)
    // If the v2 compatible parser found a valid date, always return it for backwards compatibility
    if (v2CompatibleParserResult != null) {
        return v2CompatibleParserResult
    }
    // However, if the v2-compatible parser does not find a valid date and loose mode is enabled, we might try
    // to parse the date using other parsers that support more formats.
    if (loose === true) {
        return parseDateV3(value)
    }
    return null
}
/**
 * Returns true if the specified value is a string that can be converted to a
 * valid date.
 * If iLoose is true, applies a looser definition of date. For example, a four
 * digit number is interpreted as a year.
 */
function isDateString(iValue, iLoose) {
    return (typeof iValue === 'string') && !!formatSpecs.find(function (spec) {
        if (!(spec.strict || iLoose)) {
            return false
        }
        return spec.regex.test(iValue)
    }) || (!!iLoose && parseDateV3(iValue) != null)
}
