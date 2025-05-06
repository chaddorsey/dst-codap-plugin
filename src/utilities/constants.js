"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kUIRotationChange = exports.kUIPivotChange = exports.kHomeMinLongitude = exports.kHomeMaxLongitude = exports.kHomeMinLatitude = exports.kHomeMaxLatitude = exports.kLatScale = exports.kBackgroundLatMin = exports.kBackgroundLatMax = exports.kBackgroundLatRange = exports.kBackgroundLatMid = exports.kBackgroundLongMid = exports.kBackgroundLongRange = exports.kBackgroundLongMin = exports.kBackgroundLongMax = exports.kBackgroundHeight = exports.kBackgroundWidth = exports.kAboutTabLabel = exports.kGraphTabLabel = exports.kCollectionName = exports.kInitialDimensions = exports.kVersion = exports.kPluginName = void 0;
exports.kPluginName = "Space-Time Cube";
exports.kVersion = "0.0.1";
exports.kInitialDimensions = {
    width: 1110,
    height: 880
};
exports.kCollectionName = "Cases";
exports.kGraphTabLabel = "3D Graph";
exports.kAboutTabLabel = "About";
// These constants work for USA_location_map.svg.png
// export const kBackgroundHeight = 334;
// export const kBackgroundWidth = 640;
// export const kBackgroundLongMax = -66.5;
// export const kBackgroundLongMin = -125.5;
// const baseBackgroundLatMax = 49.8;
// const baseBackgroundLatMin = 24.2;
// These constants work for SpaceCubeMap.png (North America map)
// export const kBackgroundHeight = 3840;
// export const kBackgroundWidth = 3840;
// export const kBackgroundLongMax = -62;
// export const kBackgroundLongMin = -130;
// const baseBackgroundLatMin = 9.6;
// const baseBackgroundLatMax = 63.5;
// These constants work for a full world map with equirectangular projection
// The correct ratio for equirectangular projection is 2:1 (width:height)
// Our downloaded map is 2048x1024 pixels
exports.kBackgroundWidth = 2048; // Exact width of our downloaded map
exports.kBackgroundHeight = 1024; // Exact height (should be exactly half the width)
exports.kBackgroundLongMax = 180; // East boundary (180° East)
exports.kBackgroundLongMin = -180; // West boundary (180° West)
let baseBackgroundLatMin = -90; // South boundary (90° South)
let baseBackgroundLatMax = 90; // North boundary (90° North)
exports.kBackgroundLongRange = exports.kBackgroundLongMax - exports.kBackgroundLongMin;
exports.kBackgroundLongMid = exports.kBackgroundLongMin + exports.kBackgroundLongRange / 2;
let baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
exports.kBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
exports.kBackgroundLatRange = baseBackgroundLatRange; // For equirectangular, this should match the actual ratio
exports.kBackgroundLatMax = exports.kBackgroundLatMid + exports.kBackgroundLatRange / 2;
exports.kBackgroundLatMin = exports.kBackgroundLatMid - exports.kBackgroundLatRange / 2;
// To keep the display area a square, always ensure that there are
// kLatScale degrees latitude for every one degree longitude.
exports.kLatScale = exports.kBackgroundLatRange / exports.kBackgroundLongRange;
exports.kHomeMaxLatitude = exports.kBackgroundLatMax - exports.kBackgroundLatRange * .05;
exports.kHomeMinLatitude = exports.kBackgroundLatMin + exports.kBackgroundLatRange * .05;
exports.kHomeMaxLongitude = exports.kBackgroundLongMax - exports.kBackgroundLongRange * .05;
exports.kHomeMinLongitude = exports.kBackgroundLongMin + exports.kBackgroundLongRange * .05;
exports.kUIPivotChange = Math.PI / 12;
exports.kUIRotationChange = Math.PI / 12;
