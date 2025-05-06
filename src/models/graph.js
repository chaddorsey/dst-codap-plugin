"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graph = exports.kMinDatePercentRange = exports.graphMax = exports.graphMin = void 0;
let mobx_1 = require("mobx");
let constants_1 = require("../utilities/constants");
let date_utils_1 = require("../utilities/date-utils");
let trig_utils_1 = require("../utilities/trig-utils");
let codap_data_1 = require("./codap-data");
exports.graphMin = -5;
exports.graphMax = 5;
let graphRange = exports.graphMax - exports.graphMin;
let minWidth = 5;
let zoomAmount = 2.5;
let animationDuration = 200;
let dateAnimationRate = 0.1;
exports.kMinDatePercentRange = 0.01;
let Graph = /** @class */ (function () {
    function Graph() {
        this.maxDatePercent = 1;
        this.minDatePercent = 0;
        this.mapDatePercent = 0;
        this.currentDatePercent = 1;
        this.animatingDate = false;
        this.absoluteMinLatitude = constants_1.kBackgroundLatMin; // The absolute min latitude
        this.absoluteMaxLatitude = constants_1.kBackgroundLatMax; // The absolute max latitude
        this.absoluteMinLongitude = constants_1.kBackgroundLongMin; // The absolute min longitude
        this.absoluteMaxLongitude = constants_1.kBackgroundLongMax; // The absolute max longitude
        this.maxLatitude = constants_1.kHomeMaxLatitude; // The current max latitude of the graph
        this.minLatitude = constants_1.kHomeMinLatitude; // The current min latitude of the graph
        this.maxLongitude = constants_1.kHomeMaxLongitude; // The current max longitude of the graph
        this.minLongitude = constants_1.kHomeMinLongitude; // The current min longitude of the graph
        this.homeMaxLatitude = constants_1.kHomeMaxLatitude;
        this.homeMinLatitude = constants_1.kHomeMinLatitude;
        this.homeMaxLongitude = constants_1.kHomeMaxLongitude;
        this.homeMinLongitude = constants_1.kHomeMinLongitude;
        (0, mobx_1.makeAutoObservable)(this);
    }
    // Animate the graph towards its target values.
    // This is called every frame by the component.
    Graph.prototype.animate = function (dt) {
        if (this.animationPercentage != null) {
            this.animationPercentage = Math.min(this.animationPercentage + dt / animationDuration, 1);
            let smoothPercentage = Math.sin((this.animationPercentage * 2 - 1) * trig_utils_1.halfPi) / 2 + .5;
            if (this.targetMaxLat != null && this.startMaxLat != null) {
                this.setMaxLatitude(this.startMaxLat + (this.targetMaxLat - this.startMaxLat) * smoothPercentage);
            }
            if (this.targetMinLat != null && this.startMinLat != null) {
                this.setMinLatitude(this.startMinLat + (this.targetMinLat - this.startMinLat) * smoothPercentage);
            }
            if (this.targetMaxLong != null && this.startMaxLong != null) {
                this.setMaxLongitude(this.startMaxLong + (this.targetMaxLong - this.startMaxLong) * smoothPercentage);
            }
            if (this.targetMinLong != null && this.startMinLong != null) {
                this.setMinLongitude(this.startMinLong + (this.targetMinLong - this.startMinLong) * smoothPercentage);
            }
            // End the animation if we're done.
            if (this.animationPercentage >= 1) {
                this.animationPercentage = undefined;
                this.startMaxLat = undefined;
                this.startMinLat = undefined;
                this.startMaxLong = undefined;
                this.startMinLong = undefined;
                this.targetMaxLat = undefined;
                this.targetMinLat = undefined;
                this.targetMaxLong = undefined;
                this.targetMinLong = undefined;
            }
        }
        if (this.animatingDate) {
            this.setCurrentDatePercent(this.currentDatePercent + dt / 1000 * dateAnimationRate);
            if (this.currentDatePercent >= this.maxDatePercent) {
                this.setAnimatingDate(false);
            }
        }
    };
    // Sets up an animation to move the camera to the given values.
    Graph.prototype.animateTo = function (_a) {
        let _b, _c, _d, _e;
        let maxLatitude = _a.maxLatitude, minLatitude = _a.minLatitude, maxLongitude = _a.maxLongitude, minLongitude = _a.minLongitude;
        if (maxLatitude == null && minLatitude == null && maxLongitude == null && minLongitude == null)
            {return;}
        this.animationPercentage = 0;
        this.startMaxLat = this.maxLatitude;
        this.startMinLat = this.minLatitude;
        this.startMaxLong = this.maxLongitude;
        this.startMinLong = this.minLongitude;
        this.targetMaxLat = (_b = maxLatitude !== null && maxLatitude !== void 0 ? maxLatitude : this.targetMaxLat) !== null && _b !== void 0 ? _b : this.maxLatitude;
        this.targetMinLat = (_c = minLatitude !== null && minLatitude !== void 0 ? minLatitude : this.targetMinLat) !== null && _c !== void 0 ? _c : this.minLatitude;
        this.targetMaxLong = (_d = maxLongitude !== null && maxLongitude !== void 0 ? maxLongitude : this.targetMaxLong) !== null && _d !== void 0 ? _d : this.maxLongitude;
        this.targetMinLong = (_e = minLongitude !== null && minLongitude !== void 0 ? minLongitude : this.targetMinLong) !== null && _e !== void 0 ? _e : this.minLongitude;
    };
    Graph.prototype.caseIsVisible = function (caseId) {
        let latitude = codap_data_1.codapData.getLatitude(caseId);
        let longitude = codap_data_1.codapData.getLongitude(caseId);
        if (latitude == null || longitude == null)
            {return false;}
        let datePercent = this.convertCaseDateToPercent(caseId);
        if (datePercent === undefined)
            {return false;}
        return latitude >= this.minLatitude && latitude <= this.maxLatitude &&
            longitude >= this.minLongitude && longitude <= this.maxLongitude &&
            datePercent >= this.minDatePercent && datePercent <= this.currentDatePercent;
    };
    Graph.prototype.convertCaseDate = function (caseId) {
        let date = codap_data_1.codapData.getCaseDate(caseId);
        return date !== undefined && isFinite(date) ? date : this.defaultDate;
    };
    Graph.prototype.convertCaseDateToGraph = function (caseId) {
        return this.convertDateToGraph(this.convertCaseDate(caseId));
    };
    Graph.prototype.convertCaseDateToPercent = function (caseId) {
        return this.convertDateToPercent(this.convertCaseDate(caseId));
    };
    Graph.prototype.convertDateToGraph = function (date) {
        return this.convertPercentToGraph(this.convertDateToPercent(date));
    };
    Graph.prototype.convertDateToPercent = function (date) {
        return (date - codap_data_1.codapData.absoluteMinDate) / codap_data_1.codapData.absoluteDateRange;
    };
    Graph.prototype.convertLat = function (_lat) {
        let lat = _lat !== null && _lat !== void 0 ? _lat : this.defaultLat;
        return ((lat - this.minLatitude) / this.latRange) * graphRange + exports.graphMin;
    };
    Graph.prototype.convertLong = function (_long) {
        let long = _long !== null && _long !== void 0 ? _long : this.defaultLong;
        return ((long - this.minLongitude) / this.longRange) * graphRange + exports.graphMin;
    };
    Graph.prototype.convertPercentToDate = function (percent) {
        return codap_data_1.codapData.absoluteMinDate + percent * codap_data_1.codapData.absoluteDateRange;
    };
    Graph.prototype.convertPercentToGraph = function (percent) {
        return (percent - this.minDatePercent) / (this.maxDatePercent - this.minDatePercent) * graphRange + exports.graphMin;
    };
    Object.defineProperty(Graph.prototype, "canAnimateDate", {
        get () {
            return this.currentDatePercent < this.maxDatePercent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canPanDown", {
        get () {
            return this.minLatitude > this.absoluteMinLatitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canPanLeft", {
        get () {
            return this.minLongitude > this.absoluteMinLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canPanRight", {
        get () {
            return this.maxLongitude < this.absoluteMaxLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canPanUp", {
        get () {
            return this.maxLatitude < this.absoluteMaxLatitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canReset", {
        get () {
            return this.maxLatitude !== this.homeMaxLatitude || this.minLatitude !== this.homeMinLatitude ||
                this.maxLongitude !== this.homeMaxLongitude || this.minLongitude !== this.homeMinLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canZoomIn", {
        get () {
            let _a;
            let longRange = (_a = this.targetLongRange) !== null && _a !== void 0 ? _a : this.longRange;
            return longRange > minWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "canZoomOut", {
        get () {
            let _a;
            let longRange = (_a = this.targetLongRange) !== null && _a !== void 0 ? _a : this.longRange;
            return longRange < this.maxWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "centerLat", {
        get () {
            return (this.minLatitude + this.maxLatitude) / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "centerLong", {
        get () {
            return (this.minLongitude + this.maxLongitude) / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "centerX", {
        get () {
            return this.convertLat(this.centerLat);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "centerZ", {
        get () {
            return this.convertLong(this.centerLong);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "dateRange", {
        get () {
            return this.maxDate - this.minDate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "defaultDate", {
        get () {
            return this.minDate + this.dateRange / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "defaultLat", {
        get () {
            return this.minLatitude + this.latRange / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "defaultLong", {
        get () {
            return this.minLongitude + this.longRange / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "latRange", {
        get () {
            return this.maxLatitude - this.minLatitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "longRange", {
        get () {
            return this.maxLongitude - this.minLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "mapPosition", {
        get () {
            return this.convertPercentToGraph(this.mapDatePercent);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "maxDate", {
        get () {
            return this.convertPercentToDate(this.maxDatePercent);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "maxWidth", {
        get () {
            return this.absoluteMaxLongitude - this.absoluteMinLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "minDate", {
        get () {
            return this.convertPercentToDate(this.minDatePercent);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "targetLongRange", {
        get () {
            if (this.targetMaxLong != null && this.targetMinLong != null)
                {return this.targetMaxLong - this.targetMinLong;}
        },
        enumerable: false,
        configurable: true
    });
    Graph.prototype.getDateStringFromPercent = function (percent) {
        return (0, date_utils_1.formatDateString)(new Date(this.convertPercentToDate(percent)));
    };
    Graph.prototype.latitudeInGraphSpace = function (_lat) {
        return this.convertLat(_lat) - this.centerX;
    };
    Graph.prototype.longitudeInGraphSpace = function (_long) {
        return this.convertLong(_long) - this.centerZ;
    };
    Graph.prototype.panDown = function (amount) {
        if (!this.canPanDown)
            {return;}
        let __amount = amount !== null && amount !== void 0 ? amount : this.latRange / 4;
        let _amount = Math.min(Math.abs(__amount), this.minLatitude - this.absoluteMinLatitude);
        this.animateTo({ maxLatitude: this.maxLatitude - _amount, minLatitude: this.minLatitude - _amount });
    };
    Graph.prototype.panLeft = function (amount) {
        if (!this.canPanLeft)
            {return;}
        let __amount = amount !== null && amount !== void 0 ? amount : this.longRange / 4;
        let _amount = Math.min(Math.abs(__amount), this.minLongitude - this.absoluteMinLongitude);
        this.animateTo({ maxLongitude: this.maxLongitude - _amount, minLongitude: this.minLongitude - _amount });
    };
    Graph.prototype.panRight = function (amount) {
        if (!this.canPanRight)
            {return;}
        let __amount = amount !== null && amount !== void 0 ? amount : this.longRange / 4;
        let _amount = Math.min(Math.abs(__amount), this.absoluteMaxLongitude - this.maxLongitude);
        this.animateTo({ maxLongitude: this.maxLongitude + _amount, minLongitude: this.minLongitude + _amount });
    };
    Graph.prototype.panUp = function (amount) {
        if (!this.canPanUp)
            {return;}
        let __amount = amount !== null && amount !== void 0 ? amount : this.latRange / 4;
        let _amount = Math.min(Math.abs(__amount), this.absoluteMaxLatitude - this.maxLatitude);
        this.animateTo({ maxLatitude: this.maxLatitude + _amount, minLatitude: this.minLatitude + _amount });
    };
    Graph.prototype.reset = function () {
        this.animateTo({
            maxLatitude: this.homeMaxLatitude,
            minLatitude: this.homeMinLatitude,
            maxLongitude: this.homeMaxLongitude,
            minLongitude: this.homeMinLongitude
        });
    };
    Graph.prototype.restrictDates = function () {
        this.setCurrentDatePercent(this.currentDatePercent);
        this.setMapDatePercent(this.mapDatePercent);
    };
    /**
     * Reset the date visualization to show all data in the newly loaded dataset
     * This method should be called after a new dataset is loaded and date range is set
     */
    Graph.prototype.resetDateVisualization = function () {
        // Reset all date percentages to default values
        this.minDatePercent = 0;
        this.maxDatePercent = 1;
        this.mapDatePercent = 0;
        this.currentDatePercent = 1;
        this.animatingDate = false;
    };
    Graph.prototype.setAnimatingDate = function (animating) {
        this.animatingDate = animating;
    };
    Graph.prototype.setCurrentDatePercent = function (date) {
        this.currentDatePercent = (0, date_utils_1.datePercentInRange)(date, this.minDatePercent, this.maxDatePercent);
    };
    Graph.prototype.setMapDatePercent = function (date) {
        this.mapDatePercent = (0, date_utils_1.datePercentInRange)(date, this.minDatePercent, this.maxDatePercent);
    };
    Graph.prototype.setMaxDatePercent = function (date) {
        this.maxDatePercent = (0, date_utils_1.datePercentInRange)(date);
        this.restrictDates();
    };
    Graph.prototype.setMinDatePercent = function (date) {
        this.minDatePercent = (0, date_utils_1.datePercentInRange)(date);
        this.restrictDates();
    };
    Graph.prototype.setMaxLatitude = function (lat) {
        this.maxLatitude = Math.min(this.absoluteMaxLatitude, lat);
    };
    Graph.prototype.setMaxLongitude = function (long) {
        this.maxLongitude = Math.min(this.absoluteMaxLongitude, long);
    };
    Graph.prototype.setMinLatitude = function (lat) {
        this.minLatitude = Math.max(this.absoluteMinLatitude, lat);
    };
    Graph.prototype.setMinLongitude = function (long) {
        this.minLongitude = Math.max(this.absoluteMinLongitude, long);
    };
    Graph.prototype.zoomIn = function () {
        let _a, _b, _c, _d;
        let _zoomAmount = Math.min(zoomAmount, (this.longRange - minWidth) / 2);
        let maxLatitude = ((_a = this.targetMaxLat) !== null && _a !== void 0 ? _a : this.maxLatitude) - _zoomAmount * constants_1.kLatScale;
        let minLatitude = ((_b = this.targetMinLat) !== null && _b !== void 0 ? _b : this.minLatitude) + _zoomAmount * constants_1.kLatScale;
        let maxLongitude = ((_c = this.targetMaxLong) !== null && _c !== void 0 ? _c : this.maxLongitude) - _zoomAmount;
        let minLongitude = ((_d = this.targetMinLong) !== null && _d !== void 0 ? _d : this.minLongitude) + _zoomAmount;
        this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
    };
    Graph.prototype.zoomOut = function () {
        let _a, _b, _c, _d;
        // Always make sure we zoom out zoomAmount * 2 so we maintain a square.
        // To do this, if we bump into the max or min, we increase the other side by the amount we'd go over.
        // If both sides go over, then we'll be capped at the max dimensions anyway.
        let maxLatitude = ((_a = this.targetMaxLat) !== null && _a !== void 0 ? _a : this.maxLatitude) + zoomAmount * constants_1.kLatScale;
        let minLatitude = ((_b = this.targetMinLat) !== null && _b !== void 0 ? _b : this.minLatitude) - zoomAmount * constants_1.kLatScale;
        if (maxLatitude > this.absoluteMaxLatitude) {
            minLatitude -= maxLatitude - this.absoluteMaxLatitude;
            maxLatitude = this.absoluteMaxLatitude;
        }
        if (minLatitude < this.absoluteMinLatitude) {
            maxLatitude += this.absoluteMinLatitude - minLatitude;
            minLatitude = this.absoluteMinLatitude;
        }
        let maxLongitude = ((_c = this.targetMaxLong) !== null && _c !== void 0 ? _c : this.maxLongitude) + zoomAmount;
        let minLongitude = ((_d = this.targetMinLong) !== null && _d !== void 0 ? _d : this.minLongitude) - zoomAmount;
        if (maxLongitude > this.absoluteMaxLongitude) {
            minLongitude -= maxLongitude - this.absoluteMaxLongitude;
            maxLongitude = this.absoluteMaxLongitude;
        }
        if (minLongitude < this.absoluteMinLongitude) {
            maxLongitude += this.absoluteMinLongitude - minLongitude;
            minLongitude = this.absoluteMinLongitude;
        }
        this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
    };
    /**
     * Updates the absolute boundaries of the map based on the dataset
     * @param minLat Minimum latitude boundary
     * @param maxLat Maximum latitude boundary
     * @param minLong Minimum longitude boundary
     * @param maxLong Maximum longitude boundary
     */
    Graph.prototype.updateAbsoluteBounds = function (minLat, maxLat, minLong, maxLong) {
        // Update absolute boundaries
        this.absoluteMinLatitude = minLat;
        this.absoluteMaxLatitude = maxLat;
        this.absoluteMinLongitude = minLong;
        this.absoluteMaxLongitude = maxLong;
        // Also update the home boundaries to match the new data boundaries
        this.homeMinLatitude = minLat;
        this.homeMaxLatitude = maxLat;
        this.homeMinLongitude = minLong;
        this.homeMaxLongitude = maxLong;
    };
    /**
     * Resets the view to the newly set data boundaries
     */
    Graph.prototype.resetToDataBounds = function () {
        // Animate to the home boundaries (which were set in updateAbsoluteBounds)
        this.animateTo({
            maxLatitude: this.homeMaxLatitude,
            minLatitude: this.homeMinLatitude,
            maxLongitude: this.homeMaxLongitude,
            minLongitude: this.homeMinLongitude
        });
    };
    /**
     * Resets the view to the home boundaries
     * Alias for reset() method for backward compatibility
     */
    Graph.prototype.resetToHomeView = function () {
        this.reset();
    };
    return Graph;
}());
exports.graph = new Graph();
