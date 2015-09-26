var React = require('react');
var materialUi = require('material-ui');
var FontIcon = materialUi.FontIcon;
var IconButton = materialUi.IconButton;
var NavigationMenu = materialUi.NavigationMenu;
var Dialog = materialUi.Dialog;
var IconMenu = materialUi.IconMenu;
var MenuItem = require('material-ui/lib/menus/menu-item');
var Api = require('../utils/Api.js');
var User = require('../utils/User.js');
var Navigation = require('react-router').Navigation;

/**
 * Header Component.
 * The header component is the main site header at the top of the view.
 */
var Header = React.createClass({
  mixins: [ Navigation ],

  propTypes: {
    // Callback when the the menu icon is toggled by the user.
    onMenuClick: React.PropTypes.func.isRequired,
    isMenuDocked: React.PropTypes.bool.isRequired,
    isBasic: React.PropTypes.bool, // basic lacks app-like controls.
  },

  getDefaultProps() {
    isBasic: false
  },

  onProfileClick() {
    this.refs.userProfile.show();
  },

  onLogoutClick() {
    Api.logout({
      callback: (err, res) => {
        if (err) {
          // TODO add a UI notification
          console.log('Error logging out');
          return;
        }

        // Remove local user model and redirect.
        User.deleteUser();
        this.transitionTo('/');
      }
    });
  },

  render() {
    var { onMenuClick, isMenuDocked, isBasic } = this.props;

    var menuIcon = null;
    if (!isMenuDocked) {
      menuIcon = (
        <IconButton onClick={onMenuClick}
                    iconClassName="material-icons"
                    iconStyle={styles.icon}>
          menu
        </IconButton>
      )
    }

    if (isBasic) {
      return (
        <div style={styles.header}>
          <div style={styles.logo}>WallFly</div>
        </div>
      );
    } else {
      var settingsIcon = <IconButton iconStyle={styles.icon} iconClassName="material-icons">settings</IconButton>;
      var profileIcon = <IconButton iconStyle={styles.darkIcon} iconClassName="material-icons">account_circle</IconButton>;
      var logoutIcon = <IconButton iconStyle={styles.darkIcon} iconClassName="material-icons">exit_to_app</IconButton>;

      return (
        <div ref="something" style={styles.header}>
          {menuIcon}
          <div style={styles.logo}>WallFly</div>
          {/* TODO add notifications
          <IconButton iconStyle={styles.icon} iconClassName="material-icons">notifications</IconButton> */}
          <IconMenu iconButtonElement={settingsIcon}>
            <MenuItem onClick={this.onProfileClick} leftIcon={profileIcon} primaryText="View Your Profile" />
            <MenuItem onClick={this.onLogoutClick} leftIcon={logoutIcon} primaryText="Logout" />
          </IconMenu>

          <Dialog ref="userProfile" title="Dialog With Standard Actions">
            {/* TODO add a <UserProfile> component */}
          </Dialog>
        </div>
      );
    }
  }
});

var styles = {
  header: {
    // backgroundImage: 'linear-gradient(45deg, #5FCF93, #2ECC71)',
    backgroundColor: '#2ECC71',
    height: 50,
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    flex: 1, // expand to fill available space
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    letterSpacing: -1,
    fontWeight: 900,
    textShadow: '0 1px 1px rgba(0,0,0, .3)',
    textTransform: 'uppercase',
  },
  icon: {
    color: '#fff',
    textShadow: '0 1px 1px rgba(0,0,0, .2)',
  },
  darkIcon: {
    color: '#333',
  }
}

module.exports = Header;
