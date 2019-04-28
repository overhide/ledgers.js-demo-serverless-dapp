import {getNewAccount} from "./utils";

import React from "react";
import CarPanelCheck from "./CarPanelCheck";
import CarPanelTopUp from "./CarPanelTopUp";

class CarPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ...this.generateCar(),
      timeRemaining: {
        zoneA: 'none',
        zoneB: 'none',
        zoneC: 'none'
      }, 
      loading: false,
      checkTimeRemainingFn: null
    };
  }

  // initialize state for car.
  generateCar = () => {
    var account = getNewAccount();
    this.props.carAddressSetterFn(account.address);
    return {
      carAddress: account.address, // Car's Ethereum address
      privateKey: account.privateKey // Car's private key
    }
  };

  // Is the app loading?
  //
  // @param {boolean} value 
  setLoading = (value) => {
    this.setState({ loading: value });
  };

  // @param {} fn - to be called whenever we want to re-check time remaining in zones
  setCheckTimeRemainingFn = (fn) => {
    this.setState({ checkTimeRemainingFn: fn});
  }

  render() {
    return (
      <div className={`ui segment ${this.state.loading ? "loading" : ""} black`}>
        <img src="assets/steering.png" style={{top:"5px", left:"5px", width:"50px", position:"absolute",zIndex:"5"}}></img>
        <div className="ui grid">
          <div className="row centered">
            <h2 className="ui header">
              <div className="content">
                  <i>Car Top-Up App</i>
              </div>
              <a onClick={() => this.props.doHint('carApp')} style={{cursor: "pointer", marginLeft: "10px"}}><i className="info circle icon"></i></a>
            </h2>
          </div>
          <div className="row centered">
            <div className="column sixteen wide">
              <div className="ui labeled input fluid">
                <div className="ui black label">
                  Car Address
                </div>
                <input type='text' value={this.state.carAddress} style={{backgroundColor: "#F0F0F0"}} readOnly ></input>              
              </div>
            </div>              
          </div>
          <div className="row centered">
            <div className="column sixteen wide">
              <div className="ui segment">
                <CarPanelCheck 
                  carAddress={this.state.carAddress}
                  privateKey={this.state.privateKey}
                  setError={this.props.setError}
                  setLoading={this.setLoading}
                  doHint={this.props.doHint}
                  setCheckTimeRemainingFn={this.setCheckTimeRemainingFn} />
              </div>
            </div>
          </div>
          <div className="row centered">
            <div className="column sixteen wide">
              <div className="ui segment">
                <CarPanelTopUp
                  carAddress={this.state.carAddress}
                  privateKey={this.state.privateKey}
                  setError={this.props.setError}
                  setLoading={this.setLoading}
                  doHint={this.props.doHint}
                  checkTimeRemaining={this.state.checkTimeRemainingFn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPanel;