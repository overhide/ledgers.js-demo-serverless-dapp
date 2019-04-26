import config from "../config.json";
import {getAdmin} from "./utils";

import React from "react";
import CarPanel from "./CarPanel";
import TollPanel from "./TollPanel";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: true, // as fetching admin first
      hint: null
    };

    this.fetchAdmin();
  }

  // fetch admin from Azure
  fetchAdmin = async () => {
    try {
      await getAdmin()
      this.setState({ loading: false })
    }
    catch(error) {
      this.setState({ error: error, loading: false });
    } 
  }

  // Is there an error?
  //
  // @param {string} value - error value or null
  setError = (value) => {
    console.log('setError() :: ' + value);
    this.setState({ error: value });
  };

  // Is the app re-loading?
  //
  // @param {boolean} value 
  setLoading = (value) => {
    this.setState({ loading: value });
  };

  // Take hint text from *config.json* and display as modal
  //
  // @param {string} which - hint key
  doHint = (which) => {
    this.setState({hint: config.hints[which]});
  }

  render() {
    // report errors
    if (this.state.error) {
      var error = (
        <div className="ui icon red message">
          <i className="exclamation circle icon"></i>
          <i aria-hidden="true" className="close icon" style={{marginRight: "20px"}} onClick={(event) => this.setState({ error: null })}></i>
          <div className="content">
            <div className="header">
              <h5>{this.state.error}</h5>
            </div>
          </div>
        </div>
      );
    }
    // show hints
    if (this.state.hint) {
      var hint = (
        <div className="ui icon blue message">
          <i className="info circle icon"></i>
          <i aria-hidden="true" className="close icon" style={{ marginRight: "20px" }} onClick={(event) => this.setState({ hint: null })}></i>
          <div className="content">
            <div className="header">
              <h5>{this.state.hint}</h5>
            </div>
          </div>
        </div>
      );
    }
    // main UI
    return (
      <div>
        <div className="ui center aligned grid" style={{marginTop:"20px", maxWidth: "1700px", marginRight: "auto", marginLeft: "auto"}}>
          {/* dimmer for whole page */}
          <div className={`ui ${this.state.loading ? "active" : ""} dimmer`}>
            <div className="ui loader"></div>
          </div>
          {/* error banner for whole page */}
          {error}
          {/* hint banner */}
          {hint}
          {/* payment component */}
          <div className="ui grid">
            <div className="three column row">
              <div className="column" style={{minWidth: "420px", maxWidth: "420px", marginBottom: "20px"}}>
                <CarPanel
                  setError={this.setError}
                  setLoading={this.setLoading}
                  doHint={this.doHint} />
              </div>
              <div className="column" style={{background: "grey", minWidth: "420px", minHeight: "420px", marginBottom: "20px"}}>
              </div>
              <div className="column" style={{minWidth: "420px", maxWidth: "420px"}}>
                <TollPanel
                  setError={this.setError}
                  setLoading={this.setLoading}
                  doHint={this.doHint} />
              </div>
            </div>
          </div>            
        </div>
      </div>
    );
  }
}

export default App;