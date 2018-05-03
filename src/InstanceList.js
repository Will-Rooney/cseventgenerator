import React, { Component } from 'react';
import ToggleButton from 'react-toggle-button';
import IntervalSlider from './IntervalSlider';
import './InstanceList.css';
import Instance from './Instance';

import instanceNames from './instance_list.json'; // load instance_list.json into instanceNames
import runInstanceEvents from './runInstanceEvents.json'; // sample 'runInstance' events
import terminateInstanceEvents from './terminateInstanceEvents.json'; // sample 'terminateInstance' events

import './RangeSlider.css';


class InstanceList extends Component {
	/**
	 * Constructs a new (empty) instance list.
	 * State Params:
	 *	instances: an array containing all instance names
	 *	runningList: an array containing all instance names that are running
	 *	maxInterval: maximum event interval of 10 minutes
	 *	enableInterval: boolean value to enable/disable automatic events
	 *	dev_CSSERVER: a development/debugging boolean variable to switch source server url (dev_serverURL)
	 *
	 */
	constructor(props) {
		super(props);
		this.state = { instances: null, runningList: [], maxInterval: 10, enableInterval: false, dev_CSSERVER: true};
		this.dev_serverURL = 'https://csserverlist.herokuapp.com/';
		this.reqCount = 0;

		this.fetchList = this.fetchList.bind(this);
		this.updateInterval = this.updateInterval.bind(this);
		this.runInstances = this.runInstances.bind(this);
		this.terminateInstances = this.terminateInstances.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		this.dev_switchServers = this.dev_switchServers.bind(this);
	}
	/**
	 * Pre:
	 *	The component will mount.
	 *	The react generated html displays 'Loading' to the user.
	 * Post:
	 *	Before the component mounts a call to fetchList() executes.
	 * 	fetchList() sends an HTTP GET to the dev_serverURL to populate
	 * 	the run status of each instance contained in instanceNames.
	 *	Finally, the state of instance names is set from a list obtained
	 *	from instance_list.json
	 */
	componentWillMount() {
		this.fetchList();
		// Wait 100 ms and populate instance list
		setTimeout(function() {this.setState({ instances: instanceNames });}.bind(this), 100);
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	The state of instance names has been set.
	 * Post:
	 *	A call to fetchList() executes every 30 seconds.
	 * 	fetchList() sends an HTTP GET to the dev_serverURL to populate
	 * 	the run status of each instance contained in instanceNames.
	 */
	componentDidMount() {
		// Send HTTP GET to server to find running instances
		// Check for status updates every 1 minute(s)
		setInterval(function() { 
			this.fetchList();
		}.bind(this), 30000);
	}
	/**
	 * Post:
	 *	Renders a table of each instance and its corresponding
	 *	properties and functionality. Global controls are
	 *	rendered outside of the table to modify automatic
	 *	event settings and to run/terminate all instances.
	 *
	 * return: html for an <InstanceList />
	 */
	render() {
		if (!this.state.instances) {
			//this.runningList = fetchList();
			return (
				<div>
					Loading...
				</div>
				);
		}
		// Render a table to hold all of our instances
		return (
			<div className="InstanceList">
				<table align='right'>
					<tbody>
						<tr>
							<td align='right' style={{fontWeight:'bold'}}>Enable/Disable Automatic Events:</td>
							<td>
								<ToggleButton
									thumbStyle={{ borderRadius: 0 }}
									trackStyle={{ borderRadius: 0 }}
									value={this.state.enableInterval}
									onToggle={ (value) => {
										this.setState({ enableInterval: !value });
									}}/>
							</td>
							<td align='right' style={{fontWeight:'bold'}}>&emsp;Maximum Event Interval ({this.state.maxInterval} minutes):</td>
							<td width="25%"><IntervalSlider updateInterval={this.updateInterval}/></td>
						</tr>
					</tbody>
				</table>
				<span>
				<button className="Run" onClick={this.runInstances}>Run All</button>
				<button className="Terminate" onClick={this.terminateInstances}>Terminate All</button>
				<button className="Terminate" style={{'display': 'none'}} onClick={this.dev_switchServers}>Toggle Server: csserverlist - {this.dev_serverURL}</button>
				</span>
				<table id="InstanceTable">
					<tbody>
						<tr>
							<th>Instance</th>
							<th>Run Status</th>
							<th>Run/Terminate</th>
							<th>Event Interval</th>
							<th>Event Response</th>
							<th>Event Count</th>
						</tr>
						{this.renderInstances()}
					</tbody>
				</table>
			</div>
		);
	}
	/**
	 * Pre:
	 *	renderInstances() called from render()
	 * Post:
	 *	Maps each instance from the state of instances
	 *	to create an array containing <Instance /> objects.
	 *	Props are passed to <Instance /> which in turn renders
	 * 	the html for each row in the instance table. 
	 *
	 * return: array Array of <Instance/> objects.
	 */
	renderInstances() {
		// Map our instance names from our list of instances to the Instance object
		return this.state.instances.map(name => (
			<Instance
				key={name}
				name={name}
				status={this.getStatus(name)}
				enableReq={this.state.enableInterval}
				maxInterval={this.state.maxInterval}
				fetchList={this.fetchList}
				parentReqCount={this.reqCount}
				dev_CSSERVER={this.state.dev_CSSERVER}
			/>
		));
	}
	/**
	 * Post:
	 *	Checked the class state for running instances.
	 *
	 * param: name The name of the instance that is checked against the list of running instances.
	 * return: status The status of the instance, either unavailable, running, or stopped.
	 */
	getStatus(name) {
		// GET request failed -- server is down
		if (this.state.runningList.length > 0 && this.state.runningList[0] === 'Unavailable') {
			return 'Unavailable';
		}
		// GET request succeeded -- server is up and run statuses have been retreived
		for (var i=0; i < this.state.runningList.length; i++) {
			if (name === this.state.runningList[i]) {
				return 'Running';
			}
		}
		return 'Stopped';
	}
	/**
	 * Issues an HTTP GET requests to the route 'getml' from dev_serverURL
	 *
	 * Post:
	 *	If the request is succesful then the class state of running instances is updated
	 *	If the request fails then the class state of running instances is set to 'Unavailable'
	 */
	fetchList() {
		var list = [];
		fetch(this.dev_serverURL + 'getml')
			.then(function(response) {
				return response.json();
			}).then(function(json) {
				var data = json['list']
				if (!this.state.dev_CSSERVER) {
					data = json; 
				}
				for (var i=0; i < data.length; i++) {
					if (data[i]['Name']) {
						list.push(data[i]['Name']);
					}
					else {
						console.log('Invalid GET response');
					}
				}
				return list;
		}.bind(this)).then(function(list) {
			this.setState({ runningList: list});
		}.bind(this)).catch(function(e) {
			console.log('Failed to Parse Response',e);
			this.setState({ runningList: ['Unavailable']});
		}.bind(this));
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	The react-interval-slider is rendered.
	 *	The user has modified the interval-slider via UI
	 * Post:
	 *	Upon mouse release, the new interval slider value is used to set the state of maxInterval
	 *
	 * param: value (double) The maximum event interval set using the react-interval-slider from the web-application
	 */
	updateInterval(value) {
		this.setState({ maxInterval: value });
		//this.render();
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	'Run All Instances' button is rendered.
	 *	The user has clicked the button
	 * Post:
	 *	A HTTP POST request is sent to 'dev_serverURL/dataurl' containing a runInstance event
	 */
	runInstances() {
 		// Send POST HTTP Request if instance data found
		if (!(runInstanceEvents === null)) {
			this.sendRequest("POST", "dataurl", runInstanceEvents);
		}
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	'Terminate All Instances' button is rendered.
	 *	The user has clicked the button
	 * Post:
	 *	A HTTP DELETE request is sent to 'dev_serverURL/deleteurl' containing a terminateInstance event
	 */
	terminateInstances() {
		// Send DELETE HTTP request if instance data found
		if (!(terminateInstanceEvents === null)) {
			this.sendRequest("DELETE", "deleteurl", terminateInstanceEvents);
		}
	}
	/**
	 * Pre:
	 *	Call to runInstances() or terminateInstances().
	 * Post:
	 *	A run or terminate event (for all instances) has been sent to the server,
	 *	then the run status of each instance is updated by a call to fetchList()
	 *
	 * param: method The HTTP method used (POST or DELETE)
	 * param: route The route used on the server ('/dataurl' or '/deleteurl')
	 * param: data The sample run/terminate events data
	 */
	sendRequest(method, route, data) {
		// Send POST/DELETE to url with data
		fetch(this.dev_serverURL+route, {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(function(response) {
			// Succesful request - update req response status and instance run status
			console.log(response.status+' - '+response.statusText);
			this.reqCount++;
			this.fetchList();
		}.bind(this), function(error) {
			// Error in request - display error under req response
			console.log(error.message);
		});
	}
	/**
	 * Pre:
	 *	The development toggle for switching servers has been manually triggered
	 *	via a web browser. The toggle html is rendered but defaults to be hidden.
	 * Post:
	 *	The development server has been switched between cmwserver and csserverlist heroku apps.
	 *	That is dev_serverURL is switched between 'https://cmwserver.herokuapp.com/' and 'https://csserverlist.herokuapp.com/'
	 *	A call to fetchList() updates the run statuses from the new server
	 */
	dev_switchServers() {
		if (this.state.dev_CSSERVER)
			this.dev_serverURL = 'https://cmwserver.herokuapp.com/'
		else {
			this.dev_serverURL = 'https://csserverlist.herokuapp.com/'
		}
		this.setState({dev_CSSERVER: !this.state.dev_CSSERVER});
		this.fetchList();
	}
}

export default InstanceList;
