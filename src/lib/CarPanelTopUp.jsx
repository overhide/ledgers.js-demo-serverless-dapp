import oh$ from "ledgers.js";
import config from "../config.json";
import {getAdmin, makePretendChallenge,makePretendChallengeAndSign} from "./utils";

import React from "react";

const CENTS_IN_DOLLAR = 100;
const WEI_IN_ETHER = 1000000000000000000;

var doTest = () => {

}

class CarPanelTopUp extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      chosenCurrency: null,
      dollarsEnabled: false,  // OK to transact in dollars?
      ethersEnabled: false,   // OK to transact in ethers?
      prices: {
        zoneA: '',
        zoneB: '',
        zoneC: ''
      },
      payerAddress: {}
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
            this.setState({ ethersEnabled: false, chosenCurrency: this.state.chosenCurrency == 'ethers' ? null : this.state.chosenCurrency }); // wrong testnet
            this.props.setError(`Ethereum testnet misconfig: (backend dictates:${(await getAdmin()).remunerationApiUrl__ethers}) (wallet sets:${uri})`);
            return;
          }
          this.setState({ ethersEnabled: true }); 
        } else {
          this.setState({ ethersEnabled: false, chosenCurrency: this.state.chosenCurrency == 'ethers' ? null : this.state.chosenCurrency }); // no wallet no ether payments
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
            this.setState({ dollarsEnabled: false }); // wrong testnet
            this.props.setError(`overhide-ledger (test) misconfig: backend:${(await getAdmin()).remunerationApiUrl__dollars} wallet:${uri}`);
            return;
          }
          this.setState({ dollarsEnabled: true });
          break;
      }
    };

    /**
     * Update current payer
     */
    oh$.onCredentialsUpdate = async (imparterTag, creds) => {
      let payerAddress = {};
      payerAddress[imparterTag] = creds.address;
      this.setState({payerAddress: {...payerAddress, ...this.state.payerAddress}});
    }

    oh$.setNetwork('ohledger', { currency: 'USD', mode: 'test' }); // dollars in test mode
  }

  componentWillUnmount() {  
  }  

  /**
   * Choose dollars as the currency
   */
  chooseDollars = async () => {    
    this.setState({ 
      chosenCurrency: 'dollars',
      prices: {
        zoneA: `(${(await getAdmin()).zoneA__dollars} dollars)`,
        zoneB: `(${(await getAdmin()).zoneB__dollars} dollars)`,
        zoneC: `(${(await getAdmin()).zoneC__dollars} dollars)`
      }
    });
  }

  /**
   * Choose ethers as the currency
   */
  chooseEthers = async () => {
    this.setState({ 
      chosenCurrency: 'ethers',
      prices: {
        zoneA: `(${(await getAdmin()).zoneA__ethers} ethers)`,
        zoneB: `(${(await getAdmin()).zoneB__ethers} ethers)`,
        zoneC: `(${(await getAdmin()).zoneC__ethers} ethers)`
      }
     })
  }

  /**
   * Do the actual topup
   */
  topup = async (zone) => {
    this.props.setLoading(true);
    switch (this.state.chosenCurrency) {
      case 'dollars':
        var amount = (await getAdmin())[`${zone}__dollars`];
        amount = amount * CENTS_IN_DOLLAR; // need cents
        var imparter = 'ohledger';
        var to = (await getAdmin())[`publicAddress__dollars`];
        await oh$.setCredentials(imparter, { // not using wallet for dollars, just car's Ethereum credentials
          address: this.props.carAddress, 
          secret: this.props.privateKey
        });
        break;
      case 'ethers':
        var amount = (await getAdmin())[`${zone}__ethers`];
        amount = amount * WEI_IN_ETHER; // need wei
        var imparter = 'eth-web3';
        var to = (await getAdmin())[`publicAddress__ethers`];
        break;
    }
    var challenge = makePretendChallenge();    
    try {
      this.props.doHint('topupWalletSign');
      var signature = await oh$.sign(imparter, challenge);
      this.props.doHint('topupWalletPay');
      await oh$.createTransaction(imparter, amount, to);
      this.doTopup(imparter, this.state.payerAddress[imparter], signature, challenge);
    } catch (error) {
      this.props.setError(new String(error));
      this.props.setLoading(false);
    }
  }

  /**
   * Call backend to topup into smart-contract
   * 
   * @param {string} ledgerKey - which ledger to topup
   * @param {string} payerAddress - on the ledger to topup with
   * @param {string} payerSignature - to prove ownership of payerAddress
   * @param {string} signatureChallenge - signed
   */
  doTopup = (ledgerKey, payerAddress, payerSignature, signatureChallenge) => {
    this.props.setLoading(true);
    var carSignature = makePretendChallengeAndSign(this.props.privateKey);
    this.props.doHint('topupWalletAzure');
    fetch(config.topup__AzureURL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        admin: {
          formId: config.admin__FormId,
          contractAddress: config.ethereumContractAddress
        },
        carAddress: this.props.carAddress,
        carSignature: {
          r: carSignature.r,
          s: carSignature.s,
          v: carSignature.v,
          challengeHash: carSignature.messageHash
        },
        payerLedgerKey: ledgerKey,
        payerAddress: payerAddress,
        payerSignature: {
          base64Signature: btoa(payerSignature),
          base64Challenge: btoa(signatureChallenge)
        }
      })
    })
    .then(response => {
      this.props.doHint(null);
      this.props.setLoading(false);
      return;
    })
    .catch(error => { 
      this.props.setLoading(false);
      this.props.setError(error);
      return; 
    });
  }

  render() {
    return (
      <div className="ui grid">
        <div className="row centered">
          <div className="twelve wide column">
            <div className="ui buttons" style={{width: "80%"}}>
              <button className={`ui primary ${this.state.dollarsEnabled ? '' : 'disabled'} button`} onClick={() => this.chooseDollars()}>dollars</button>
              <div className="or"></div>
              <button className={`ui primary ${this.state.ethersEnabled ? '' : 'disabled'} button`} onClick={() => this.chooseEthers()}>ethers</button>
            </div>
            <a onClick={() => doTest()/*this.props.doHint('foo')*/} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>                          
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className={`ui button ${this.state.chosenCurrency ? '' : 'disabled'} fluid`} onClick={() => this.topup('zoneA')} style={{ background: "#ffb3b3" }}>
              topup zone A {this.state.prices.zoneA}
            </button>
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className={`ui button ${this.state.chosenCurrency ? '' : 'disabled'} fluid`} onClick={() => this.topup('zoneB')} style={{ background: "#e6e600" }}>
              topup zone B {this.state.prices.zoneB}
            </button>
          </div>
        </div>
        <div className="row centered twelve wide">
          <div className="twelve wide column">
            <button className={`ui button ${this.state.chosenCurrency ? '' : 'disabled'} fluid`} onClick={() => this.topup('zoneC')} style={{ background: "#ffe4b3" }}>
              topup zone C {this.state.prices.zoneC}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPanelTopUp;