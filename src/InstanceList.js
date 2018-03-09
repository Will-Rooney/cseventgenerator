import React, { Component } from 'react';
import './InstanceList.css';

import Instance from './Instance';

class InstanceList extends Component {
	constructor(props) {
		super(props);
		// TODO - Load static list of instances and their properites
		this.state = { instances: ['instance 01', 'instance 02', 'instance 03'] };
	}
	render() {
		return (
			<div className="InstanceList">
				<table id="InstanceTable">
		        <tr>
		          <th>Instance</th>
		          <th>Run Status</th>
		          <th>Run/Terminate</th>
		        </tr>
		        {this.renderInstances()}
		      </table>
			</div>
		);
	}
	renderInstances() {
		return this.state.instances.map(name => (
			<Instance
				key={name}
				name={name}
			/>
		));
	}

}

export default InstanceList;