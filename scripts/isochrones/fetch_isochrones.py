#! /usr/bin/env python

"""
Fetch

See: https://docs.mapbox.com/api/navigation/#isochrone
"""

import copy
import json
import os
import sys

from pyproj import Transformer

import click
import geojson
import requests

MAPBOX_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

join = lambda a: ','.join([str(i) for i in a])


def get_isochrones(lat, lng, contour_mins, access_token=MAPBOX_TOKEN):
    """
    Fetch isochrones isochrones
    """
    colors = '4286f4'
    params = (lng, lat, contour_mins, colors, access_token)
    url = "https://api.mapbox.com/isochrone/v1/mapbox/walking/%s,%s?contours_minutes=%s&contours_colors=%s&polygons=true&access_token=%s" % params
    return requests.get(url)


@click.command()
@click.option('--contour-mins', type=int, default=15)
@click.argument(
    'school_file',
    type=click.Path(exists=True, file_okay=True, dir_okay=False))
def main(contour_mins, school_file):
    """
    python3 fetch_isochrones.py  ../qgis_qa_for_mapbox_2019-06-20/geodata_3857_json/sfusd_school_pt.geojson
    """
    with open(school_file, 'r+') as f:
        schools = geojson.load(f)
    wgs84 = "epsg:4326"
    proj = Transformer.from_crs(schools.crs.properties['name'], wgs84)
    features = []
    for feat in schools.features:
        lat, lng = proj.transform(*feat.geometry.coordinates)
        print('Fetching isochrone for %s' % feat.properties['land_name'], file=sys.stderr)
        response = get_isochrones(lat, lng, contour_mins)
        assert response.status_code == 200, 'Error! %s' % response.json()['message']
        isochrones = geojson.loads(response.text)
        for iso_feat in isochrones.features:
            iso_feat['properties'].update(feat.properties)
        features.extend(isochrones.features)
    isolayer = copy.deepcopy(schools)
    isolayer.crs.properties['name'] = wgs84
    isolayer.features = features
    print(isolayer)


if __name__ == '__main__':
    sys.exit(main())
