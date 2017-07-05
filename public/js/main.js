class MyMap {
	constructor() {
		this.markers = [];
		this.historicCircles = [];

		this.map = new L.Map('map');

		const osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		const osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		const osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 19, attribution: osmAttrib});

		// start the map in South-East England
		this.map.setView(new L.LatLng(51.3, 0.7), 9);
		this.map.addLayer(osm);

		this.popup = L.popup();
		this.popup.setContent(this.getPopupContent.bind(this));

		this.connect();
	}

	connect() {
		this.socket = io();
		this.socket.on('ttnMessage', (data) => {
			console.log('ttnMessage', data);
			this.onMessage(data);
		});
	}

	onMessage(data) {
		if (!data.dev_id || !data.payload_fields) {
			return;
		}
		if (data.payload_fields.data && data.payload_fields.data.type === 'coords') {
			this.ensureMarker(data);
		}


	}

	ensureMarker(data) {
		const lat = data.payload_fields.data.lat / 1000000;
		const lng = data.payload_fields.data.lng / 1000000;
		const deviceId = data.dev_id;
		let marker = this.markers.find(m => m.deviceId === deviceId);
		if (marker) {
			marker.setLatLng(L.latLng(lat, lng));
		} else {
			marker = L.marker(L.latLng(lat, lng)).addTo(this.map).bindPopup(this.popup);
			marker.deviceId = deviceId;
			this.markers.push(marker);
		}
		marker.ttnData = data;

		this.map.fitBounds(L.featureGroup(this.markers).getBounds());

		const circle = L.circle(L.latLng(lat, lng), {
			stroke: false,
			fill: true,
			fillColor: '#000485',
			fillOpacity: 0.7,
			radius: 2
		}).addTo(this.map);
		circle.ttnData = data;
		circle.bindPopup(this.popup);
		this.historicCircles.push(circle);

		this.adjustHistoric();

	}

	getPopupContent(marker) {
		const data = marker.ttnData;
		const result = ['Device: ' + data.dev_id];
		result.push('Time: ' + new Date(data.metadata.time));
		if (data.metadata.gateways) {
			data.metadata.gateways.forEach(gw => {
				result.push('Gateway Channel: ' + gw.channel);
				result.push('Gateway RSSI / SNR: ' + gw.rssi + ' / ' + gw.snr);
			});
		}

		return result.join('<br>');
	}

	adjustHistoric() {
		const now = Date.now();
		for (let i = 0; i < this.historicCircles.length; i++) {
			const circle = this.historicCircles[i];
			const data = circle.ttnData;
			const time = new Date(data.metadata.time).getTime();
			if (time < now - 10 * 60 * 1000) {
				this.historicCircles.splice(i, 1);
				i--;
				circle.remove();
			} else if (time < now - 6 * 60 * 1000) {
				circle.options.fillOpacity = 0.3;
				circle.setStyle(circle.options);
			} else if (time < now - 4 * 60 * 1000) {
				circle.options.fillOpacity = 0.4;
				circle.setStyle(circle.options);
			} else if (time < now - 2 * 60 * 1000) {
				circle.options.fillOpacity = 0.5;
				circle.setStyle(circle.options);
			} else if (time < now - 60 * 1000) {
				circle.options.fillOpacity = 0.6;
				circle.setStyle(circle.options);
			}

		}
	}
}

$(function () {
	window.map = new MyMap();
});