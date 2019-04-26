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
        carAddress: this.props.carAddress,
        contractAddress: config.ethereumContractAddress
      }) 
    })
    .then(response => this.props.setLoading(false))
    .catch(error => { this.props.setLoading(false); this.props.setError(error)});
    return false;
  }

  render() {
    return (
      <div className="ui grid">
        <div className="row centered">
          <div className="twelve wide column">
            <button className="ui primary button" onClick={this.checkTimeRemaining} style={{width: "80%"}}>
              check time remaining
            </button>
            <a onClick={() => this.props.doHint('foo')} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>
          </div>                
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <div className="ui labeled input fluid">
              <div className="ui label" style={{ background: "#ffb3b3"}}>
                Zone A
              </div>
              <input type='text' value={this.state.timeRemaining.zoneA} disabled></input>
            </div>
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <div className="ui labeled input fluid">
              <div className="ui label" style={{ background: "#e6e600" }}>
                Zone B
              </div>
              <input type='text' value={this.state.timeRemaining.zoneB} disabled></input>
            </div>
          </div>            
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <div className="ui labeled input fluid">
              <div className="ui label" style={{ background: "#ffe4b3" }}>
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