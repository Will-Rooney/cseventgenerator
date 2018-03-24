import React, { Component } from 'react';
import './InstanceList.css';

import Instance from './Instance';
import instanceNames from './instance_list.json'; // load instance_list.json into instanceNames

class InstanceList extends Component {
	constructor(props) {
		super(props);
		this.state = { instances: null };
		this.fetchList = this.fetchList.bind(this);
		this.runningList = [];
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
				<table id="InstanceTable">
					<tbody>
						<tr>
							<th>Instance</th>
							<th>Run Status</th>
							<th>Run/Terminate</th>
							<th>HTTP Request</th>
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
		fetch('https://csserverlist.herokuapp.com/getml')
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
