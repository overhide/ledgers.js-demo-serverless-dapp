import React from "react";
import Payment from "./Payment";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: false
    };
  }

  // Is there an error?
  //
  // @param {string} value - error value or null
  setError = (value) => {
    this.setState({ error: value });
  };

  // Is the app re-loading?
  //
  // @param {boolean} value 
  setLoading = (value) => {
    this.setState({ loading: value });
  };

  generateNewCar = () => {
    console.log('generateNewCar :: app#generteNewCar');
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
    // main UI
    return (
      <div>
        <div className="ui middle aligned center aligned grid" style={{marginTop:"20px"}}>
          {/* dimmer for whole page */}
          <div className={`ui ${this.state.loading ? "active" : ""} dimmer`}>
            <div className="ui loader"></div>
          </div>
          {/* error banner for whole page */}
          {error}
          {/* payment component */}
          <Payment 
            postUrl={this.props.postUrl} 
            getUrl={this.props.getUrl} 
            setError={this.setError}
            setLoading={this.setLoading}
            generateNewCar={this.generateNewCar}/>
        </div>
      </div>
    );
  }
}

export default App;