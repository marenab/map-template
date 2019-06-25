'use strict';

const html = require('./html');
const path = require('path');

module.exports = {
  siteBasePath: '/map-template',
  outputDirectory: path.join(__dirname, '/docs'),
  htmlSource: html()
};