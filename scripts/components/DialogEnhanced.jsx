var React = require('react');
var mui = require('material-ui');
var Dialog = mui.Dialog;
var MuiContextified = require('./MuiContextified.jsx');

/**
 * DialogEnhanced wraps the material-ui Dialog component, so that the visibility
 * of the component can be configured via props. The default Dialog requires
 * making awful imperative calls to alter the state. This completely breaks
 * React's strong composition model.
 *
 * Any prop you can pass to Dialog can also be passed to DialogEnhanced as it
 * will be delegated to the Dialog component it composes.
 */
var DialogEnhanced = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
  },

  componentDidMount() {
    if (this.props.isOpen) this.refs.dialog.show();
  },

  componentWillReceiveProps(props) {
    // Adapt prop-based configuration into material-uis awful imperative api.
    if (this.refs.dialog) {
      if (props.isOpen) {
        this.refs.dialog.show();
      } else {
        this.refs.dialog.dismiss();
      }
    }
  },

  render() {
    var { isOpen, children, ...others } = this.props;
    return (
      <Dialog ref="dialog" {...others}>
        {children}
      </Dialog>
    );
  }
});

module.exports = MuiContextified(DialogEnhanced);
