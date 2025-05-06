"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
let mobx_1 = require("mobx");
let UI = /** @class */ (function () {
    function UI() {
        // The name of the orbit controls currently being used.
        // This prevents other orbit controls from updating the camera position.
        this.activeControls = null;
        // True if we're actively selecting points using the marquee.
        // Suppresses updating selection from codap notifications.
        this.activeMarquee = false;
        this.mode = "pointer";
        this.displayLegend = true;
        // Whether to show the dataset configuration panel
        this.showDatasetConfig = false;
        (0, mobx_1.makeAutoObservable)(this);
    }
    UI.prototype.setActiveControls = function (name) {
        this.activeControls = name;
    };
    UI.prototype.setActiveMarquee = function (active) {
        this.activeMarquee = active;
    };
    UI.prototype.setDisplayLegend = function (display) {
        this.displayLegend = display;
    };
    UI.prototype.setMode = function (mode) {
        this.mode = mode;
    };
    /**
     * Sets whether to show the dataset configuration panel
     */
    UI.prototype.setShowDatasetConfig = function (show) {
        this.showDatasetConfig = show;
    };
    return UI;
}());
exports.ui = new UI();
