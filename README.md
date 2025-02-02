# [Safe Route to Schools](http://www.sfsaferoutes.org/)

A simple application that loads the Safe Routes to School map that allows simple customization of overlay layers and exporting a high-resolution image of the map for print.

## Using the Application

- Navigate to <URL>
- Use the school selector drop-down to select the school for which you want to review and print the map
- Change the zoom and center of the map until you are satisfied with all the
  features that are in range
- Switch on/off the Bicycling related data layers
  * This switch toggles the bicycle paths and bikeshare stations
- Switch on/off the Transit related data lauers
  * This switch toggles MUNI routes and stops, and BART stops
- Hit the `Export` button
  * This downloads a map in a size fit for printing a 11in x 13in map at 72 dpi.

## Updating the Backing Data

### To update the style
- Login to [Mapbox Studio](https://studio.mapbox.com/) with the `safe-routes-to-school` username and password
- Select the SRTS style
- Update the style
    * Do not update the name of the existing layers. This will break the toggles on the webpage
- Hit the `Publish` button when done

### To update the map data
The GeoJSON files from SFMTA/SFGIS were uploaded to Mapbox studio and converted into vector tilesets. These tilesets are referenced in the map style and updating them here wll update the displayed map.

- Login to [Mapbox Studio](https://studio.mapbox.com/) with the `safe-routes-to-school` username and password
- Select `Tilesets`from the Top menu bar
- Scroll to and select the tileset that you want to update
- On the tileset page, click `Replace` on the right column and select the updated version of the GeoJSON file

* If you are updating the school points data, also replace the `data/sfusd_school_pt.wgs84.json` file in this repo.

## Developing the Application

TODO

Development dependencies:

- npm
-
-

``` bash
$ npm install
```

To run locally:

``` bash
$ npm run build
```
