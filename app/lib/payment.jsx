"use strict";

class Payment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      carAddress: null
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
        <div class="column">
          <div class="row">
            <h2 class="ui teal header">
                <div class="content">
                    <i>ebc-forms-reactjs</i> demo
                </div>
            </h2>
          </div>
          <div class="row">
            <div class="ui labeled input">
              <div class="ui label">
                Car Address
              </div>
              <input type='text' value={this.state.carAddress} onChange={(event) => this.setState({ carAddress: event.target.value })}></input>              
            </div>
            <button class="ui primary button" style={{ marginLeft: "20px" }} onClick={this.generateNewCar}>
              generate new car
            </button>
          </div>
        </div>
        <div class="row">
        </div>
      </div>
    );
  }
}