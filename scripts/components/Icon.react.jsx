var React = require('react');

/**
 * Icon Component
 * The icon component is used to render inline SVG icons.
 */
var Icon = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    style: React.PropTypes.object
  },
  getDefaultProps() {
    return {
      size: 24
    };
  },
  _mergeStyles(...args) {
    // This is the m function from "CSS in JS" and can be extracted to a mixin
    return Object.assign({}, ...args);
  },
  renderGraphic() {
    switch (this.props.icon) {
      case 'my-icon':
        return (
          <g><path d="M7.41 7.84l4.59 4.58 4.59-4.58 1.41 1.41-6 6-6-6z"/></g>
        );
      case 'another-icon':
        return (
          <g><path d="M7.41 15.41l4.59-4.58 4.59 4.58 1.41-1.41-6-6-6 6z"/></g>
        );
      // Add more icons here
    }
  },
  render() {
    let styles = {
      fill: "currentcolor",
      verticalAlign: "middle",
      width: this.props.size, // CSS instead of the width attr to support non-pixel units
      height: this.props.size // Prevents scaling issue in IE
    };
    return (
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fit
        style={this._mergeStyles(
          styles,
          this.props.style // This lets the parent pass custom styles
        )}>
          {this.renderGraphic()}
      </svg>
    );
  }
});

module.exports = Icon;
