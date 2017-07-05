/* Created by Dominik Herbst on 2017-07-05 */
// This file is based on https://github.com/TheThingsNetwork/node-app-sdk/blob/HEAD/src/example.js (MIT License)

const ttn = require('ttn');
const fs = require('fs');
const config = require('../config.json');

const region = 'eu';
const appId = config.appId;
const accessKey = config.accessKey;
const options = {
	protocol: 'mqtts',
	// Assuming that the mqtt-ca certificate (https://www.thethingsnetwork.org/docs/applications/mqtt/quick-start.html) is in the same folder
	ca: [ fs.readFileSync('mqtt-ca.pem') ],
};

exports.connect = function() {
	const client = new ttn.data.MQTT(region, appId, accessKey);

	client.on('connect', function(connack) {
		console.log('[DEBUG]', 'Connect:', connack);
		console.log('[DEBUG]', 'Protocol:', client.mqtt.options.protocol);
		console.log('[DEBUG]', 'Host:', client.mqtt.options.host);
		console.log('[DEBUG]', 'Port:', client.mqtt.options.port);
	});

	client.on('error', function(err) {
		console.error('[ERROR]', err.message);
	});

	client.on('activation', function(deviceId, data) {
		console.log('[INFO] ', 'Activation:', deviceId, JSON.stringify(data, null, 2));
	});

	// client.on('device', null, 'down/scheduled', function(deviceId, data) {
	// 	console.log('[INFO] ', 'Scheduled:', deviceId, JSON.stringify(data, null, 2));
	// });
	//
	// client.on('message', function(deviceId, data) {
	// 	console.info('[INFO] ', 'Message:', deviceId, JSON.stringify(data, null, 2));
	// });

	return client;
};

