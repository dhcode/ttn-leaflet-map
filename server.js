/* Created by Dominik Herbst on 2017-07-05 */
const log = require('dhlog').forModule(module);
const express = require('express');
const app = express();
const server = require('http').Server(app);
const ttnClient = require('./src/ttn').connect();
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

app.use(express.static('public'));



ttnClient.on('message', function(deviceId, data) {
	io.emit('ttnMessage', data);
});

app.get('/data', function (req, res) {
	res.send('Hello World!');
});

server.listen(port, function () {
	log.info('App listening on port ' + port);
});

io.on('connection', function (socket) {
	log.info("Socket opened " + socket.id);

});