## Backing Data

This directory contains GeoJSON data files used to produce tilesets for the Safe
Routes to Streets Mapbox project. Each dataset is in the WGS84 coordinate system
required by Mapbox Studio.

- SFMTA routes
  * sfmta_route_li.wgs84.json
- SFMTA route labels
  * sfmta_route_li.wgs84.json
- SFMTA stops
  * sfmta_stop_pt.wgs84.json
- BART stations
  * Provided by Mapbox Streets v8 tileset
- Bikeways
  * TODO
- Bikeshare Stations
  * TODO
- Crossing guards
  * sf_cross_guard_pt.wgs84.json
- School isochrone 5,10,15min
  * sfusd_school_pt_10mins.json, sfusd_school_pt_15mins.json
  * Retrieved with Mapbox Isochrones API using a [script](../scripts/isochrones).
- landuse = park
  * Provided by Mapbox Streets v8 tileset
- Off Street Parking
  * TDOO
- SFUSD School Labels
  * sfusd_school_pt.wgs84.json
- SFUSD School Lands
  * sfusd_school_land_pg.wgs84.json
- School Speed Zones
  * TODO

As part of preparing this data in June 2019, we made some fixes to the
underlying data, which are noted in [this spreadsheet][notes].

[notes]: https://docs.google.com/spreadsheets/d/147HcGrIUKOT4Wvoe8xqwE48noloZ-a62gm0WzSf7nsQ/edit#gid=0

## Converting `EPSG:3857` to `EPSG:4326` (WGS84)

The original data provided was in the [`EPSG:3857`][orig_proj] projection. We
reprojected this data into WGS84 using [`reproject`][reproject].

``` bash
$ cat sfusd_school_pt.json \
  | reproject --use-epsg-io --from=EPSG:3857 --to=EPSG:4326 > sfusd_school_pt.wgs84.json
```

[orig_proj]: https://epsg.io/3857
[reproject]: https://github.com/perliedman/reproject
