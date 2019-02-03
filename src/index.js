import SVG from './SVG';
const PIXI = require('pixi.js');

// Don't define twice
if (!PIXI.SVG) {
    // Assign to global pixi object
    Object.defineProperty(PIXI, 'SVG', {
        get() {
            return SVG;
        }
    });
}

export default SVG;
