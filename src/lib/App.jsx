import config from "../config.json";
import {getAdmin} from "./utils";

import React from "react";
import CarPanel from "./CarPanel";
import TollPanel from "./TollPanel";
import OfficerPanel from "./OfficerPanel";
import MapPanel from "./MapPanel";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: true, // as fetching admin first
      hint: null,
      atCar: false,
      carAddress: null,
      hunterCoords: {x: null, y: null},
      hunterZone: null
    };

    this.fetchAdmin();
  }

  // fetch admin from Azure
  fetchAdmin = async () => {
    try {
      await getAdmin()
      this.setState({ loading: false })
    }
    catch(error) {
      this.setState({ error: error, loading: false });
    } 
  }

  // Is there an error?
  //
  // @param {string} value - error value or null
  setError = (value) => {
    console.log('display error :: ' + value);
    this.setState({ error: value });
  };

  // Take hint text from *config.json* and display as modal
  //
  // @param {string} which - hint key
  doHint = (which) => {
    if (which) {
      console.log('displaying hint :: ' + config.hints[which]);
      this.setState({hint: config.hints[which]});
    } else {
      console.log('clearing hint');
      this.setState({ hint: null });
    }
  }

  setCarAddress = (address) => {
    this.setState({carAddress: address});
  };

  setAtCar = (flag) => {
    this.setState({atCar: flag});
  }

  setHunterCoords = (x, y) => {
    this.setState({hunterCoords: {x: x, y: y}});
  }

  setHunterZone = (zone) => {
    this.setState({hunterZone: zone});
  }

  render() {
    // report errors
    if (this.state.error) {
      var error = (
        <div className="ui icon red message">
          <i className="exclamation circle icon"></i>
          <i aria-hidden="true" className="close icon" style={{marginRight: "20px"}} onClick={(event) => this.setState({ error: null })}></i>
          <div className="content">
            <div className="header">
              <h5>{this.state.error}</h5>
            </div>
          </div>
        </div>
      );
    }
    // show hints
    if (this.state.hint) {
      var hint = (
        <div className="ui icon blue message">
          <i className="info circle icon"></i>
          <i aria-hidden="true" className="close icon" style={{ marginRight: "20px" }} onClick={(event) => this.setState({ hint: null })}></i>
          <div className="content">
            <div className="header">
              <h5>{this.state.hint}</h5>
            </div>
          </div>
        </div>
      );
    }
    // main UI
    return (
      <div>
        <div className="ui center aligned grid" style={{marginTop:"20px", maxWidth: "1700px", marginRight: "auto", marginLeft: "auto"}}>
          {/* dimmer for whole page */}
          <div className={`ui ${this.state.loading ? "active" : ""} dimmer`}>
            <div className="ui loader"></div>
          </div>
          <div style={{position: "absolute", top: "5px", left: "10%", width: "80%", zIndex: "10", opacity: "0.8"}}>
            {/* error banner for whole page */}
            {error}
            {/* hint banner */}
            {hint}
            {/* payment component */}
          </div>
          <div className="ui grid">
            <div className="row" style={{height: "30px"}}>
            </div>
            <div className="three column row">
              <div className="column" style={{minWidth: "550px", maxWidth: "550px", marginBottom: "20px", marginTop: "65px"}}>
                <div style={{ minWidth: "420px", maxWidth: "420px", margin: "auto" }}>
                  <CarPanel
                    setError={this.setError}
                    doHint={this.doHint}
                    carAddressSetterFn={this.setCarAddress} />
                </div>
              </div>
              <div className="column" style={{minWidth: "462px", maxWidth: "462px", minHeight: "528px", marginBottom: "20px", marginLeft: "10px", marginRight: "10px", padding: "0px"}}>
                <MapPanel
                  setError={this.setError}
                  doHint={this.doHint}
                  atCarSetterFn={this.setAtCar}
                  hunterCoordsSetterFn={this.setHunterCoords}
                  hunterZoneSetterFn={this.setHunterZone} />
              </div>
              <div className="column" style={{ minWidth: "550px", maxWidth: "550px", marginTop: "65px"}}>
                <div style={{ minWidth: "420px", maxWidth: "420px", margin: "auto" }}>
                  <TollPanel
                    setError={this.setError}
                    doHint={this.doHint}
                    atCar={this.state.atCar}
                    carAddress={this.state.carAddress}
                    hunterCoords={this.state.hunterCoords}
                    hunterZone={this.state.hunterZone} />
                </div>
                <div style={{ minWidth: "420px", maxWidth: "420px", margin: "auto", marginTop: "105px" }}>
                  <OfficerPanel
                    setError={this.setError}
                    doHint={this.doHint} />
                </div>
              </div>
            </div>
          </div>            
        </div>
      </div>
    );
  }
}

export default App;