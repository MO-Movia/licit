// Moved these files here because exports-loader is only valid when built
// using webpack, but this project is being built using babel.

// The MathQuill IIFE explicitly looks for jQuery at window.jQuery.
// This means that
//    A) window must exist (browser env only)
//    B) jQuery is being loaded via <script src=".../jquery">
//
import jquery from 'jquery';
window.jQuery = window.jQuery || jquery;

import mathquill from 'node-mathquill/build/mathquill.js';
window.MathQuill = window.MathQuill || mathquill;

import 'node-mathquill/build/mathquill.css';

export const MathQuill = window.MathQuill || mathquill; 
