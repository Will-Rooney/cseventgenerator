import React, { Component } from 'react';
import ToggleButton from 'react-toggle-button';
import IntervalSlider from './IntervalSlider';
import './InstanceList.css';
import Instance from './Instance';

import instanceNames from './instance_list.json'; // load instance_list.json into instanceNames
import runInstanceEvents from './runInstanceEvents.json';
import terminateInstanceEvents from './terminateInstanceEvents.json';


class InstanceList extends Component {
	constructor(props) {
		super(props);
		this.state = { instances: null, runningList: [], maxInterval: 10, enableInterval: false};

		this.fetchList = this.fetchList.bind(this);
		this.updateInterval = this.updateInterval.bind(this);
		this.runInstances = this.runInstances.bind(this);
		this.terminateInstances = this.terminateInstances.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
	}
	componentWillMount() {
		this.fetchList();
		// Wait 100 ms and populate instance list
		setTimeout(function() {this.setState({ instances: instanceNames });}.bind(this), 100);
	}
	componentDidMount() {
		// Send HTTP GET to server to find running instances
		// Check for status updates every 1 minute(s)
		setInterval(function() { 
			this.fetchList();
		}.bind(this), 60000);
	}
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
									thumbStyle={{ borderRadius: 2 }}
									trackStyle={{ borderRadius: 2 }}
									value={this.state.enableInterval}
									onToggle={ (value) => {
										this.setState({ enableInterval: !value });
										// Force a re-render
										this.setState({ instances: instanceNames });
									}}/>
							</td>
							<td align='right' style={{fontWeight:'bold'}}>&emsp;Maximum Event Interval ({this.state.maxInterval} minutes):</td>
							<td width="30%"><IntervalSlider updateInterval={this.updateInterval}/></td>
						</tr>
					</tbody>
				</table>
				<span>
				<button className="Run" onClick={this.runInstances}>Run All</button>
				<button className="Terminate" onClick={this.terminateInstances}>Terminate All</button>
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
			/>
		));
	}
	getStatus(name) {
		// If GET request failed -- server is down
		if (this.state.runningList.length > 0 && this.state.runningList[0] === 'Unavailable') {
			return 'Unavailable';
		}

		for (var i=0; i < this.state.runningList.length; i++) {
			if (name === this.state.runningList[i]) {
				return 'Running';
			}
		}
		return 'Stopped';
	}
	fetchList() {
		var list = [];
		fetch('https://cmwserver.herokuapp.com/getml')
		//fetch('http://127.0.0.1:3002/getml')
			.then(function(response) {
				return response.json();
			}).then(function(json) {
				for (var i=0; i < json.length; i++) {
					if (json[i]['Name']) {
						list.push(json[i]['Name']);
					}
					else {
						console.log('Invalid GET response');
					}
				}
				return list;
		}).then(function(list) {
			//console.log(list);
			this.setState({ runningList: list});
		}.bind(this)).catch(function(e) {
			console.log('Failed to Parse Response',e);
			this.setState({ runningList: ['Unavailable']});
		}.bind(this));
	}
	updateInterval(value) {
		this.setState({ maxInterval: value });
		this.render();
	}
	runInstances() {
 		// Send POST HTTP Request if instance data found
		if (!(runInstanceEvents === null)) {
			//this.sendRequest("POST", "http://127.0.0.1:3002/dataurl", runInstanceEvents);
			this.sendRequest("POST", "https://cmwserver.herokuapp.com/dataurl", runInstanceEvents);
		}
	}
	terminateInstances() {
		// Send DELETE HTTP request if instance data found
		if (!(terminateInstanceEvents === null)) {
			//this.sendRequest("DELETE", "http://127.0.0.1:3002/deleteurl", terminateInstanceEvents);
			this.sendRequest("DELETE", "https://cmwserver.herokuapp.com/deleteurl", terminateInstanceEvents);
		}
	}
	sendRequest(method, url, data) {
		// Send POST/DELETE to url with data
		fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(function(response) {
			// Succesful request - update req response status and instance run status
			console.log(response.status+' - '+response.statusText);
			this.fetchList();
		}.bind(this), function(error) {
			// Error in request - display error under req response
			console.log(error.message);
		});
	}
}

export default InstanceList;
