'use strict';

module.exports = () => {
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8" >
          <title>Map template</title>
          <link rel="stylesheet" href="https://api.mapbox.com/mapbox-assembly/mbx/v0.27.0/assembly.min.css">
          <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.css' rel='stylesheet' />
          <script async src="https://api.mapbox.com/mapbox-assembly/mbx/v0.27.0/assembly.js"></script>
      </head>
      <body></body>
      </html>`;
  return html;
};