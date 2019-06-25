import React from 'react';
import PropTypes from 'prop-types';
import MapContainer from './map-conatainer';
import ControlTextarea from '@mapbox/mr-ui/control-textarea';
import ControlSelect from '@mapbox/mr-ui/control-select';
import ControlSwitch from '@mapbox/mr-ui/control-switch';
import ControlCheckboxSet from '@mapbox/mr-ui/control-checkbox-set';
import _ from 'lodash';
import Button from '@mapbox/mr-ui/button';
import remark from 'remark';
import reactRenderer from 'remark-react';
import { stringify } from 'querystring';
import { printMap } from '../util/print-map';
import schoolsGeoJSON from '../../data/sfusd_school_pt.wgs84.json';
import MapLegend from './map-legend';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.layerIds = ['Bikeways', 'SFMTA metro routes', 'SFMTA bus routes', 'SFUSD School Lands', 'School Speed Zones'];
    
    this.state = {
      docTitleText: 'Title goes here',
      docBodyText: `
# Heading one

Description paragraphs can go here. And can be **bold** or _italicized_.

* Or
* Maybe
* Some bullets?

## Heading two`,
      styleUrl: 'mapbox://styles/safe-routes-to-school/cjxc315vp53xs1cl4m5qi3y31',
      hasIsochrone: true,
      zoom: 11.35,
      center: [-122.4345, 37.7802],
      showTransitLayers: true,
      showBikeLayers: true,
      legendFinished: false,
      formData: {
        zoom: '14',
        center: '-122.41918,37.77483',
        school: 20
      }
    };
  }

  componentWillMount() {
    this.schoolsList = schoolsGeoJSON.features.map( (s, i) => { return {
        label: s.properties.facility_name,
        value: i
    }});
  }
  toReactDOM(markdown) {
    return remark()
      .use(reactRenderer)
      .processSync(markdown).contents;
  }

  onChangeText = val => {
    this.setState({
      docBodyText: val
    });
  };

  onChangeTitle = val => {
    this.setState({
      docTitleText: val
    });
  };

  onChangeStyle = val => {
    this.setState({
      styleUrl: val
    });
    this.updateMapFromForm();
    this.renderMap();
  };

  onChangeZoom = val => {
    const updatedFormData = _.set(this.state.formData, 'zoom', val);

    this.setState({
      formData: updatedFormData
    });
  };

  onChangeSchool = val => {
    const schoolFeature = schoolsGeoJSON.features[val];
    let updatedFormData = _.set(this.state.formData, 'center', schoolFeature.geometry.coordinates);
    updatedFormData = _.set(this.state.formData, 'school', val);
    updatedFormData = _.set(this.state.formData, 'zoom', '14');
    this.setState({
      formData: updatedFormData,
      center: schoolFeature.geometry.coordinates,
      zoom: 15,
      docTitleText: schoolFeature.properties.facility_name
    });
  };

  onToggleBikeLayers = val => {
    const bikeLayers = ['Bikeways','Bikeshare Stations'];
    this.setState({showBikeLayers: val});
    bikeLayers.forEach(layer => {
      this.state.mapObj.setLayoutProperty(layer, 'visibility', val ? 'visible' : 'none');
    });
  }

  onToggleTransitLayers = val => {
    const transitLayers = ['SFMTA route labels', 'BART stations', 'SFMTA stops', 'SFMTA routes'];
    this.setState({showTransitLayers: val});
    transitLayers.forEach(layer => {
      this.state.mapObj.setLayoutProperty(layer, 'visibility', val ? 'visible' : 'none');
    })
  }

  updateMapFromForm = () => {
    const latLon = this.state.formData.center.split(',');
    this.setState({
      center: [latLon[0].trim(), latLon[1].trim()]
    });
    this.setState({
      zoom: parseInt(this.state.formData.zoom) || this.state.zoom
    });
  };

  updateFromMap = (center, zoom) => {
    const updatedWithCenter = _.set(this.state.formData, 'center', `${center}`);
    const updatedWithZoom = _.set(this.state.formData, 'zoom', zoom);
    this.setState({
      formData: updatedWithZoom
    });
  };

  getHash = () => {
    const hashArr = window.location.hash.split('/');
    return {
      zoom: hashArr[0],
      lon: hashArr[1],
      lat: hashArr[2]
    };
  };

  updateZoomAndCenter = () => {
    const vals = getHash();
    this.setState({
      zoom: vals.zoom,
      center: [vals.lon, vals.lat]
    });
  };

  returnMap = map => {
    this.setState({mapObj: map});
    this.renderLegend(this.layerIds);
  }

  renderMap = () => {
    return (
      <MapContainer
        center={this.state.center}
        zoom={this.state.zoom}
        hasIsochrone={this.state.hasIsochrone}
        styleUrl={this.state.styleUrl}
        onMove={this.updateFromMap}
        mapDivId="map"
        returnMap={this.returnMap}
      />
    );
  };

  renderLegend = (layerIds) => {
    const layerObj = layerIds.map(layerId => {
      const layer = this.state.mapObj.getLayer(layerId);
      return {
        layerId: layerId,
        layerType: layer.type,
        layerColor: layer.type.symbol ? '#fff' : this.state.mapObj.getPaintProperty(layerId,`${layer.type}-color`)
      }
    });
    const legendComp = <MapLegend layers={layerObj} mapLegendId="map-legend" />
    this.setState({legendComponent: legendComp});
  }

  exportMap = () => {
    printMap({map: this.state.mapObj});
  }

  render() {
    const { props, state } = this;
    return (
      <div id="main">
        <div id="menuArea" className="grid mx24 my24">
          <div className="col col--6">
            <ControlTextarea
              id="document-title"
              label="Title"
              themeControlTextarea="w-full scroll-auto round-1 input"
              placeholder="Give your document a title"
              value={this.state.docTitleText}
              onChange={this.onChangeTitle}
            />
          </div>
          <div id="formArea" className="col col--6 px24">
            <ControlSelect
              id="schoolSelect"
              label="School"
              themeControlSelectContainer="py24"
              onChange={this.onChangeSchool}
              value={this.state.formData.school}
              options={this.schoolsList}
            />
            <ControlSwitch
                id="toggleLayerBike"
                label="Bike route and bikeshare stations"
                onChange={this.onToggleBikeLayers}
                value = {this.state.showBikeLayers}
            />
            <ControlSwitch
                id="toggleLayerTransit"
                label="Transit stations and lines"
                onChange={this.onToggleTransitLayers}
                value = {this.state.showTransitLayers}
            />
            <div className="my24">
              <Button onClick={this.exportMap} variant="secondary">
                Export map
              </Button>
            </div>
          </div>
          <p className="mt12">
            The area below is a preview of what your document will look like.
          </p>
        </div>
        <div id="mapArea" className="grid px12">
          <h1
            style={{ marginTop: '29px' }}
            className="mb12  txt-h1"
          >
            {this.state.docTitleText}
          </h1>
          <div className="col col--12 h600">
            {this.renderMap()}
            <div className="bg-white px12 py12 absolute bottom left">
              {this.state.legendComponent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
