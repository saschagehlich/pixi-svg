/*!
 * pixi-svg - v1.0.0
 * Compiled Mon, 24 Apr 2017 23:10:32 UTC
 *
 * pixi-svg is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiSvg = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * d-path-parser - v1.0.0
 * by Massimo Artizzu (MaxArt2501)
 *
 * https://github.com/MaxArt2501/d-path-parser
 *
 * Licensed under the MIT License
 * See LICENSE for details
 */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.dPathParse = factory();
    }
})(this, function() {
"use strict";

return function parse(d) {
    var re = {
        command: /\s*([achlmqstvz])/gi,
        number: /\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/gi,
        comma: /\s*(?:(,)|\s)/g,
        flag: /\s*([01])/g
    };
    var matchers = {
        "number": function(must) {
            return +get("number", must);
        },
        "coordinate pair": function(must) {
            var x = get("number", must);
            if (x === null && !must) return null;
            get("comma");
            var y = get("number", true);
            return { x: +x, y: +y };
        },
        "arc definition": function(must) {
            var radii = matchers["coordinate pair"](must);
            if (!radii && !must) return null;
            get("comma");
            var rotation = +get("number", true);
            get("comma", true);
            var large = !!+get("flag", true);
            get("comma");
            var clockwise = !!+get("flag", true);
            get("comma");
            var end = matchers["coordinate pair"](true);
            return {
                radii: radii,
                rotation: rotation,
                large: large,
                clockwise: clockwise,
                end: end
            };
        }
    }
    var index = 0;
    var commands = [];

    while (index < d.length) {
        var cmd = get("command");
        var upcmd = cmd.toUpperCase();
        var relative = cmd !== upcmd;
        var sequence;
        switch (upcmd) {
            case "M":
                sequence = getSequence("coordinate pair").map(function(coords, i) {
                    if (i === 1) cmd = relative ? "l" : "L";
                    return makeCommand({ end: coords });
                });
                break;
            case "L":
            case "T":
                sequence = getSequence("coordinate pair").map(function(coords) {
                    return makeCommand({ end: coords });
                });
                break;
            case "C":
                sequence = getSequence("coordinate pair");
                if (sequence.length % 3)
                    throw Error("Expected coordinate pair triplet at position " + index);

                sequence = sequence.reduce(function(seq, coords, i) {
                    var rest = i % 3;
                    if (!rest) {
                        seq.push(makeCommand({ cp1: coords }));
                    } else {
                        var last = seq[seq.length - 1];
                        last[rest === 1 ? "cp2" : "end"] = coords;
                    }
                    return seq;
                }, []);

                break;
            case "Q":
            case "S":
                sequence = getSequence("coordinate pair");
                if (sequence.length & 1)
                    throw Error("Expected coordinate pair couple at position " + index);

                sequence = sequence.reduce(function(seq, coords, i) {
                    var odd = i & 1;
                    if (!odd) {
                        seq.push(makeCommand({ cp: coords }));
                    } else {
                        var last = seq[seq.length - 1];
                        last.end = coords;
                    }
                    return seq;
                }, []);

                break;
            case "H":
            case "V":
                sequence = getSequence("number").map(function(value) {
                    return makeCommand({ value: value });
                });
                break;
            case "A":
                sequence = getSequence("arc definition").map(makeCommand);
                break;
            case "Z":
                sequence = [ { code: "Z" } ];
                break;
        }
        commands.push.apply(commands, sequence);
    }

    return commands;

    function makeCommand(obj) {
        obj.code = cmd;
        obj.relative = relative;

        return obj;
    }
    function get(what, must) {
        re[what].lastIndex = index;
        var res = re[what].exec(d);
        if (!res || res.index !== index) {
            if (!must) return null;
            throw Error("Expected " + what + " at position " + index);
        }

        index = re[what].lastIndex;

        return res[1];
    }
    function getSequence(what) {
        var sequence = [];
        var matched;
        var must = true;
        while (matched = matchers[what](must)) {
            sequence.push(matched);
            must = !!get("comma");
        }

        return sequence;
    }
};
});

},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _dPathParser = require('d-path-parser');

var _dPathParser2 = _interopRequireDefault(_dPathParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Render SVG as Graphics
 * @class SVGUtils
 * @memberof PIXI
 */
var SVGUtils = function () {
    function SVGUtils() {
        _classCallCheck(this, SVGUtils);
    }

    /**
     * Create a PIXI Graphic from SVG element
     * @static
     * @method PIXI.SVGUtils.from
     * @param {SVGSVGElement} svg - SVG Element
     * @param {Number} [resolution=1] - Default resolution
     * @param {PIXI.Graphics} [graphic=null] - Graphic to use, or else create a new one.
     */
    SVGUtils.from = function from(svg) {
        var resolution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var graphic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (!graphic) {
            graphic = new PIXI.Graphics();
        }
        this.fill(graphic, svg, resolution);
        this.parseChildren(graphic, svg.children, resolution);
        return graphic;
    };

    /**
     * Create a PIXI Graphic from SVG element
     * @static
     * @private
     * @method PIXI.SVGUtils.parseChildren
     * @param {Array<*>} children - Collection of SVG nodes
     * @param {Number} resolution - Default resolution
     * @param {PIXI.Graphics} graphic - Graphic to use, or else create a new one.
     */


    SVGUtils.parseChildren = function parseChildren(graphic, children, resolution) {
        var inherit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.fill(graphic, child, resolution, inherit);
            switch (child.nodeName.toLowerCase()) {
                case 'path':
                    {
                        this.drawPath(graphic, child, resolution);
                        break;
                    }
                case 'circle':
                    {
                        this.drawCircle(graphic, child, resolution);
                        break;
                    }
                case 'ellipse':
                    {
                        this.drawEllipse(graphic, child, resolution);
                        break;
                    }
                case 'rect':
                    {
                        this.drawRect(graphic, child, resolution);
                        break;
                    }
                case 'polyline':
                    {
                        this.drawPolygon(graphic, child, resolution);
                        break;
                    }
                case 'g':
                    {
                        break;
                    }
                default:
                    {
                        console.info('[SVGUtils] <%s> elements unsupported', child.nodeName);
                        break;
                    }
            }
            this.parseChildren(graphic, child.children, resolution, true);
        }
    };

    /**
     * Convert the Hexidecimal string (e.g., "#fff") to uint
     * @static
     * @private
     * @method PIXI.SVGUtils.hexToUint
     */


    SVGUtils.hexToUint = function hexToUint(hex) {
        if (hex[0] === '#') {
            // Remove the hash
            hex = hex.substr(1);

            // Convert shortcolors fc9 to ffcc99
            if (hex.length === 3) {
                hex = hex.replace(/([a-f0-9])/ig, '$1$1');
            }
            return parseInt(hex, 16);
        } else {
            var div = document.createElement('div');
            div.style.color = hex;
            var rgb = window.getComputedStyle(document.body.appendChild(div)).color.match(/\d+/g).map(function (a) {
                return parseInt(a, 10);
            });
            document.body.removeChild(div);
            return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
        }
    };

    /**
     * Render a <circle> element
     * @static
     * @private
     * @method PIXI.SVGUtils.drawCircle
     * @param {PIXI.Graphics} graphic
     * @param {SVGCircleElement} circleNode
     * @param {Number} resolution
     */


    SVGUtils.drawCircle = function drawCircle(graphic, circleNode, resolution) {
        this.internalEllipse(graphic, circleNode, 'r', 'r', resolution);
    };

    /**
     * Render a <ellipse> element
     * @static
     * @private
     * @method PIXI.SVGUtils.drawEllipse
     * @param {PIXI.Graphics} graphic
     * @param {SVGCircleElement} ellipseNode
     * @param {Number} resolution
     */


    SVGUtils.drawEllipse = function drawEllipse(graphic, ellipseNode, resolution) {
        this.internalEllipse(graphic, ellipseNode, 'rx', 'ry', resolution);
    };

    /**
     * Render a <ellipse> element or <circle> element
     * @static
     * @private
     * @method PIXI.SVGUtils.internalEllipse
     * @param {PIXI.Graphics} graphic
     * @param {SVGCircleElement} node
     * @param {Number} wName Width name property
     * @param {Number} hName Height name property
     * @param {Number} resolution
     */


    SVGUtils.internalEllipse = function internalEllipse(graphic, node, wName, hName, resolution) {
        var width = parseFloat(node.getAttribute(wName)) * resolution;
        var height = parseFloat(node.getAttribute(hName)) * resolution;
        var cx = node.getAttribute('cx');
        var cy = node.getAttribute('cy');
        var x = 0;
        var y = 0;
        if (cx !== null) {
            x = parseFloat(cx) * resolution;
        }
        if (cy !== null) {
            y = parseFloat(cy) * resolution;
        }
        graphic.drawEllipse(x, y, width, height);
    };

    /**
     * Render a <rect> element
     * @static
     * @private
     * @method PIXI.SVGUtils.drawRect
     * @param {PIXI.Graphics} graphic
     * @param {SVGRectElement} rectNode
     * @param {Number} resolution
     */


    SVGUtils.drawRect = function drawRect(graphic, rectNode, resolution) {
        var x = parseFloat(rectNode.getAttribute('x'));
        var y = parseFloat(rectNode.getAttribute('y'));
        var width = parseFloat(rectNode.getAttribute('width'));
        var height = parseFloat(rectNode.getAttribute('height'));
        var rx = parseFloat(rectNode.getAttribute('rx'));
        if (rx) {
            graphic.drawRoundedRect(x * resolution, y * resolution, width * resolution, height * resolution, rx * resolution);
        } else {
            graphic.drawRect(x * resolution, y * resolution, width * resolution, height * resolution);
        }
    };

    /**
     * Set the fill and stroke style.
     * @static
     * @private
     * @method PIXI.SVGUtils.fill
     * @param {PIXI.Graphics} graphic
     * @param {SVGElement} node
     * @param {Number} resolution
     * @param {Boolean} inherit
     */


    SVGUtils.fill = function fill(graphic, node, resolution, inherit) {
        var fill = node.getAttribute('fill');
        var opacity = node.getAttribute('opacity');
        var stroke = node.getAttribute('stroke');
        var strokeWidth = node.getAttribute('stroke-width');
        var lineWidth = strokeWidth !== null ? parseFloat(strokeWidth) : 0;
        var lineColor = stroke !== null ? this.hexToUint(stroke) : graphic.lineColor;
        if (fill) {
            if (fill === 'none') {
                graphic.beginFill(0, 0);
            } else {
                graphic.beginFill(this.hexToUint(fill), opacity !== null ? parseFloat(opacity) : 1);
            }
        } else if (!inherit) {
            graphic.beginFill(0);
        }
        graphic.lineStyle(lineWidth * resolution, lineColor);

        if (node.getAttribute('stroke-linejoin')) {
            console.info('[SVGUtils] "stroke-linejoin" attribute is not supported');
        }
        if (node.getAttribute('stroke-linecap')) {
            console.info('[SVGUtils] "stroke-linecap" attribute is not supported');
        }
        if (node.getAttribute('fill-rule')) {
            console.info('[SVGUtils] "fill-rule" attribute is not supported');
        }
    };

    /**
     * Render a <path> d element
     * @static
     * @method PIXI.SVGUtils.drawPath
     * @param {PIXI.Graphics} graphic
     * @param {SVGPathElement} pathNode
     * @param {Number} resolution
     */


    SVGUtils.drawPath = function drawPath(graphic, pathNode, resolution) {
        var d = pathNode.getAttribute('d');
        var x = void 0,
            y = void 0;
        var commands = (0, _dPathParser2.default)(d);
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            switch (command.code) {
                case 'm':
                    {
                        graphic.moveTo(x += command.end.x * resolution, y += command.end.y * resolution);
                        break;
                    }
                case 'M':
                    {
                        graphic.moveTo(x = command.end.x * resolution, y = command.end.y * resolution);
                        break;
                    }
                case 'H':
                    {
                        graphic.lineTo(x = command.value * resolution, y);
                        break;
                    }
                case 'h':
                    {
                        graphic.lineTo(x += command.value * resolution, y);
                        break;
                    }
                case 'V':
                    {
                        graphic.lineTo(x, y = command.value * resolution);
                        break;
                    }
                case 'v':
                    {
                        graphic.lineTo(x, y += command.value * resolution);
                        break;
                    }
                case 'Z':
                    {
                        graphic.closePath();
                        break;
                    }
                case 'L':
                    {
                        graphic.lineTo(x = command.end.x * resolution, y = command.end.y * resolution);
                        break;
                    }
                case 'l':
                    {
                        graphic.lineTo(x += command.end.x * resolution, y += command.end.y * resolution);
                        break;
                    }
                case 'C':
                    {
                        var currX = x;
                        var currY = y;
                        graphic.bezierCurveTo(currX + command.cp1.x * resolution, currY + command.cp1.y * resolution, currX + command.cp2.x * resolution, currY + command.cp2.y * resolution, x = command.end.x * resolution, y = command.end.y * resolution);
                        break;
                    }
                case 'c':
                    {
                        var _currX = x;
                        var _currY = y;
                        graphic.bezierCurveTo(_currX + command.cp1.x * resolution, _currY + command.cp1.y * resolution, _currX + command.cp2.x * resolution, _currY + command.cp2.y * resolution, x += command.end.x * resolution, y += command.end.y * resolution);
                        break;
                    }
                case 's':
                case 'q':
                    {
                        var _currX2 = x;
                        var _currY2 = y;
                        graphic.quadraticCurveTo(_currX2 + command.cp.x * resolution, _currY2 + command.cp.y * resolution, x += command.end.x * resolution, y += command.end.y * resolution);
                        break;
                    }
                case 'S':
                case 'Q':
                    {
                        var _currX3 = x;
                        var _currY3 = y;
                        graphic.quadraticCurveTo(_currX3 + command.cp.x * resolution, _currY3 + command.cp.y * resolution, x = command.end.x * resolution, y = command.end.y * resolution);
                        break;
                    }
                default:
                    {
                        console.info('[SVGUtils] Draw command not supported:', command.code, command);
                        break;
                    }
            }
        }
    };

    return SVGUtils;
}();

// Assign to global pixi object


exports.default = SVGUtils;
PIXI.SVGUtils = SVGUtils;

},{"d-path-parser":1}]},{},[2])(2)
});


//# sourceMappingURL=pixi-svg.js.map
