import saveAs from "file-saver";
import mapboxgl from "mapbox-gl";
import mergeImages from "merge-images";

import mapboxAttribution from "./attribution/attribution.png";
import mapboxLogo from "./attribution/mapbox-logo-color.png";

// Saves a print-resolution map to disk
// Returns a promise that resolves once save is complete
export function printMap({ map, dimensions = [792, 936], filename = "map" }) {
  return new Promise((resolve, reject) => {
    const screenPixelRatio = window.devicePixelRatio;
    const screenCanvas = map.getCanvas();
    const screenDimensions = [screenCanvas.width / screenPixelRatio, screenCanvas.height / screenPixelRatio];
    const printPixelRatio = dimensions[0] / screenDimensions[0];

    // Mapbox determines the pixel density for rendering from the device pixel ratio.
    // We want to render the same-sized map with a higher pixel density.
    Object.defineProperty(window, "devicePixelRatio", {
      get: () => printPixelRatio
    });

    const container = document.createElement("div");
    container.id = "print-map-container";
    container.style.width = screenDimensions[0] + "px";
    container.style.height = screenDimensions[1] + "px";
    document.body.appendChild(container);
    const style = map.getStyle();
    style.transition = { duration: 0, delay: 0 };

    const printable = new mapboxgl.Map({
      container,
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      interactive: false,
      style,
      fadeDuration: 0,
      preserveDrawingBuffer: true // enable printing
    });

    printable.on("load", () => {
      const printSoon = () => {
        printable.off("render", printSoon);
        setTimeout(print, 2000);
      };
      printable.on("render", printSoon);
    });

    const print = async () => {
      if (printable.loaded()) {
        const canvas = printable.getCanvas();

        const mergedb64 = await mergeImages(
          [
            {
              src: canvas.toDataURL("image/png"),
              x: 0,
              y: 0
            },
            {
              src: mapboxLogo,
              x: 20,
              y: canvas.height - 75
            },
            {
              src: mapboxAttribution,
              x: canvas.width - 430,
              y: canvas.height - 75
            }
          ],
          {
            format: "image/png"
          }
        );

        const blob = await blobify(mergedb64);
        saveAs(blob, filename + ".png", true);
        container.remove();
        Object.defineProperty(window, "devicePixelRatio", {
          get: () => screenPixelRatio
        });
        resolve();
      }
    };
  });
}

const blobify = async b64 => {
  return await fetch(b64).then(res => res.blob());
};