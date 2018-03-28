import React, { Component } from 'react';
import './Instance.css'
import runInstanceEvents from './runInstanceEvents.json';
import terminateInstanceEvents from './terminateInstanceEvents.json';
import 'whatwg-fetch' // https://github.com/github/fetch

class Instance extends Component {
	constructor(props) {
		super(props);

		this.state = { reqStatus: 'No requests have been made', reqCount: 0, interval: Math.floor(Math.random()*((this.props.maxInterval*60*1000)-60000+1)+60000) };

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
	componentDidMount() {
		// Create an interval (1-10 minutes) for which a request will fire
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

		// Check For Interval changes
		var old_interval = this.props.maxInterval;
		setInterval(function() { 
			if (old_interval !== this.props.maxInterval) {
				this.setState({ interval: Math.floor(Math.random()*((this.props.maxInterval*60*1000)-60000+1)+60000) });
				old_interval = this.props.maxInterval;
			}
		}.bind(this), 1000);
	}
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
	runInstance() {
 		// Send POST HTTP Request if instance data found
		if (!(this.runInstanceEvent === null)) {
			//this.sendRequest("POST","RunInstances", "http://127.0.0.1:3002/dataurl", this.runInstanceEvent);
			this.sendRequest("POST","RunInstances", "https://cmwserver.herokuapp.com/dataurl", this.runInstanceEvent);
		}
		else {
			this.setState({ reqStatus: 'Error - No Event Data Exists'});
			this.setState({ status: 'Error' });
		}
	}
	terminateInstance() {
		// Send DELETE HTTP request if instance data found
		if (!(this.terminateInstanceEvent === null)) {
			//this.sendRequest("DELETE","TerminateInstances", "http://127.0.0.1:3002/deleteurl", this.terminateInstanceEvent);
			this.sendRequest("DELETE","TerminateInstances", "https://cmwserver.herokuapp.com/deleteurl", this.terminateInstanceEvent);
		}
		else {
			this.setState({ reqStatus: 'Error - No Event Data Exists' });
			this.setState({ status: 'Error' });
		}
	}
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
	sendRequest(method, eventName, url, data) {
		// Send POST/DELETE to url with data
		this.setState({ reqCount: this.state.reqCount + 1 });
		fetch(url, {
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
			if (response.status === 400 && response.statusText === 'Bad Request') {
				this.setState({ reqStatus: '('+eventName+') '+response.status+' - '+eventName+' already requested' });
			}
			else {
				this.setState({ reqStatus: '('+eventName+') '+response.status+' - '+response.statusText });
			}
			this.props.fetchList();
		}.bind(this), function(error) {
			// Error in request - display error under req response
			this.setState({ reqStatus: error.message });
		}.bind(this));
	}
	getIntervalText() {
		if (this.props.enableReq) { 
			return(((this.state.interval/1000)/60).toFixed(2) + ' minutes'); 
		} else { 
			return 'Disabled'; 
		}
	}
}


export default Instance;
