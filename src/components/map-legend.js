import React from 'react';
import PropTypes from 'prop-types';

export default class MapLegend extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    layers: PropTypes.arrayOf(PropTypes.shape({
      layerId: PropTypes.string,
      layerType: PropTypes.string,
      layerColor: PropTypes.string
    })),
    mapLegendId: PropTypes.string.isRequired
  }

  renderItem(layer) {
    return (
      <div key={layer.layerId} className="legend-row">
        <span style={{backgroundColor: layer.layerColor}} className="round inline-block legend-key w24 h12 mr12"></span>
        <span className="legend-description">{layer.layerId}</span>
      </div>
    )
  }

  render() {
    if (!this.mapLegendId)
    return (
      <div id={this.props.mapLegendId}>
        {     
          this.props.layers.map(layer => {
            return this.renderItem(layer);
          })
        }
      </div>
    )
  }
}