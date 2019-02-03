import SVG from './SVG';
import PIXI from 'pixi.js';

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
