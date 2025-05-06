"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.mockGA = exports.AnalyticsCategories = void 0
exports.AnalyticsCategories = [
    "general", // catch-all for events that we haven't categorized yet
    "data", // Interactions with generated data
    "document", // Document interactions
    "plugin", // Game interactions
    "model", // Model interactions
    "plot", // Plot interactions
    "session", // Session events (log in/out)
    "component", // General component interactions
    "table", // Table interactions
    "slider", // Slider interactions
    "text", // Text interactions
    "calculator", // Calculator interactions (correcting typo)
    "map", // Map interactions
    "webview", // Webview interactions
]
exports.mockGA = {
    gtag (event, eventName, data) {
        /* eslint-disable no-console */
        console.group("Mock GA4 event payload:")
        console.debug("Event:", event)
        console.debug("Event Name:", eventName)
        console.debug("Data:", JSON.stringify(data, null, 2))
        console.groupEnd()
        /* eslint-enable no-console */
    }
}
