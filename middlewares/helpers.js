'use strict';

exports.compose2 = (f, g) => (...args) => f(g(...args));

exports.compose = (...fns) => fns.reduce(exports.compose2);

exports.pipe = (...fns) => fns.reduceRight(exports.compose2);
