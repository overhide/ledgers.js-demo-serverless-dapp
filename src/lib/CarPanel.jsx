import React from "react";
import {Accounts} from 'web3-eth-accounts';
import oh$ from "ledgers.js";
import config from "../config.json";

let accounts = new Accounts('http://localhost:8545');

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
    var account = accounts.create();
    return {
      carAddress: account.address, // Car's Ethereum address
      privateKey: account.privateKey // Car's private key
    }
  };

  // @returns {messageHash, r, s, v} of signed (make pretend) challenge
  makePretendChallengeAndSign = () => {
    var challenge = new String(new Date() / 1000) // make pretend challenge
    var {messageHash, r, s, v} = accounts.sign(challenge, this.state.privateKey);
    v = parseInt(v);
    return {messageHash, r, s, v};
  }

  checkTimeRemaining = () => {
    this.props.setLoading(true);
    var signature = this.makePretendChallengeAndSign();
    fetch(config.getTimeRemainingAzureLogicAppURL, { 
      method: "POST", 
      headers: { "Content-Type": "application/json; charset=utf-8" }, 
      body: JSON.stringify({ 
        formId: config.microsoftFormsConfigFormId,
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

  // 
  get = () => {
    this.props.setLoading(true);
    fetch(this.props.getUrl, { 
      method: "GET", 
      headers: { "Content-Type": "application/json; charset=utf-8" }
    })
    .then(result => result.text())
    .then(result => { this.props.setLoading(false);})
    .catch(error => { this.props.setLoading(false); this.props.setError(error) });
    return false;
  }

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
          <hr/>
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
        </div>
      </div>
    );
  }
}

export default CarPanel;