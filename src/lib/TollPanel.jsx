import React from "react";
import {Accounts} from 'web3-eth-accounts';
import config from "../config.json";

let accounts = new Accounts('http://localhost:8545');

class TollPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="ui segment tertiary green" style={{ background: "#ccffcc" }}>
        <div className="ui grid">
          <div className="row centered">
            <div className="twelve wide column">
              <h2 className="ui header">
                <div className="content">
                  <i>Toll Bounty App</i>
                </div>
                <a onClick={() => this.props.doHint('tollApp')} style={{cursor: "pointer", marginLeft: "10px"}}><i className="info circle icon"></i></a>
              </h2>
            </div>
          </div>
          <div className="row centered">
            <div className="twelve wide column">
              <div className="ui labeled icon input" style={{width: "80%"}}>
                <div className="ui label">
                  ...
                </div>
                <input type='text' value={this.state.carAddress} disabled></input>                
              </div>
              <a onClick={() => this.props.doHint('foo')} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>              
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TollPanel;