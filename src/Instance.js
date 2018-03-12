import React, { Component } from 'react';
import './Instance.css'
import runInstanceEvents from './runInstanceEvents.json';
import terminateInstanceEvents from './terminateInstanceEvents.json';
import 'whatwg-fetch' // https://github.com/github/fetch

var httpReqRes = "No requests have been made";

class Instance extends Component {
	constructor(props) {
		super(props);
		this.state = { status: 'Stopped' };
		this.runInstance = this.runInstance.bind(this);
		this.terminateInstance = this.terminateInstance.bind(this);
		this.getInstance = this.getInstance.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
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
				<td>{httpReqRes}</td>
			</tr>
		);
	}
	runInstance() {
		var instanceEvent = this.getInstance(runInstanceEvents)
		// Send POST HTTP Request
		if (!(instanceEvent === null))
			this.sendRequest("POST",instanceEvent,"RunInstances");
	}
	terminateInstance() {
		var instanceEvent = this.getInstance(terminateInstanceEvents)
		// Send DELETE HTTP request
		if (!(instanceEvent === null))
			this.sendRequest("DELETE",instanceEvent,"TerminateInstances");
	}
	getInstance(instanceData) {
		for (var i=0; i < instanceData.Events.length; i++) {
			for (var j=0; j < instanceData.Events[i].tags.length; j++) {
				if (instanceData.Events[i].tags[j].Key === 'Name') {
					console.log(this.state.name)
					if (instanceData.Events[i].tags[j].Value === this.props.name) {
						return instanceData.Events[i];
					}
				}
			}
		}
		return null
	}
	sendRequest(method, data, eventName) {
		fetch('https://csserverlist.herokuapp.com/dataurl', {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Events: data,
				eventName: eventName
			})
		}).then(function(response) {
			this.setState({ status: 'Stopped' });
			httpReqRes = response.text();
		}, function(error) {
			//err.message //=> String
			httpReqRes = error.message;
		});
	}
}


export default Instance;
