var React = require('react');
var Api = require('../utils/Api.js');
var MaterialUi = require('material-ui');
var Paper = MaterialUi.Paper;
var MuiContextified = require('./MuiContextified.jsx');
var UpdatePropertyForm = require('./UpdatePropertyForm.jsx');

var OwnerPropertyDetails = React.createClass({
  getInitialState() {
    return {
      photo: '',
      street: '',
      suburb: '',
      postcode: '',
    }
  },

  componentWillMount() {
    var { propertyId } = this.props.params;
    console.log(propertyId);

    Api.getPropertyDetails({
      propertyId,
      callback: (err, response) => {
        if (err) return console.log(err);
        console.log(response.data);
        this.setState(response.data);
      }
    });
  },

  render() {
    var { photo, street, suburb, postcode } = this.state;

    return (
      <div style={style.container}>
        <Paper zIndex={1}>
          <img width={300} src={photo} />
          <div style={style.address}>
            <div>{street} {suburb}, {postcode}</div>
          </div>
          <div style={style.address}>
            <UpdatePropertyForm 
                propertyDetailsUpdated={this.getPropertyDetails} 
                propertyID={this.props.params.propertyId} />
          </div>
        </Paper>
      </div>
    );
  }
});

var style = {
  container: {
    clear: 'both',
    display: 'flex',
  },
  address: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '3em',
  }
}

module.exports = MuiContextified(OwnerPropertyDetails);
