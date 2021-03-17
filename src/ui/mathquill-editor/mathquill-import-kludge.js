// Moved these files here because exports-loader is only valid when built
// using webpack, but this project is being built using babel.

// The MathQuill IIFE explicitly looks for jQuery at window.jQuery.
// This means that
//    A) window must exist (browser env only)
//    B) jQuery is being loaded via <script src=".../jquery">
//
import jquery from 'jquery';
window.jQuery = window.jQuery || jquery;

import mathquill from 'node-mathquill/build/mathquill';
window.MathQuill = window.MathQuill || mathquill;

import 'node-mathquill/buidl/mathquill.css';

export const MathQuill = window.MathQuill || mathquill;

// // [FS] IRAD-1010 2020-07-24
// // With the latest to generate export default MathQuill these options need to
// // be passed into exports loader.  Moved this from webpack config to here, so
// // that package could load fine with other application.
// const MQLoader = require('exports-loader?exports=default|MathQuill&type=module!node-mathquill/build/mathquill.js');
// export const MathQuill = MQLoader.default;
