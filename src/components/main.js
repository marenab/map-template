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

class Main extends React.Component {
  constructor(props) {
    super(props);
    
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
      zoom: 11.35,
      center: [-122.4345, 37.7802],
      showTransitLayers: true,
      showBikeLayers: true,
      showWalkingIsochrone: true,
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

  onToggleWalkingIsochrone = val => {
    this.setState({showWalkingIsochrone: val});
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
  }

  renderMap = () => {
    return (
      <MapContainer
        center={this.state.center}
        zoom={this.state.zoom}
        hasIsochrone={this.state.showWalkingIsochrone}
        styleUrl={this.state.styleUrl}
        onMove={this.updateFromMap}
        mapDivId="map"
        returnMap={this.returnMap}
      />
    );
  };

  exportMap = () => {
    printMap({map: this.state.mapObj, filename: this.state.docTitleText});
  }

  render() {
    const { props, state } = this;
    return (
      <div id="main">
        <div id="formArea" className="grid px24 pt24">
          <div className="col col--3 px24">
            <ControlSelect
              id="schoolSelect"
              label="School"
              themeControlSelectContainer="py24"
              onChange={this.onChangeSchool}
              value={this.state.formData.school}
              options={this.schoolsList}
            />
            <ControlTextarea
              id="document-title"
              label="Title"
              themeControlTextarea="w-full scroll-auto round-1 input"
              placeholder="Give your document a title"
              value={this.state.docTitleText}
              onChange={this.onChangeTitle}
            />
          </div>
          <div className="col col--3 px24 pt24">
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
            <ControlSwitch
                id="toggleWalkingIsochrone"
                label="10-min Walk Radius"
                onChange={this.onToggleWalkingIsochrone}
                value = {this.state.showWalkingIsochrone}
            />
          </div>
          <div className="my24  align-center ">
            <Button onClick={this.exportMap} variant="secondary">
            Export map
            </Button>
          </div>
          </div>
          <h1
            style={{ marginTop: '29px' }}
            className="mb12  txt-h1"
          >
            {this.state.docTitleText}
          </h1>

        <div id="mapArea" className="grid px12">
          <div className="col col--12" style={{display: 'block', height:'936px', width: '792px'}}>{this.renderMap()}</div>
        </div>
      </div>
    );
  }
}

export default Main;
