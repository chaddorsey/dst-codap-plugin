"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quarterPi = exports.halfPi = exports.twoPi = void 0;
exports.normalizeRadian2Pi = normalizeRadian2Pi;
exports.normalizeRadianMinusPi = normalizeRadianMinusPi;
exports.twoPi = Math.PI * 2;
exports.halfPi = Math.PI / 2;
exports.quarterPi = Math.PI / 4;
// max - min should equal two pi
function normalizeRadian(_radian, min, max) {
    let radian = _radian;
    while (radian < min)
        {radian += exports.twoPi;}
    while (radian >= max)
        {radian -= exports.twoPi;}
    return radian;
}
// Returns the equivalent radian between 0 and two pi.
function normalizeRadian2Pi(radian) {
    return normalizeRadian(radian, 0, exports.twoPi);
}
// Returns the equivalent radian betweeen -pi and pi.
function normalizeRadianMinusPi(radian) {
    return normalizeRadian(radian, -Math.PI, Math.PI);
}
