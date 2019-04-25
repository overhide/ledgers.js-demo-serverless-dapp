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
      <div className="column eight wide" style={{paddingRight: "40px"}}>
        <div className="ui segment tertiary green" style={{ background: "#ccffcc"}}>
          <div className="row centered">
            <h2 className="ui header">
              <div className="content">
                <i>Toll Bounty App</i>
              </div>
              <a onClick={() => this.props.doHint('tollApp')} style={{cursor: "pointer", marginLeft: "20px", marginRight: "20px"}}><i className="info circle icon"></i></a>
            </h2>
          </div>
          <div className="row centered">
            <div className="ui labeled icon input fluid">
              <div className="ui label">
                ...
              </div>
              <input type='text' value={this.state.carAddress} disabled></input>
              <button className="ui icon blue button" onClick={() => this.props.doHint('foo')} style={{ cursor: "pointer" }}><i className="info white icon"></i></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TollPanel;