import React, { Component } from 'react';
import './InstanceList.css';

import Instance from './Instance';
import instanceNames from './instance_list.json';

class InstanceList extends Component {
	constructor(props) {
		super(props);
		this.state = { instances: instanceNames };
	}
	render() {
		return (
			<div className="InstanceList">
				<table id="InstanceTable">
					<tbody>
						<tr>
							<th>Instance</th>
							<th>Run Status</th>
							<th>Run/Terminate</th>
							<th>HTTP Request Response</th>
						</tr>
						{this.renderInstances()}
					</tbody>
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
