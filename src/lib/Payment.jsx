import React from "react";
import oh$ from "ledgers.js";

class Payment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      carAddress: undefined
    };
  }

  generateNewCar = () => {
    this.props.generateNewCar();
    this.props.setError('no app#generteNewCar implementation');
  };

  // 
  set = () => {
    this.props.setLoading(true);
    fetch(this.props.postUrl, { 
      method: "POST", 
      headers: { "Content-Type": "application/json; charset=utf-8" }, 
      body: JSON.stringify({ lastWord: this.state.lastWordWritten }) 
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
      <div>
        <div className="column">
          <div className="row">
            <h2 className="ui teal header">
              <div className="content">
                    <i>ebc-forms-reactjs</i> demo
                </div>
            </h2>
          </div>
          <div className="row">
            <div className="ui labeled input">
              <div className="ui label">
                Car Address
              </div>
              <input type='text' value={this.state.carAddress} onChange={(event) => this.setState({ carAddress: event.target.value })}></input>              
            </div>
            <button className="ui primary button" style={{ marginLeft: "20px" }} onClick={this.generateNewCar}>
              generate new car
            </button>
          </div>
        </div>
        <div className="row">
        </div>
      </div>
    );
  }
}

export default Payment;