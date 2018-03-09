import React, { Component } from 'react';
import './Instance.css'
import InstanceList from './InstanceList';

class Instance extends Component {
	constructor(props) {
		super(props);
		this.state = { status: 'Stopped' };
		// Bind *this to the run/terminate function calls
		this.runInstance = this.runInstance.bind(this);
		this.terminateInstance = this.terminateInstance.bind(this);
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
			</tr>
		);
	}
	runInstance() {
		// Change state
		this.setState({ status: 'Running' });
		// Send POST - TODO
		// View Response - TODO
	}
	terminateInstance() {
		// Change state
		this.setState({ status: 'Stopped' });
		// Send DELETE - TODO
		// View Response - TODO
	}
}


export default Instance;
