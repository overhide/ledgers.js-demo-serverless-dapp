import config from "../config.json";
import {makePretendChallengeAndSign} from "./utils";

import React from "react";

class CarPanelCheck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      timeRemaining: {
        zoneA: 'none',
        zoneB: 'none',
        zoneC: 'none'
      }
    };
  }

  checkTimeRemaining = () => {
    this.props.setLoading(true);
    var signature = makePretendChallengeAndSign(this.props.privateKey);
    fetch(config.getTimeRemaining__AzureURL, { 
      method: "POST", 
      headers: { "Content-Type": "application/json; charset=utf-8" }, 
      body: JSON.stringify({ 
        formId: config.admin__FormId,
        challengeHash: signature.messageHash,
        r: signature.r,
        s: signature.s,
        v: signature.v,
        carAddress: this.state.carAddress
      }) 
    })
    .then(response => this.props.setLoading(false))
    .catch(error => { this.props.setLoading(false); this.props.setError(error)});
    return false;
  }

  render() {
    return (
      <div className="row" style={{marginTop: "20px"}}>
        <div className="ui grid">
          <div className="six wide column">
            <div className="ui buttons fluid">
              <button className="ui icon blue button" onClick={() => this.props.doHint('foo')} style={{ cursor: "pointer" }}><i className="info white icon"></i></button>
              <button className="ui button" onClick={this.checkTimeRemaining}>
                check<br />time<br/>remaining
              </button>
            </div>
          </div>                
          <div className="ten wide column">
            <div className="ui labeled input fluid">
              <div className="ui label">
                Zone A
              </div>
              <input type='text' value={this.state.timeRemaining.zoneA} disabled></input>
            </div>
            <div className="ui labeled input fluid">
              <div className="ui label">
                Zone B
              </div>
              <input type='text' value={this.state.timeRemaining.zoneB} disabled></input>
            </div>
            <div className="ui labeled input fluid">
              <div className="ui label">
                Zone C
              </div>
              <input type='text' value={this.state.timeRemaining.zoneC} disabled></input>
            </div>
          </div>            
        </div>            
      </div>
    );
  }
}

export default CarPanelCheck;