'use strict';

exports.__esModule = true;

var _SVG = require('./SVG');

var _SVG2 = _interopRequireDefault(_SVG);

var _pixi = require('pixi.js');

var _pixi2 = _interopRequireDefault(_pixi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Don't define twice
if (!_pixi2.default.SVG) {
    // Assign to global pixi object
    Object.defineProperty(_pixi2.default, 'SVG', {
        get: function get() {
            return _SVG2.default;
        }
    });
}

exports.default = _SVG2.default;
//# sourceMappingURL=index.js.map