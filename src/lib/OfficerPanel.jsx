import React from "react";
import config from "../config.json";

const zoneToIndexMap = { 'A': 0, 'B': 1, 'C': 2 };

class OfficerPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      message: 'idle',
      loading: false,
      log: `waiting for car report\n...will come in via Ethereum event\n...we'll read it from Azure.`
    };
  }

  // Is the app loading?
  //
  // @param {boolean} value 
  setLoading = (value) => {
    this.setState({ loading: value });
  };

  // add a log line
  log = (line) => {
    this.setState({ log: `${line}\n${this.state.log}` });
  }

  componentDidMount() {
    setInterval(this.poll, 5000); // poll for events every 5 seconds
  }

  /**
   * Poll for dispatch events from Azure
   */
  poll = async () => {
    this.setState({message: 'polling for dispatches'});
    try {
      let result = await fetch(config.poll__AzureURL, {
        method: "GET",
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
      .then(response => {
        if (response.status == 200) {
          return response.json()
        } else {
          return result.text().then(error => { throw error });
        }
      });
      if (result.forCar) {
        this.ticket(result.forCar, result.carXCoordinate, result.carYCoordinate, result.zoneIndex);
        this.props.enforcementCoordsSetterFn(result.carXCoordinate, result.carYCoordinate);
      }
    } catch (e) {
      this.props.setError(new String(e));
    }

    this.setState({message: 'idle'});
  };

  /**
   * Issue ticket or collect stake.
   */
  ticket = async (reportedCar, reportedX, reportedY, reportedZoneIndex) => {
    this.setState({message: 'responding to dispatch'});
    this.log(`driving to (${reportedX},${reportedY})`);
    setTimeout(() => {
      if (!this.props.carCoords) {
        this.log(`bad dispatch at (${reportedX},${reportedY})`);
        return;
      }
      let zoneIndex = zoneToIndexMap[this.props.carCoords.zone];
      if (this.props.carCoords.x == reportedX
          && this.props.carCoords.y == reportedY
          && zoneIndex == reportedZoneIndex
          && reportedCar == this.props.carAddress) {
        this.log(`good dispatch at (${reportedX},${reportedY})`);
        return;
      } else {
        this.log(`bad dispatch at (${reportedX},${reportedY})`);
        return;
      }
      this.setState({ message: 'idle' });      
    }, config.animationTimeSeconds * 1000);
  }

  /**
   * Run admin workflow on Azure.
   */
  admin = async () => {
    this.setLoading(true);
    try {
      this.log('calling admin workflow on Azure');
      let result = await fetch(config.admin__AzureURL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          contractAddress: config.ethereumContractAddress
        })
      })
      .then(response => {
        if (response.status == 200) {
          return response.json()
        } else {
          return result.text().then(error => { throw error });
        }
      });
      this.log('# cars before cleanup: ' + result.beforeNumCars);
      this.log('# reports before cleanup: ' + result.beforeNumReports);
      this.log('# cars after cleanup: ' + result.afterNumCars);
      this.log('# reports after cleanup: ' + result.afterNumReports);
    } catch (e) {
      this.props.setError(new String(e));
    }

    this.setLoading(false);
    this.props.doHint(null);
  };

  render() {
    return (
      <div className={`ui segment ${this.state.loading ? "loading" : ""} black`} style={{ background: "#e6e6ff" }}>
        <img src="assets/handcuffs.png" style={{ top: "5px", right: "5px", width:"50px", position: "absolute", zIndex: "5" }}></img>
        <div className="ui grid">
          <div className="row centered">
            <h2 className="ui header">
              <div className="content">
                <i>Enforcement App</i>
              </div>
              <a onClick={() => this.props.doHint('enforcementApp')} style={{cursor: "pointer", marginLeft: "10px"}}><i className="info circle icon"></i></a>
            </h2>
          </div>
          <div className="row centered">
            <div className="twelve wide column">
              <div className={`ui input`} style={{ width: "90%" }}>
                <input type="text" className="readOnly" value={this.state.message} onChange={() => { }}></input>
              </div>
              <a onClick={() => this.props.doHint('enforcementApp')} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>
            </div>
          </div>
          <div className="row centered">
            <div className="twelve wide column">
              <div className={`ui primary button`} style={{ width: "90%" }} onClick={() => this.admin()}>
                admin90%
              </div>
              <a onClick={() => this.props.doHint('enforcementApp')} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>              
            </div>
          </div>
          <div className="row centered">
            <div className="twelve wide column">
              <textarea rows="10" readOnly style={{ width: "100%", fontFamily: "monospace", fontSize: "x-small" }} value={this.state.log} onChange={() => { }}></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OfficerPanel;