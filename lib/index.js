'use strict';

exports.__esModule = true;

var _SVG = require('./SVG');

var _SVG2 = _interopRequireDefault(_SVG);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PIXI = require('pixi.js');

// Don't define twice
if (!PIXI.SVG) {
    // Assign to global pixi object
    Object.defineProperty(PIXI, 'SVG', {
        get: function get() {
            return _SVG2.default;
        }
    });
}

exports.default = _SVG2.default;
//# sourceMappingURL=index.js.map