import React, { Component } from 'react';
import './Instance.css'
import runInstanceEvents from './runInstanceEvents.json';
import terminateInstanceEvents from './terminateInstanceEvents.json';
import 'whatwg-fetch' // https://github.com/github/fetch

class Instance extends Component {
	/**
	 * Constructs a new instance.
	 * State Params:
	 *	reqStatus: status of the last HTTP POST/DELTE (run/terminate) event call
	 *	reqCount: Number of HTTP requests for individual instance since inital render
	 *	interval: (prop) If automatic events is enabled then HTTP requests fire at an 'interval' (minutes)
	 *
	 */
	constructor(props) {
		super(props);

		this.state = { reqStatus: 'No requests have been made', reqCount: 0, interval: Math.floor(Math.random()*((this.props.maxInterval*60*1000)-60000+1)+60000) };

		this.dev_serverURL = 'https://csserverlist.herokuapp.com/'
		
		// Bind 'this' to our functions
		this.runInstance = this.runInstance.bind(this);
		this.terminateInstance = this.terminateInstance.bind(this);
		this.getInstance = this.getInstance.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		this.getIntervalText = this.getIntervalText.bind(this);

		// Store Instance Properties
		this.runInstanceEvent = this.getInstance(runInstanceEvents);
		this.terminateInstanceEvent = this.getInstance(terminateInstanceEvents);
	}
	/**
	 * Pre:
	 *	The component did mount.
	 * Post:
	 *	Interval 1 (Repeats every this.state.interval minutes):
	 *		Checks props to see if automatic requests are enabled and
	 *		if the state.interval has been reached then a run/terminate
	 *		instance request has been sent to the server.
	 *	Interval 2 (Repeats every second):
	 *		Checks props to see if the maximum interval has changed.
	 *		If the interval has changed then the random interval
	 *		is regenerated using a minimum of 1 minute and the maximum interval
	 *		to create the new interval (minutes)
	 */
	componentDidMount() {
		/* Interval 1 */
		// Create an interval ([1,this.state.interval] minutes) for which a request will fire
		// Each instance is initialized with a random interval
		// The choice between a run or terminate call is based on run status
		// console.log('Instance interval:'+((this.interval/1000)/60).toFixed(2)+' minutes');
		setInterval(function() { 
			if (this.props.enableReq) {
				if (this.props.status === 'Stopped')
					this.runInstance();
				else
					this.terminateInstance();
			}
		}.bind(this), this.state.interval);

		/* Interval 2 */
		// Check For Interval changes
		var old_interval = this.props.maxInterval;
		var old_parentReqCount = this.props.parentReqCount;
		setInterval(function() { 
			if (old_interval !== this.props.maxInterval) {
				this.setState({ interval: Math.floor(Math.random()*((this.props.maxInterval*60*1000)-60000+1)+60000) });
				old_interval = this.props.maxInterval;
			}
			if (!this.props.dev_CSSERVER)
				this.dev_serverURL = 'https://cmwserver.herokuapp.com/'
			else
				this.dev_serverURL = 'https://csserverlist.herokuapp.com/'
			if (old_parentReqCount < this.props.parentReqCount) {
				this.setState({ reqCount: this.state.reqCount + (this.props.parentReqCount - old_parentReqCount)});
				old_parentReqCount = this.props.parentReqCount;
			}
		}.bind(this), 1000);
	}
	/**
	 * Post:
	 *	Renders the instance and its corresponding
	 *	properties and functionality.
	 *
	 * return: html for an <Instance /> object.
	 */
	render() {
		return (
			// For each instance - add a new entry to our table
			<tr className="Instance">
				<td>{this.props.name}</td>
				<td>{this.props.status}</td>
				<td>
					<button className="Run" onClick={this.runInstance}>Run</button>
					<button className="Terminate" onClick={this.terminateInstance}>Terminate</button>
				</td>
				<td>{this.getIntervalText()}</td>
				<td>{this.state.reqStatus}</td>
				<td>{this.state.reqCount}</td>
			</tr>
		);
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	The Instance table data has been rendered
	 *	The user has clicked the run instances button
	 * Post:
	 *	A HTTP POST request is sent to 'dev_serverURL/dataurl' containing a runInstance event
	 *	In the case that the sample event data cannot be found - the error is displayed
	 */
	runInstance() {
 		// Send POST HTTP Request if instance data found
		if (!(this.runInstanceEvent === null)) {
			this.sendRequest("POST","RunInstances", "dataurl", this.runInstanceEvent);
		}
		else {
			this.setState({ reqStatus: 'Error - No Event Data Exists'});
			this.setState({ status: 'Error' });
		}
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	The Instance table data has been rendered
	 *	The user has clicked the terminate instances button
	 * Post:
	 *	A HTTP POST request is sent to 'dev_serverURL/deleteurl' containing a terminateInstance event
	 *	In the case that the sample event data cannot be found - the error is displayed
	 */
	terminateInstance() {
		// Send DELETE HTTP request if instance data found
		if (!(this.terminateInstanceEvent === null)) {
			this.sendRequest("DELETE","TerminateInstances", "deleteurl", this.terminateInstanceEvent);
		}
		else {
			this.setState({ reqStatus: 'Error - No Event Data Exists' });
			this.setState({ status: 'Error' });
		}
	}
	/**
	 * Pre:
	 *	Call to getInstance() from the class constructor
	 * Post:
	 *	The sample event data is initialized for the specific instance being constructed.
	 *
	 * param: instanceData Either contains sample runInstance events or terminateInstance events
	 * return: eventData The data for the instance event matchinng the instance name in instanceData
	 */
	getInstance(instanceData) {
		// Read through instance data to find instance properties for current instance
		for (var i=0; i < instanceData.Events.length; i++) {
			for (var j=0; j < instanceData.Events[i].tags.length; j++) {
				if (instanceData.Events[i].tags[j].Key === 'Name') {
					if (instanceData.Events[i].tags[j].Value === this.props.name) {
						// Found Desired Instance Data
						return instanceData.Events[i];
					}
				}
			}
		}
		// Instance Data Not Found
		return null;
	}
	/**
	 * Pre:
	 *	Call to runInstance() or terminateInstance().
	 * Post:
	 *	A run or terminate event has been sent to the server for the current instance.
	 *	Then the run status of each instance is updated by a call to fetchList() (props)
	 *	Any error in the request is updated in the request status column of the instance table data
	 *
	 * param: method The HTTP method used (POST or DELETE)
	 * param: eventName The name of the event used ('runInstances' or 'terminateInstances')
	 * param: route The route used on the server ('/dataurl' or '/deleteurl')
	 * param: data The sample run/terminate events data
	 */
	sendRequest(method, eventName, route, data) {
		// Send POST/DELETE to url with data
		this.setState({ reqCount: this.state.reqCount + 1 });
		fetch(this.dev_serverURL+route, {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Events: [data],
				eventName: eventName
			})
		}).then(function(response) {
			// Succesful request - update req response status and instance run status
			return response.text()
		}).then(function(data) {
			console.log(data)
			this.setState({ reqStatus: '('+eventName+') '+data });
			this.props.fetchList();
		}.bind(this)).catch(function(error) {
			// Error in request - display error under req response
			this.setState({ reqStatus: 'Request Error: ' + error.message });
		}.bind(this));
	}
	/**
	 * Pre:
	 *	The component did mount.
	 *	The Instance table data has been rendered
	 * Post:
	 *	If automatic events is enabled
	 *		The current generated random interval in minutes is stringified
	 *		to be displayed in the Event Interval column of the instance table data
	 *	Otherwise 'Disabled' is displayed in the Event Interval column of the instance table data
	 *
	 * return: String (Interval in minutes or 'Disabled')
	 */
	getIntervalText() {
		if (this.props.enableReq) { 
			return(((this.state.interval/1000)/60).toFixed(2) + ' minutes'); 
		} else { 
			return 'Disabled'; 
		}
	}
}


export default Instance;
