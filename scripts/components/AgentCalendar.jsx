var React = require('react');
var Radium = require('radium');
var Api = require('../utils/Api.js');
var Moment = require('moment');
var User = require('../utils/User.js');
var MuiContextified = require('./MuiContextified.jsx');
var MaterialUi = require('material-ui');
var smoothScrollTo = require('../utils/smoothScroll.js').smoothScrollTo;

var Toolbar = MaterialUi.Toolbar;
var ToolbarGroup = MaterialUi.ToolbarGroup;
var ToolbarTitle = MaterialUi.ToolbarTitle;
var IconButton = MaterialUi.IconButton;
var List = MaterialUi.List;
var Snackbar = MaterialUi.Snackbar;

var CalendarListDay = require('./CalendarListDay.jsx');

/**
 * AgentCalendar component.
 * Provides a navigatable calendar view for the agent.
 */
var AgentCalendar = React.createClass({
  getInitialState() {
    return {
      month: Moment(),
      events: [],
      responseReceived: false,
      snackbarMsg: '',
      toolbarWidth: '100%',  // determine dynamically on screen resize.
    };
  },

  componentWillMount() {
    this.getEvents();
    window.addEventListener('resize', this.onWindowResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },

  /**
   * Window resize event handler.
   */
  onWindowResize() {
    this.setState({
      toolbarWidth: React.findDOMNode(this.refs.days).clientWidth
    });
  },

  componentDidMount() {
    // The virtual DOM seems to have been rendered at this time, but the changes
    // have not yet been flushed to the DOM, so timeout is required it seems.
    setTimeout(() => {
      this.setState({
        minContainerHeight: this.computeContainerHeight(),
        toolbarWidth: React.findDOMNode(this.refs.days).clientWidth,
      });
    }, 200);
  },

  /**
   * Computes the necessary height of the container, so that 'today' is able
   * to be scrolled to. If there is no 'today', returns 0.
   */
  computeContainerHeight() {
    if (!this.refs.today || !React.findDOMNode(this.refs.today)) return 0;
    var today = React.findDOMNode(this.refs.today);
    return today.offsetTop * 2 + today.offsetHeight;
  },

  /**
   * Scrolls the viewport to the current day.
   */
  scrollToToday() {
    var today = React.findDOMNode(this.refs.today);
    var page =  React.findDOMNode(this.refs.container).parentElement;
    if (!today || !page) return;

    var toolbarHeight = 56;
    var scrollOffset = today.offsetTop - toolbarHeight;
    smoothScrollTo(scrollOffset, page);
  },

  componentDidUpdate(prevProps, prevState) {
    var minContainerHeight = this.computeContainerHeight();

    if (prevState.minContainerHeight !== minContainerHeight) {
      this.setState({
        minContainerHeight: this.computeContainerHeight(),
      }, () => this.scrollToToday());
    } else {
      this.scrollToToday();
    }
  },

  /**
   * Fetch all events for the current user.
   */
  getEvents() {
    var user = User.getUser() || {};

    Api.getAllEvents({
      params: {
        agentId: user.id,
      },
      callback: (err, res) => {
        if (err) {
          console.log(err);
          return;
        }

        this.setState({
          events: res.data,
          responseReceived: true,
        });
      }
    });
  },

  /**
   * Updates the current month to be the prior month.
   */
  getPrevMonth() {
    var newMonth = this.state.month.subtract('1', 'months');
    this.setState({month: newMonth});
  },

  /**
   * Updates the current month to be the next month.
   */
  getNextMonth() {
    var newMonth = this.state.month.add('1', 'months');
    this.setState({month: newMonth});
  },

  /**
   * Updates the current day to todays date.
   */
  getToday() {
    this.setState({month: Moment()});
    this.scrollToToday();
  },

  /**
   * Refreshes the calendar list after a new event has been added and display
   * a snackbar message for the newly added event.
   * @param  {String} snackbarMsg The message to display in the snackbar.
   */
  refresh(snackbarMsg) {
    this.getEvents();
    this.setState({snackbarMsg: snackbarMsg});
    this.refs.snackbar.show();
  },

  /**
   * Takes a list of events, groups the events by day, and produces the new
   * grouped list.
   * @param  {Array} events List of event objects.
   * @return {Array}        List of event objects gropued by day.
   */
  groupByDay(events) {
    var obj = events.reduce((acc, d) => {
      var p = Moment(d.date).format('DD dddd');
      if (!acc[0].hasOwnProperty(p)) acc[0][p] = [];
      acc[0][p].push(d);
      return acc;
    }, [{}])
    .reduce((acc, v) => {
      Object.keys(v).forEach((k) => acc.push({ day: k, events: v[k] }));
      return acc;
    }, []);
    return obj;
  },

  render() {
    // Don't render the calendar till data call is complete
    if (!this.state.responseReceived) return null;

    var { month, events } = this.state;

    // Filter out the loaded months events and group by days
    var filteredRequests = events.filter((event) => Moment(event.date).isSame(month, 'month'));
    var groupedDays = this.groupByDay(filteredRequests);

    var todayHasPassed = false;
    var today = Moment();
    var days = groupedDays.map((day, idx) => {
      var ref = '';
      var date = Moment(day.events[0].date);

      // Treat the first day on or after today's date as 'today' for the
      // purposes of scrolling into view.
      if (!todayHasPassed && !date.isBefore(today, 'day')) {
        ref = 'today';
        todayHasPassed = true;
      }

      // Ensure that if there are no dates in the list on or after today's date
      // we treat the last item in the list as 'today' for scrolling purposes.
      if (!todayHasPassed && idx === groupedDays.length - 1)
        ref = 'today';

      return (
        <div>
          <List
            subheader={day.day}
            subheaderStyle={date.isBefore(today, 'day') ? style.past : style.upcoming }
            ref={ref}>
            <div>
              <CalendarListDay
              dayEvents={day.events}
              refresh={this.refresh} />
            </div>
          </List>
        </div>
      );
    });

    // Toolbar width style needs to be computed dynamically.
    var toolbarStyle = {
      width: this.state.toolbarWidth,
      ...style.toolbar,
    };

    // minContainer height needs to be computed onload.
    var containerStyle = {
      minHeight: this.state.minContainerHeight,
      ...style.container,
    };

    return (
      <div ref="container" style={containerStyle}>
        <Toolbar style={toolbarStyle} ref='toolbar'>
          <ToolbarGroup key={0} float="left">
            <IconButton style={style.arrowButtons}
              onClick={this.getPrevMonth}
              iconClassName="material-icons">keyboard_arrow_left</IconButton>
            <ToolbarTitle style={style.toolbarTitle}
              text={this.state.month.format('MMMM YYYY')} />
            <IconButton style={style.arrowButtons}
              onClick={this.getNextMonth}
              iconClassName="material-icons">keyboard_arrow_right</IconButton>
          </ToolbarGroup>
          <ToolbarGroup key={1} float="right">
            <IconButton style={style.arrowButtons}
              onClick={this.getToday}
              iconClassName="material-icons"
              tooltip="Today">today</IconButton>
          </ToolbarGroup>
        </Toolbar>
        <div style={style.days} ref="days">
          {filteredRequests.length === 0 ?
            <p style={style.noEvents}>No events for this month.</p> :
            <div>{ days }</div>
          }
        </div>
        <Snackbar
          ref="snackbar"
          message={this.state.snackbarMsg}
          autoHideDuration={3000} />
      </div>
    );
  }
});

var style = {
  container: {
    paddingBottom: '3em',
    position: 'relative',
  },
  toolbar: {
    position: 'fixed',
    zIndex: 1,
    background: '#bbb',
    marginTop: '-1em',
  },
  toolbarTitle: {
    paddingRight: '0',
    textAlign: 'center',
    width: '155px',
  },
  arrowButtons: {
    float: 'left',
    width: '56px',
    height: '56px',
  },
  days: {
    paddingTop: '40px',
  },
  noEvents: {
    color: '#ccc',
    fontStyle: 'italic',
  },
  past: {
    fontSize: '1.2em',
    color: '#FFFFFF',
    background: '#ccc',
  },
  upcoming: {
    background: '#2ECC71',
    fontSize: '1.2em',
    color: '#FFFFFF',
  },
};

module.exports = MuiContextified(Radium(AgentCalendar));
