import React from "react";
import config from "../config.json";

class OfficerPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="ui segment black" style={{ background: "#e6e6ff" }}>
        <img src="assets/jail.png" style={{ top: "-65px", left: "-65px", position: "absolute", zIndex: "5" }}></img>
        <img src="assets/handcuffs.png" style={{ top: "-65px", right: "-65px", position: "absolute", zIndex: "5" }}></img>
        <div className="ui grid">
          <div className="row centered">
            <h2 className="ui header">
              <div className="content">
                <i>Enforcement App</i>
              </div>
              <a onClick={() => this.props.doHint('tollApp')} style={{cursor: "pointer", marginLeft: "10px"}}><i className="info circle icon"></i></a>
            </h2>
          </div>
          <div className="row centered">
            <div className="twelve wide column">
              <div className="ui labeled icon input" style={{width: "80%"}}>
                <div className="ui black label">
                  ...
                </div>
                <input type='text' value={this.state.carAddress} readOnly></input>                
              </div>
              <a onClick={() => this.props.doHint('foo')} style={{ cursor: "pointer", marginLeft: "5px", float: "right" }}><i className="info circle icon"></i></a>              
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OfficerPanel;