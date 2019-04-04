/* global fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';

import {GLBScenegraphLoader, GLTFScenegraphLoader} from '@luma.gl/addons';
import {registerLoaders} from '@loaders.gl/core';

registerLoaders([GLBScenegraphLoader, GLTFScenegraphLoader]);

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';

const DATA_URL = 'https://opensky-network.org/api/states/all';

export const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const DATA_INDEX = {
  ORIGIN_COUNTRY: 2,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  GEO_ALTITUDE: 13,
  POSITION_SOURCE: 16
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    if (!window.demoLauncherActive) {
      this._loadData();
    }
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _loadData() {
    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(resp => {
        if (resp && resp.states) {
          this.setState({data: resp.states});
        }
      });
    //     window.requestAnimationFrame(this._animateData.bind(this));
    //   });
  }

  _animateData() {
    // const {data} = this.state;
    // const now = Date.now();
    // const getSecCeil = ms => Math.ceil(ms / 1000, 10) % SECONDS_PER_DAY;
    // const getSecFloor = ms => Math.floor(ms / 1000, 10) % SECONDS_PER_DAY;
    // const timeWindow = [
    //   getSecCeil(now - TIME_WINDOW * 1000),
    //   getSecFloor(now + TIME_WINDOW * 1000)
    // ];
    // if (data) {
    //   let dataSlice = [];
    //   for (let i = timeWindow[0]; i <= timeWindow[1]; i++) {
    //     if (i >= 0 && i < data.length) {
    //       const slice = data[i].map(val => {
    //         const offset = Math.abs(getSecFloor(now) + (now % 1000) / 1000 - i) / TIME_WINDOW;
    //         // use non-linear function to achieve smooth animation
    //         const opac = Math.cos((offset * Math.PI) / 2);
    //         const color = [...TEXT_COLOR, opac * 255];
    //         return Object.assign({}, val, {color}, {size: 12 * (opac + 1)});
    //       });
    //       dataSlice = [...dataSlice, ...slice];
    //     }
    //   }
    //   this.setState({dataSlice});
    // }
    // this._animationFrame = window.requestAnimationFrame(this._animateData.bind(this));
  }

  _renderLayers() {
    const {data} = this.state;

    if (Array.isArray(data)) {
      return [
        new ScenegraphLayer({
          id: 'scenegraph-layer',
          data,
          pickable: true,
          sizeScale: 10,
          scenegraph:
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
          getPosition: d => [
            d[DATA_INDEX.LONGITUDE] || 0,
            d[DATA_INDEX.LATITUDE] || 0,
            d[DATA_INDEX.GEO_ALTITUDE] || 0
          ],
          getOrientation: d => [0, 90 + (d[DATA_INDEX.TRUE_TRACK] || 0), 90],
          getTranslation: [0, 0, 0],
          getScale: [1, 1, 1]
        })
      ];
    }

    return [];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle={MAPBOX_STYLE}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
