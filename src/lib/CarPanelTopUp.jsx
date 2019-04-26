import oh$ from "ledgers.js";
import {getAdmin} from "./utils";

import React from "react";

var doTest = () => {

}

class CarPanelTopUp extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dollarsEnabled: false,  // OK to transact in dollars?
      ethersEnabled: false   // OK to transact in ethers?
    };
  }

  componentDidMount() {

    /**
     * Determine if ethers should be enabled based on uri from wallet (versus admin)
     * 
     * Ethers only enabled if wallet, so do everything in 'onWalletChange'
     */
    oh$.onWalletChange = async (imparterTag, isPresent) => {
      if (imparterTag == 'eth-web3') {
        if (isPresent) {
          let uri = oh$.getOverhideRemunerationAPIUri('eth-web3');
          if (uri != (await getAdmin()).remunerationApiUrl__ethers) {
            this.setState({ ethersEnabled: false }); // wrong testnet
            this.props.setError(`Ethereum testnet misconfig: (backend dictates:${(await getAdmin()).remunerationApiUrl__ethers}) (wallet sets:${uri})`);
            return;
          }
          this.setState({ ethersEnabled: true }); 
        } else {
          this.setState({ ethersEnabled: false }); // no wallet no ether payments
        }
      }
      // dollars always available, ethers enabled when network detected below
    };

    /**
     * Determine if dollars should be enabled.  Since we're trying to enable test network right below, we know this will
     * be ran.
     * 
     * No wallet for dollars in this example.
     */
    oh$.onNetworkChange = async (imparterTag, details) => {
      switch (imparterTag) {
        case 'ohledger':
          var uri = details.uri;
          if (uri != (await getAdmin()).remunerationApiUrl__dollars) {
            this.setState({ ethersEnabled: false }); // wrong testnet
            this.props.setError(`overhide-ledger (test) misconfig: backend:${(await getAdmin()).remunerationApiUrl__dollars} wallet:${uri}`);
            return;
          }
          this.setState({ dollarsEnabled: true });
          break;
      }
    };
    oh$.setNetwork('ohledger', { currency: 'USD', mode: 'test' }); // dollars in test mode
  }

  componentWillUnmount() {  
  }  

  render() {
    return (
      <div className="ui grid">
        <div className="row centered">
          <div className="twelve wide column">
            <div className="ui buttons" style={{width: "80%"}}>
              <button className={`ui primary ${this.state.dollarsEnabled ? '' : 'disabled'} button`}>dollars</button>
              <div className="or"></div>
              <button className={`ui primary ${this.state.ethersEnabled ? '' : 'disabled'} button`}>ethers</button>
            </div>
            <a onClick={() => doTest()/*this.props.doHint('foo')*/} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>                          
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className="ui button fluid" onClick={this.checkTimeRemaining} style={{ background: "#ffb3b3" }}>
              topup zone A
            </button>
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className="ui button fluid" onClick={this.checkTimeRemaining} style={{ background: "#e6e600" }}>
              topup zone B
            </button>
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className="ui button fluid" onClick={this.checkTimeRemaining} style={{ background: "#ffe4b3" }}>
              topup zone C
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPanelTopUp;