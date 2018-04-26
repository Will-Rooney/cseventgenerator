# Author: Will Rooney
# Description: 	Uses a template for run/terminate instance event data (AWS) to generate
#				run/terminate json files containing sample event data for each name in 'instanceList'

import json
import copy

instanceList = [ "bastion-01","bastion-02","bastion-03","bastion-04","bastion-05","bastion-06","bastion-07","bastion-08","bastion-09","bastion-10","bastion-11","bastion-12","cf-c-haproxy-01","cf-c-haproxy-02","cf-c-haproxy-int-elb-01","cf-c-haproxy-int-elb-02","consul-01","consul-02","consul-03","consul-04","consul-05","consul-06","consul-07","kibana-01","kibana-02","kibana-03","kibana-04","kibana-05","kibana-06","revproxy-01","revproxy-02","revproxy-03","revproxy-04","revproxy-05","revproxy-06","revproxy-08","revproxy-09" ]
with open('run.json') as json_data:
	runEvent = json.load(json_data)
with open('terminate.json') as json_data:
	terminateEvent = json.load(json_data)

runData = {'Events': [], 'eventName': 'RunInstances'}
termData = {'Events': [], 'eventName': 'TerminateInstances'}

for i,name in enumerate(instanceList):
	# Create a new run/termiate event
	tempRunEvent = copy.deepcopy(runEvent)
	tempTermEvent = copy.deepcopy(terminateEvent)
	# Generate the event id
	if i < 10:
		id_str = 'i-00'+str(i)
	elif i > 99:
		id_str = 'i-'
	else:
		id_str = 'i-0'+str(i)
	tempRunEvent['id']=id_str
	tempTermEvent['id']=id_str
	# Build the run instance event data
	for tag in tempRunEvent['tags']:
		if tag['Key'] == 'ApplicationName':
			if "proxy" in name:
				tag['Value']='huron'
			else:
				tag['Value'] = ''.join(name.split())[:-3]
		if tag['Key'] == 'Name':
			tag['Value'] = ''.join(name.split())
	# Build the terminate instance event data
	for tag in tempTermEvent['tags']:
		if tag['Key'] == 'ApplicationName':
			if "proxy" in name:
				tag['Value']='huron'
			else:
				tag['Value'] = ''.join(name.split())[:-3]
		if tag['Key'] == 'Name':
			tag['Value'] = ''.join(name.split())
	# Append new data
	runData['Events'].append(tempRunEvent)
	termData['Events'].append(tempTermEvent)

# Write data
with open('runInstanceEvents.json', 'w') as outfile:
	json.dump(runData, outfile, indent=2)
with open('terminateInstanceEvents.json', 'w') as outfile:
	json.dump(termData, outfile, indent=2)