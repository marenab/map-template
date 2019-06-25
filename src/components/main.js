import React from 'react';
import PropTypes from 'prop-types';
import MapContainer from './map-conatainer';
import ControlTextarea from '@mapbox/mr-ui/control-textarea';
import ControlSelect from '@mapbox/mr-ui/control-select';
import ControlCheckboxSet from '@mapbox/mr-ui/control-checkbox-set';
import _ from 'lodash';
import Button from '@mapbox/mr-ui/button';
import remark from 'remark';
import reactRenderer from 'remark-react';
import { stringify } from 'querystring';

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
      styleUrl: 'mapbox://styles/mapbox/streets-v11',
      hasIsochrone: false,
      zoom: 14,
      center: [-122.41918, 37.77483],
      formData: {
        zoom: '14',
        center: '-122.41918,37.77483'
      }
    };
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

  onChangeCenter = val => {
    const updatedFormData = _.set(this.state.formData, 'center', val);
    this.setState({
      formData: updatedFormData
    });
  };

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

  renderMap = () => {
    return (
      <MapContainer
        center={this.state.center}
        zoom={this.state.zoom}
        hasIsochrone={this.state.hasIsochrone}
        styleUrl={this.state.styleUrl}
        onMove={this.updateFromMap}
      />
    );
  };

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
            <ControlTextarea
              id="change-document-text"
              label="Text"
              themeControlTextarea="txt-code h600 w-full scroll-auto scroll-styled round-l input"
              aside={
                <span className="txt-s color-gray">
                  Use{' '}
                  <a
                    href="https://help.github.com/articles/github-flavored-markdown/"
                    className="link"
                    target="_blank"
                  >
                    GitHub flavored Markdown
                  </a>{' '}
                  to format the document
                </span>
              }
              placeholder="Edit your doc here"
              value={this.state.docBodyText}
              onChange={this.onChangeText}
            />
          </div>
          <div id="formArea" className="col col--6 px24">
            <ControlSelect
              id="styleSelect"
              label="Mapbox Style"
              themeControlSelectContainer="py24"
              onChange={this.onChangeStyle}
              value={this.state.styleUrl}
              options={[
                {
                  label: 'Mapbox Streets',
                  value: 'mapbox://styles/mapbox/streets-v11'
                },
                {
                  label: 'Mapbox Satellite',
                  value: 'mapbox://styles/mapbox/satellite-streets-v9'
                },
                {
                  label: 'Mapbox Dark',
                  value: 'mapbox://styles/mapbox/dark-v10'
                },
                {
                  label: 'Mapbox Light',
                  value: 'mapbox://styles/mapbox/light-v10'
                },
                  {
                      label: 'Safe Routes to Schools',
                      value: 'mapbox://styles/safe-routes-to-school/cjxc315vp53xs1cl4m5qi3y31'
                  }
              ]}
            />
            <ControlTextarea
              id="zoom"
              label="Zoom"
              themeControlTextarea="txt-code h30 mb24 w-full scroll-auto scroll-styled round-l input"
              placeholder="9"
              value={this.state.formData.zoom}
              onChange={this.onChangeZoom}
            />
            <ControlTextarea
              id="lat-lon"
              label="Center"
              themeControlTextarea="txt-code h30 mb24 w-full scroll-auto scroll-styled round-l input"
              placeholder="-122.437, 37.757"
              value={this.state.formData.center}
              onChange={this.onChangeCenter}
            />
            <ControlCheckboxSet
              id="isochrone-toggle"
              themeCheckboxContainer="py24"
              onChange={() =>
                this.setState({ hasIsochrone: !this.state.hasIsochrone })
              }
              options={[
                {
                  label: 'Display 15-minute walking isochrone?',
                  value: 'display-isochrone'
                }
              ]}
            />
            <div className="my24">
              <Button onClick={this.updateMapFromForm} variant="secondary">
                Update map
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
          <div className="col col--12 h600">{this.renderMap()}</div>
          <div className="col col--12">
            <div
              style={{ marginTop: '29px' }}
              className="prose h600 scroll-auto scroll-styled bg-gray-faint px24 py24 round-r border border--gray-light ml-neg1"
            >
              {this.toReactDOM(state.docBodyText)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
