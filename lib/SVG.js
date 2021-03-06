'use strict';

exports.__esModule = true;

var _dPathParser = require('d-path-parser');

var _dPathParser2 = _interopRequireDefault(_dPathParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');

// <div> element to measure string colors like "black"
// and convert to hex colors
var measureColor = document.createElement('div');

/**
 * Scalable Graphics drawn from SVG image document.
 * @class SVG
 * @extends PIXI.Graphics
 * @memberof PIXI
 * @param {SVGSVGElement} svg - SVG Element `<svg>`
 */

var SVG = function (_PIXI$Graphics) {
    _inherits(SVG, _PIXI$Graphics);

    /**
     * Constructor
     */
    function SVG(svg) {
        _classCallCheck(this, SVG);

        var _this = _possibleConstructorReturn(this, _PIXI$Graphics.call(this));

        _this.fill(svg);
        _this.svgChildren(svg.children);
        return _this;
    }

    /**
     * Create a PIXI Graphic from SVG element
     * @private
     * @method PIXI.SVG#svgChildren
     * @param {Array<*>} children - Collection of SVG nodes
     * @param {Boolean} [inherit=false] Whether to inherit fill settings.
     */


    SVG.prototype.svgChildren = function svgChildren(children) {
        var inherit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.fill(child, inherit);
            switch (child.nodeName.toLowerCase()) {
                case 'path':
                    {
                        this.svgPath(child);
                        break;
                    }
                case 'circle':
                case 'ellipse':
                    {
                        this.svgCircle(child);
                        break;
                    }
                case 'rect':
                    {
                        this.svgRect(child);
                        break;
                    }
                case 'polygon':
                    {
                        this.svgPoly(child, true);
                        break;
                    }
                case 'polyline':
                    {
                        this.svgPoly(child);
                        break;
                    }
                case 'g':
                    {
                        break;
                    }
                default:
                    {
                        // @if DEBUG
                        console.info('[SVGUtils] <%s> elements unsupported', child.nodeName);
                        // @endif
                        break;
                    }
            }
            this.svgChildren(child.children, true);
        }
    };

    /**
     * Convert the Hexidecimal string (e.g., "#fff") to uint
     * @private
     * @method PIXI.SVG#hexToUint
     */


    SVG.prototype.hexToUint = function hexToUint(hex) {
        if (hex[0] === '#') {
            // Remove the hash
            hex = hex.substr(1);

            // Convert shortcolors fc9 to ffcc99
            if (hex.length === 3) {
                hex = hex.replace(/([a-f0-9])/ig, '$1$1');
            }
            return parseInt(hex, 16);
        } else {
            measureColor.style.color = hex;
            var rgb = window.getComputedStyle(document.body.appendChild(measureColor)).color.match(/\d+/g).map(function (a) {
                return parseInt(a, 10);
            });
            document.body.removeChild(measureColor);
            return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
        }
    };

    /**
     * Render a <ellipse> element or <circle> element
     * @private
     * @method PIXI.SVG#internalEllipse
     * @param {SVGCircleElement} node
     */


    SVG.prototype.svgCircle = function svgCircle(node) {

        var heightProp = 'r';
        var widthProp = 'r';
        var isEllipse = node.nodeName === 'elipse';
        if (isEllipse) {
            heightProp += 'x';
            widthProp += 'y';
        }
        var width = parseFloat(node.getAttribute(widthProp));
        var height = parseFloat(node.getAttribute(heightProp));
        var cx = node.getAttribute('cx');
        var cy = node.getAttribute('cy');
        var x = 0;
        var y = 0;
        if (cx !== null) {
            x = parseFloat(cx);
        }
        if (cy !== null) {
            y = parseFloat(cy);
        }
        if (!isEllipse) {
            this.drawCircle(x, y, width);
        } else {
            this.drawEllipse(x, y, width, height);
        }
    };

    /**
     * Render a <rect> element
     * @private
     * @method PIXI.SVG#svgRect
     * @param {SVGRectElement} node
     */


    SVG.prototype.svgRect = function svgRect(node) {
        var x = parseFloat(node.getAttribute('x'));
        var y = parseFloat(node.getAttribute('y'));
        var width = parseFloat(node.getAttribute('width'));
        var height = parseFloat(node.getAttribute('height'));
        var rx = parseFloat(node.getAttribute('rx'));
        if (rx) {
            this.drawRoundedRect(x, y, width, height, rx);
        } else {
            this.drawRect(x, y, width, height);
        }
    };

    /**
     * Get the style property and parse options.
     * @private
     * @method PIXI.SVG#svgStyle
     * @param {SVGElement} node
     * @return {Object} Style attributes
     */


    SVG.prototype.svgStyle = function svgStyle(node) {
        var style = node.getAttribute('style');
        var result = {
            fill: node.getAttribute('fill'),
            opacity: node.getAttribute('opacity'),
            stroke: node.getAttribute('stroke'),
            strokeWidth: node.getAttribute('stroke-width')
        };
        if (style !== null) {
            style.split(';').forEach(function (prop) {
                var _prop$split = prop.split(':'),
                    name = _prop$split[0],
                    value = _prop$split[1];

                result[name.trim()] = value.trim();
            });
            if (result['stroke-width']) {
                result.strokeWidth = result['stroke-width'];
                delete result['stroke-width'];
            }
        }
        return result;
    };

    /**
     * Render a polyline element.
     * @private
     * @method PIXI.SVG#svgPoly
     * @param {SVGPolylineElement} node
     */


    SVG.prototype.svgPoly = function svgPoly(node, close) {

        var points = node.getAttribute('points').split(/[ ,]/g).map(function (p) {
            return parseInt(p);
        });

        this.drawPolygon(points);

        if (close) {
            this.closePath();
        }
    };

    /**
     * Set the fill and stroke style.
     * @private
     * @method PIXI.SVG#fill
     * @param {SVGElement} node
     * @param {Boolean} inherit
     */


    SVG.prototype.fill = function fill(node, inherit) {
        var _svgStyle = this.svgStyle(node),
            fill = _svgStyle.fill,
            opacity = _svgStyle.opacity,
            stroke = _svgStyle.stroke,
            strokeWidth = _svgStyle.strokeWidth;

        var defaultLineWidth = stroke !== null ? 1 : 0;
        var lineWidth = strokeWidth !== null ? parseFloat(strokeWidth) : defaultLineWidth;
        var lineColor = stroke !== null ? this.hexToUint(stroke) : this.lineColor;
        if (fill) {
            if (fill === 'none') {
                this.beginFill(0, 0);
            } else {
                this.beginFill(this.hexToUint(fill), opacity !== null ? parseFloat(opacity) : 1);
            }
        } else if (!inherit) {
            this.beginFill(0);
        }
        this.lineStyle(lineWidth, lineColor);

        // @if DEBUG
        if (node.getAttribute('stroke-linejoin')) {
            console.info('[SVGUtils] "stroke-linejoin" attribute is not supported');
        }
        if (node.getAttribute('stroke-linecap')) {
            console.info('[SVGUtils] "stroke-linecap" attribute is not supported');
        }
        if (node.getAttribute('fill-rule')) {
            console.info('[SVGUtils] "fill-rule" attribute is not supported');
        }
        // @endif
    };

    /**
     * Render a <path> d element
     * @method PIXI.SVG#svgPath
     * @param {SVGPathElement} node
     */


    SVG.prototype.svgPath = function svgPath(node) {
        var d = node.getAttribute('d');
        var x = void 0,
            y = void 0;
        var commands = (0, _dPathParser2.default)(d);
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            switch (command.code) {
                case 'm':
                    {
                        this.moveTo(x += command.end.x, y += command.end.y);
                        break;
                    }
                case 'M':
                    {
                        this.moveTo(x = command.end.x, y = command.end.y);
                        break;
                    }
                case 'H':
                    {
                        this.lineTo(x = command.value, y);
                        break;
                    }
                case 'h':
                    {
                        this.lineTo(x += command.value, y);
                        break;
                    }
                case 'V':
                    {
                        this.lineTo(x, y = command.value);
                        break;
                    }
                case 'v':
                    {
                        this.lineTo(x, y += command.value);
                        break;
                    }
                case 'Z':
                    {
                        this.closePath();
                        break;
                    }
                case 'L':
                    {
                        this.lineTo(x = command.end.x, y = command.end.y);
                        break;
                    }
                case 'l':
                    {
                        this.lineTo(x += command.end.x, y += command.end.y);
                        break;
                    }
                case 'C':
                    {
                        var currX = x;
                        var currY = y;
                        this.bezierCurveTo(currX + command.cp1.x, currY + command.cp1.y, currX + command.cp2.x, currY + command.cp2.y, x = command.end.x, y = command.end.y);
                        break;
                    }
                case 'c':
                    {
                        var _currX = x;
                        var _currY = y;
                        this.bezierCurveTo(_currX + command.cp1.x, _currY + command.cp1.y, _currX + command.cp2.x, _currY + command.cp2.y, x += command.end.x, y += command.end.y);
                        break;
                    }
                case 's':
                case 'q':
                    {
                        var _currX2 = x;
                        var _currY2 = y;
                        this.quadraticCurveTo(_currX2 + command.cp.x, _currY2 + command.cp.y, x += command.end.x, y += command.end.y);
                        break;
                    }
                case 'S':
                case 'Q':
                    {
                        var _currX3 = x;
                        var _currY3 = y;
                        this.quadraticCurveTo(_currX3 + command.cp.x, _currY3 + command.cp.y, x = command.end.x, y = command.end.y);
                        break;
                    }
                default:
                    {
                        // @if DEBUG
                        console.info('[SVGUtils] Draw command not supported:', command.code, command);
                        // @endif
                        break;
                    }
            }
        }
    };

    return SVG;
}(PIXI.Graphics);

exports.default = SVG;
//# sourceMappingURL=SVG.js.map