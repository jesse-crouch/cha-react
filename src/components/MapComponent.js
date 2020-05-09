import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {}
    };
  }
  onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }
  render() {
    if (!this.props.google) {
      return <div>Loading...</div>;
    }

    return (
      <div
        style={{
          position: "relative",
          height: "300px",
          border: '1.5px solid black'
        }}
      >
        <Map style={{}} google={this.props.google} initialCenter={{
            lat: 42.7967432,
            lng: -81.1635149
          }} zoom={14}>
          <Marker
            onClick={this.onMarkerClick}
            name={"Cosgrove Hockey Academy"}
          />
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
          >
            <div>
              <h1>{this.state.selectedPlace.name}</h1>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: "AIzaSyD3Hy_Co6AEJlrT25WaaBDbJ3zmsrIwHw4",
  v: "3.30"
})(MapContainer);