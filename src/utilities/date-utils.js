"use strict";
/**
 * Utility functions for parsing and handling dates in different formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.tryParseDate = tryParseDate;
exports.parseDateWithFormat = parseDateWithFormat;
exports.createDateFromComponents = createDateFromComponents;
exports.formatDateString = formatDateString;
exports.datePercentInRange = datePercentInRange;
exports.analyzeDateString = analyzeDateString;
/**
 * Parse a date string using the specified format or auto-detect the format
 * @param dateStr The date string to parse
 * @param format Optional format string or "auto" to auto-detect
 * @returns Timestamp (milliseconds since epoch) or undefined if parsing failed
 */
function parseDate(dateStr, format) {
    if (format === void 0) { format = "auto"; }
    if (!dateStr)
        {return undefined;}
    try {
        if (format === "auto") {
            return tryParseDate(dateStr);
        }
        else {
            return parseDateWithFormat(dateStr, format);
        }
    }
    catch (error) {
        console.error("Error parsing date:", error);
        return undefined;
    }
}
/**
 * Attempt to parse a date string by trying various common formats
 * @param dateStr The date string to parse
 * @returns Timestamp (milliseconds since epoch) or undefined if parsing failed
 */
function tryParseDate(dateStr) {
    if (!dateStr)
        {return undefined;}
    let cleanedStr = String(dateStr).trim();
    if (!cleanedStr)
        {return undefined;}
    let timestamp;
    // Try to parse as ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
    if (/^\d{4}-\d{2}-\d{2}/.test(cleanedStr)) {
        var date = new Date(cleanedStr);
        if (!isNaN(date.getTime())) {
            timestamp = date.getTime();
        }
    }
    // MM/DD/YYYY format
    if (!timestamp && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("/");
        if (parts.length === 3) {
            var month = parseInt(parts[0], 10) - 1; // Convert 1-based to 0-based
            var day = parseInt(parts[1], 10);
            var year = parseInt(parts[2], 10);
            // Check for valid values
            if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // DD/MM/YYYY format (less common in US data)
    if (!timestamp && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("/");
        if (parts.length === 3) {
            var day = parseInt(parts[0], 10);
            var month = parseInt(parts[1], 10) - 1; // Convert 1-based to 0-based
            var year = parseInt(parts[2], 10);
            // Check for valid values
            if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // YYYY/MM/DD format
    if (!timestamp && /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("/");
        if (parts.length === 3) {
            var year = parseInt(parts[0], 10);
            var month = parseInt(parts[1], 10) - 1; // Convert 1-based to 0-based
            var day = parseInt(parts[2], 10);
            if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // M/D/YYYY format (fewer digits)
    if (!timestamp && /^\d{1}\/\d{1}\/\d{4}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("/");
        if (parts.length === 3) {
            var month = parseInt(parts[0], 10) - 1; // Convert 1-based to 0-based
            var day = parseInt(parts[1], 10);
            var year = parseInt(parts[2], 10);
            if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // MM/DD/YY format (with 2-digit year)
    if (!timestamp && /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("/");
        if (parts.length === 3) {
            var month = parseInt(parts[0], 10) - 1; // Convert 1-based to 0-based
            var day = parseInt(parts[1], 10);
            var year = parseInt(parts[2], 10);
            // Assume 20xx for years less than 50, 19xx otherwise
            if (year < 50) {
                year += 2000;
            }
            else {
                year += 1900;
            }
            if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // MM-DD-YYYY format
    if (!timestamp && /^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanedStr)) {
        var parts = cleanedStr.split("-");
        if (parts.length === 3) {
            var month = parseInt(parts[0], 10) - 1; // Convert 1-based to 0-based
            var day = parseInt(parts[1], 10);
            var year = parseInt(parts[2], 10);
            if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
                var date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    timestamp = date.getTime();
                }
            }
        }
    }
    // Check for "Month Day, Year" format (e.g., "June 15, 2005")
    if (!timestamp && /^[A-Za-z]+\s+\d{1,2}(?:,|\s)\s*\d{4}$/.test(cleanedStr)) {
        var date = new Date(cleanedStr);
        if (!isNaN(date.getTime())) {
            timestamp = date.getTime();
        }
    }
    // Check for abbreviated month (e.g., "Jun 15, 2005")
    if (!timestamp && /^[A-Za-z]{3}\s+\d{1,2}(?:,|\s)\s*\d{4}$/.test(cleanedStr)) {
        var date = new Date(cleanedStr);
        if (!isNaN(date.getTime())) {
            timestamp = date.getTime();
        }
    }
    // Try numbers that might be timestamps
    if (!timestamp && /^\d+$/.test(cleanedStr)) {
        let num = parseInt(cleanedStr, 10);
        // Unix timestamp (seconds since epoch)
        if (cleanedStr.length === 10) {
            var date = new Date(num * 1000);
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            }
        }
        // Unix timestamp (milliseconds since epoch)
        if (!timestamp && cleanedStr.length === 13) {
            var date = new Date(num);
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            }
        }
        // Year only
        if (!timestamp && num >= 1000 && num <= 9999) {
            var date = new Date(num, 0, 1); // January 1st of year
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            }
        }
    }
    // YYYYMMDD compact format
    if (!timestamp && /^\d{8}$/.test(cleanedStr) && cleanedStr.length === 8) {
        var year = parseInt(cleanedStr.substring(0, 4), 10);
        var month = parseInt(cleanedStr.substring(4, 6), 10) - 1;
        var day = parseInt(cleanedStr.substring(6, 8), 10);
        if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1000 && year < 10000) {
            var date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            }
        }
    }
    // Fallback to Date constructor if we couldn't parse using any specific format
    if (!timestamp) {
        try {
            var date = new Date(cleanedStr);
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            }
        }
        catch (e) {
            // Parsing failed
            console.warn("Failed to parse date: ".concat(cleanedStr));
        }
    }
    return timestamp;
}
/**
 * Parse a date using a specific format
 * @param dateStr The date string to parse
 * @param format The format string (e.g., "yyyy-MM-dd")
 * @returns Timestamp or undefined if parsing failed
 */
function parseDateWithFormat(dateStr, format) {
    // Simple format parsing for common patterns
    switch (format.toLowerCase()) {
        case "yyyy-mm-dd": {
            var _a = dateStr.split("-").map(Number), year = _a[0], month = _a[1], day = _a[2];
            var parsedDate = new Date(year, month - 1, day);
            return !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : undefined;
        }
        case "mm/dd/yyyy": {
            var _b = dateStr.split("/").map(Number), month = _b[0], day = _b[1], year = _b[2];
            var parsedDate = new Date(year, month - 1, day);
            return !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : undefined;
        }
        case "dd-mm-yyyy": {
            var _c = dateStr.split("-").map(Number), day = _c[0], month = _c[1], year = _c[2];
            var parsedDate = new Date(year, month - 1, day);
            return !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : undefined;
        }
        default:
            // For unrecognized formats, fall back to auto-detection
            return tryParseDate(dateStr);
    }
}
/**
 * Create a timestamp from separate year, month, and day values
 * @param year The year value
 * @param month The month value (1-12)
 * @param day The day value (1-31)
 * @returns Timestamp
 */
function createDateFromComponents(year, month, day) {
    // Default to 2000-01-01 for any missing component
    let y = year || 2000;
    let m = (month || 1) - 1; // JavaScript months are 0-indexed
    let d = day || 1;
    return Date.UTC(y, m, d);
}
function padZero(num) {
    return num < 10 ? "0".concat(num) : num;
}
function formatDateString(date) {
    let month = padZero(date.getMonth() + 1);
    let day = padZero(date.getDate());
    let year = padZero(date.getFullYear() % 100);
    return "".concat(month, "/").concat(day, "/").concat(year);
}
function datePercentInRange(date, min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    return Math.min(max, Math.max(min, date));
}
/**
 * Analyze a date string and return information about its format and parsed value
 * @param dateStr The date string to analyze
 * @returns An object with format information and parsed date
 */
function analyzeDateString(dateStr) {
    if (!dateStr) {
        return {
            format: "empty",
            formatDetails: "Empty string",
            parsed: null,
            isValid: false
        };
    }
    let cleaned = String(dateStr).trim();
    let format = "unknown";
    let formatDetails = "";
    let parsed = null;
    // Try ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
        format = "iso";
        formatDetails = "YYYY-MM-DD";
        parsed = new Date(cleaned);
    }
    // Try MM/DD/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
        format = "slash_mdy";
        formatDetails = "MM/DD/YYYY";
        var _a = cleaned.split("/").map(Number), month = _a[0], day = _a[1], year = _a[2];
        parsed = new Date(year, month - 1, day);
    }
    // Try YYYY/MM/DD
    else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleaned)) {
        format = "slash_ymd";
        formatDetails = "YYYY/MM/DD";
        var _b = cleaned.split("/").map(Number), year = _b[0], month = _b[1], day = _b[2];
        parsed = new Date(year, month - 1, day);
    }
    // Try MM-DD-YYYY
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleaned)) {
        format = "dash_mdy";
        formatDetails = "MM-DD-YYYY";
        var _c = cleaned.split("-").map(Number), month = _c[0], day = _c[1], year = _c[2];
        parsed = new Date(year, month - 1, day);
    }
    // Try Month DD, YYYY
    else if (/^[A-Za-z]+\s+\d{1,2}(?:,|\s)\s*\d{4}$/.test(cleaned)) {
        format = "monthName";
        formatDetails = "Month DD, YYYY";
        parsed = new Date(cleaned);
    }
    // Try Mon DD, YYYY
    else if (/^[A-Za-z]{3}\s+\d{1,2}(?:,|\s)\s*\d{4}$/.test(cleaned)) {
        format = "abbrevMonth";
        formatDetails = "Mon DD, YYYY";
        parsed = new Date(cleaned);
    }
    // Try MM/DD/YY
    else if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(cleaned)) {
        format = "twoDigitYear";
        formatDetails = "MM/DD/YY";
        var _d = cleaned.split("/").map(Number), month = _d[0], day = _d[1], shortYear = _d[2];
        var year = shortYear < 50 ? 2000 + shortYear : 1900 + shortYear;
        parsed = new Date(year, month - 1, day);
    }
    // Try M/D/YYYY
    else if (/^\d{1}\/\d{1}\/\d{4}$/.test(cleaned)) {
        format = "slash_mdy_single";
        formatDetails = "M/D/YYYY";
        var _e = cleaned.split("/").map(Number), month = _e[0], day = _e[1], year = _e[2];
        parsed = new Date(year, month - 1, day);
    }
    // Try just numbers
    else if (/^\d+$/.test(cleaned)) {
        let num = parseInt(cleaned, 10);
        if (cleaned.length === 10) { // Unix timestamp (seconds)
            format = "timestamp_seconds";
            formatDetails = "Unix timestamp (seconds)";
            parsed = new Date(num * 1000);
        }
        else if (cleaned.length === 13) { // Unix timestamp (milliseconds)
            format = "timestamp_ms";
            formatDetails = "Unix timestamp (milliseconds)";
            parsed = new Date(num);
        }
        else if (num >= 1000 && num <= 9999) { // Year
            format = "year";
            formatDetails = "YYYY";
            parsed = new Date(num, 0, 1);
        }
        else {
            format = "numeric";
            formatDetails = "Unknown numeric format";
            parsed = new Date(num);
        }
    }
    // Try YYYYMMDD
    else if (/^\d{8}$/.test(cleaned) && cleaned.length === 8) {
        format = "compact";
        formatDetails = "YYYYMMDD";
        var year = parseInt(cleaned.substring(0, 4), 10);
        var month = parseInt(cleaned.substring(4, 6), 10) - 1;
        var day = parseInt(cleaned.substring(6, 8), 10);
        parsed = new Date(year, month, day);
    }
    // Fallback to Date constructor
    else {
        format = "other";
        formatDetails = "Using JavaScript Date constructor";
        parsed = new Date(cleaned);
    }
    let isValid = parsed !== null && !isNaN(parsed.getTime());
    return {
        format,
        formatDetails,
        parsed,
        isValid
    };
}
