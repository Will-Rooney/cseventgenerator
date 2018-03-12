import React, { Component } from 'react';
import './Instance.css'
import runInstanceEvents from './runInstanceEvents.json';
import terminateInstanceEvents from './terminateInstanceEvents.json';
import 'whatwg-fetch' // https://github.com/github/fetch

class Instance extends Component {
	constructor(props) {
		super(props);
		// Run Status
		this.state = { status: 'Stopped' };
		// HTTP Request Status
		this.reqState = { status: 'No requests have been made' };
		this.reqCount = 0;
		this.interval = Math.floor(Math.random()*(600000-60000+1)+60000);

		// Bind 'this' to our functions
		this.runInstance = this.runInstance.bind(this);
		this.terminateInstance = this.terminateInstance.bind(this);
		this.getInstance = this.getInstance.bind(this);
		this.sendRequest = this.sendRequest.bind(this);

		// Store Instance Properties
		this.runInstanceEvent = this.getInstance(runInstanceEvents);
		this.terminateInstanceEvent = this.getInstance(terminateInstanceEvents);
	}
	componentDidMount() {
		// Create an interval (1-10 minutes) for which a request will fire
		// Each instance is initialized with a random interval
		// The choice between a run or terminate call is based on run status
		console.log('Instance interval:'+((this.interval/1000)/60).toFixed(2)+' minutes');
		setInterval(function() { 
			if (this.state.status === 'Stopped')
				this.runInstance();
			else
				this.terminateInstance();
			//console.log("Req Fired"); 
		}.bind(this), this.interval);
	}
	render() {
		return (
			// For each instance - add a new entry to our table
			<tr className="Instance">
				<td>{this.props.name}</td>
				<td>{this.state.status}</td>
				<td>
					<button className="Run" onClick={this.runInstance}>Run</button>
					<button className="Terminate" onClick={this.terminateInstance}>Terminate</button>
				</td>
				<td>Request Interval:&nbsp;&nbsp;{ ((this.interval/1000)/60).toFixed(2) } minutes<br />Request Status:&emsp; {this.reqState.status}<br />Request Count:&emsp;&nbsp;&nbsp;{this.reqCount}</td>
			</tr>
		);
	}
	runInstance() {
 		// Send POST HTTP Request if instance data found
		if (!(this.runInstanceEvent === null)) {
			this.sendRequest("POST","RunInstances", "http://127.0.0.1:3001/dataurl", this.runInstanceEvent);
			//this.sendRequest("POST","RunInstances", "https://csserverlist.herokuapp.com/dataurl", this.runInstanceEvent);
		}
		else {
			this.reqState.status = 'Error - No Event Data Exists';
			this.setState({ status: 'Error' });
		}
	}
	terminateInstance() {
		// Send DELETE HTTP request if instance data found
		if (!(this.terminateInstanceEvent === null)) {
			this.sendRequest("DELETE","TerminateInstances", "http://127.0.0.1:3001/deleteurl", this.terminateInstanceEvent);
			//this.sendRequest("DELETE","TerminateInstances", "https://csserverlist.herokuapp.com/deleteurl", this.terminateInstanceEvent);
		}
		else {
			this.reqState.status = 'Error - No Event Data Exists';
			this.setState({ status: 'Error' });
		}
	}
	getInstance(instanceData) {
		// Read through instance data to find instance properties for current instance
		for (var i=0; i < instanceData.Events.length; i++) {
			for (var j=0; j < instanceData.Events[i].tags.length; j++) {
				if (instanceData.Events[i].tags[j].Key === 'Name') {
					if (instanceData.Events[i].tags[j].Value === this.props.name) {
						return instanceData.Events[i];
					}
				}
			}
		}
		return null;
	}
	sendRequest(method, eventName, url, data) {
		// Send POST/DELETE to url with data
		this.reqCount += 1;
		fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Events: data,
				eventName: eventName
			})
		}).then(function(response) {
			// Succesful request - update req response status and instance run status
			//console.log(response);
			this.reqState= { status: '('+eventName+') '+response.status+' - '+response.statusText };
			if (eventName === 'RunInstances')
				this.setState({ status: 'Running' });
			else
				this.setState({ status: 'Stopped' });
		}.bind(this), function(error) {
			// Error in request - display error under req response
			//err.message //=> String
			this.reqState.status = error.message;
			this.setState({ status: 'Error' });
		}.bind(this));
	}
}


export default Instance;
