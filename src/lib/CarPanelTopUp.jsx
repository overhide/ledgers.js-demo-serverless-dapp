import oh$ from "ledgers.js";

import React from "react";

class CarPanelTopUp extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="row" style={{ marginTop: "20px" }}>
        <div className="ui grid">
          <div className="eight wide column">
            <h4>topup</h4>
            <div className="ui buttons">
              <button className="ui button">dollars</button>
              <div className="or"></div>
              <button className="ui positive button">ethers</button>
            </div>
          </div>
          <div className="eight wide column">
            <button className="ui button fluid" onClick={this.checkTimeRemaining}>
              topup zone A
            </button>
            <button className="ui button fluid" onClick={this.checkTimeRemaining}>
              topup zone B
            </button>
            <button className="ui button fluid" onClick={this.checkTimeRemaining}>
              topup zone C
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPanelTopUp;