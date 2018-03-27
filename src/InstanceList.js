import React, { Component } from 'react';
import ToggleButton from 'react-toggle-button';
import './InstanceList.css';

import Instance from './Instance';
import instanceNames from './instance_list.json'; // load instance_list.json into instanceNames

class InstanceList extends Component {
	constructor(props) {
		super(props);
		this.state = { instances: null };
		this.fetchList = this.fetchList.bind(this);
		this.runningList = [];
		this.intervalRequests = { Enabled: false };
	}
	componentWillMount() {
		this.fetchList();
		// Wait 100 ms and force a re-render
		setTimeout(function() {this.setState({ instances: instanceNames });}.bind(this), 100);
		//this.setState = { instances: instanceNames };
	}
	componentDidMount() {
		// Send HTTP GET to server to find running instances
		// Check for status updates every 5 seconds
		setInterval(function() { 
			this.fetchList();
			// Wait 100 ms and force a re-render
			setTimeout(function() {this.setState({ instances: instanceNames });}.bind(this), 100);
		}.bind(this), 5000);
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
							<td style={{fontWeight:'bold'}}>Toggle Interval Requests:</td>
							<td>
								<ToggleButton
									thumbStyle={{ borderRadius: 2 }}
									trackStyle={{ borderRadius: 2 }}
									value={this.intervalRequests.Enabled}
									onToggle={ (value) => {
										this.intervalRequests.Enabled = !value;
										// Force a re-render
										this.setState({ instances: instanceNames });
									}}/>
							</td>
						</tr>
					</tbody>
				</table>
				<table id="InstanceTable">
					<tbody>
						<tr>
							<th>Instance</th>
							<th>Run Status</th>
							<th>Run/Terminate</th>
							<th>HTTP Requests</th>
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
				enableReq={this.intervalRequests.Enabled}
			/>
		));
	}
	getStatus(name) {
		// If GET request failed -- server is down
		if (this.runningList.length > 0 && this.runningList[0] === 'Unavailable') {
			return 'Unavailable';
		}

		for (var i=0; i < this.runningList.length; i++) {
			if (name === this.runningList[i]) {
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
			this.runningList = list;
		}.bind(this)).catch(function(e) {
			console.log('Failed to Parse Response',e);
			this.runningList = ['Unavailable'];
		}.bind(this));
	}
}

export default InstanceList;
