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
      }
    };
  }

  // initialize state for car.
  generateCar = () => {
    this.props.doHint('welcomeCarApp');
    var account = getNewAccount();
    return {
      carAddress: account.address, // Car's Ethereum address
      privateKey: account.privateKey // Car's private key
    }
  };

  render() {
    return (
      <div className="column eight wide" style={{paddingLeft: "40px"}}>
        <div className="ui segment teal" style={{ background: "#ccffff"}}>
          <div className="row centered">
            <h2 className="ui header">
              <div className="content">
                  <i>Car Top-Up App</i>
              </div>
              <a onClick={() => this.props.doHint('carApp')} style={{cursor: "pointer", marginLeft: "20px", marginRight: "20px"}}><i className="info circle icon"></i></a>
            </h2>
          </div>
          <div className="row centered">
            <div className="ui labeled input fluid">
              <div className="ui label">
                Car Address
              </div>
              <input type='text' value={this.state.carAddress} disabled></input>              
            </div>
          </div>
          <hr/>
          <CarPanelCheck 
            carAddress={this.state.carAddress}
            privateKey={this.state.privateKey}
            setError={this.props.setError}
            setLoading={this.props.setLoading}
            doHint={this.props.doHint} />
          <hr/>
          <CarPanelTopUp
            setError={this.props.setError}
            setLoading={this.props.setLoading}
            doHint={this.props.doHint} />
        </div>
      </div>
    );
  }
}

export default CarPanel;