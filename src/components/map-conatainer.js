import mapboxgl from 'mapbox-gl'
import React from 'react';
import PropTypes from 'prop-types';
import ky, { HTTPError } from 'ky';

export default class MapContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mapContainer = React.createRef();
  }

  static propTypes = {
    center: PropTypes.array.isRequired,
    zoom: PropTypes.number.isRequired,
    hasIsochrone: PropTypes.bool.isRequired,
    mapboxAccessToken: PropTypes.string,
    styleUrl: PropTypes.string.isRequired,
    mapContainerStyle: PropTypes.object,
    onMove: PropTypes.func,
    mapDivId: PropTypes.string.isRequired
  }

  static defaultProps = {
    mapboxAccessToken: "pk.eyJ1Ijoic2FmZS1yb3V0ZXMtdG8tc2Nob29sIiwiYSI6ImNqeGFxeTlkcjE5OXYzdHFicGcyNXFxNjAifQ.-2qdb6JZxOH549ZTzS_M_w",
    mapContainerStyle: {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }

  renderMap() {
    const { center, zoom, hasIsochrone, mapboxAccessToken, styleUrl } = this.props;
    mapboxgl.accessToken = mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.current, // this.ref.current instead of assigning ref via callback as in older examples
      style: styleUrl,
      center,
      zoom,
      maxZoom: 16,
      minZoom: 11
    });

    this.map.on('load', ()=> {
      // When the map loads, add the source and layer
      this.map.addSource('iso', {
        type: 'geojson',
        data: {
          "type": 'FeatureCollection',
          "features": []
        }
      });

      this.map.addLayer({
        'id': 'isoLayer',
        'type': 'fill',
        // Use "iso" as the data source for this layer
        'source': 'iso',
        'layout': {},
        'paint': {
          // The fill color for the layer is set to a light purple
          'fill-color': '#a3a3c2',
          'fill-opacity': 0.3
        }
      }, "poi-label");

      if(hasIsochrone) {
        this.addIso(center).then(res => {
          this.map.getSource('iso').setData(res)
        });
      }

      this.props.returnMap(this.map);
    });

    this.map.on('moveend', e => {
      this.onMove();
    });
  }

  componentDidMount() {
    this.renderMap();
  }

  componentDidUpdate() {
    this.map.remove();
    this.renderMap();
  }

  componentWillUnmount() {
    this.map.remove();
  }

  onMove = e => {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    return this.props.onMove([center.lng.toFixed(5), center.lat.toFixed(5)], zoom.toFixed(1));
  }

  async addIso(center) {
    // Create variables to use in getIso()
    const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
    const profile = 'walking';
    const minutes = 5;

    const query = `${urlBase}${profile}/${center}?contours_minutes=${minutes}&polygons=true&access_token=${this.props.mapboxAccessToken}`;

    const response = await fetch(query, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new HTTPError('Fetch error: ', response.statusText);
    }

    const parsed = await response.json();
    return parsed;
  }

  render() {
    return <div id={this.props.mapDivId} style={this.props.mapContainerStyle} ref={this.mapContainer}></div>
  }
}
