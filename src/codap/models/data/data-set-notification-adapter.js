"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.setDataSetNotificationAdapter = setDataSetNotificationAdapter
exports.getDataSetNotificationAdapter = getDataSetNotificationAdapter
let gDataSetNotificationAdapter = {
    convertAttribute (attr, dataset) { return attr },
    convertCase (_case, dataset) { return _case }
}
function setDataSetNotificationAdapter(adapter) {
    gDataSetNotificationAdapter = adapter
}
function getDataSetNotificationAdapter() {
    return gDataSetNotificationAdapter
}
