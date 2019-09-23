"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Signal = /** @class */ (function () {
    function Signal() {
        this.name = null;
        this.data = {};
        this.trigger = null;
        this.trip = [];
    }
    Signal.prototype.by = function (component) {
        return component == this.trigger;
    };
    Signal.prototype.from = function (component) {
        return this.trip.some(function (current) { return component == current; });
    };
    return Signal;
}());
exports.default = Signal;
