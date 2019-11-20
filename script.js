// ------------------------------------------------------------------
// Display the results using OpenLayers
// ------------------------------------------------------------------  
// This layer will contain all markers

// Creae a map
var map = new ol.Map({
	target: 'map',
	layers: [
	  new ol.layer.Tile({
		source: new ol.source.OSM()
	  })
	],
	view: new ol.View({
	  center: ol.proj.fromLonLat([37.41, 8.82]),
	  zoom: 2
	})
});

 var fill = new ol.style.Fill({
   color: 'rgb(0,255,0)'
 });
 
 var stroke = new ol.style.Stroke({
   color: '#3399CC',
   width: 1.25
 });
 
var style = new ol.style.Style({
	 image: new ol.style.Circle({
	   fill: fill,
	   stroke: stroke,
	   radius: 5
	 }),
	 fill: fill,
	 stroke: stroke
});

// Create markers
function setMarkers(results) {
	var markers = [];
	results.forEach( function(result){	
		markers.push(new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([result.lon, result.lat])),
			attributes: {
				name: result.name,
				lat: result.lat,
				lon: result.lon
			}			
		}));	
	});
	setLayer(markers);
}

var markerVectorLayer;

// Add markers on the map
function setLayer(markers) {
	markerVectorLayer = new ol.layer.Vector({
	  source: new ol.source.Vector({
		features: markers
	  })
	});	
	markerVectorLayer.setStyle(style);
	map.addLayer(markerVectorLayer);
}

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	}
});
map.addOverlay(overlay);

closer.onclick = function () {
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

map.on('singleclick', function (event) {
	if (map.hasFeatureAtPixel(event.pixel) === true) {
		var coordinate = event.coordinate;
		 map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
			 var attributes = feature.get('attributes')		 
			 content.innerHTML = '<b>' + 'Name and country: ' + '</b>' + attributes.name + '<br>' +
				'<b>' + 'Longitude:' + '</b>' + attributes.lon + '<br>' +
				'<b>' + 'Latitude:' + '</b>' + attributes.lat;
         });
		overlay.setPosition(coordinate);
	} else {
		overlay.setPosition(undefined);
		closer.blur();
	}
});
// ------------------------------------------------------------------


// ------------------------------------------------------------------
// Connection with REST API
// ------------------------------------------------------------------
// Object with RapidAPI authorization headers and Content-Type header
const RAPIDAPI_REQUEST_HEADERS = {
  'X-RapidAPI-Host': 'devru-latitude-longitude-find-v1.p.rapidapi.com', 
  'X-RapidAPI-Key': '38713dae2bmshcd5d1f7957e3637p13fc88jsn6ff23ba34653', 
  'Content-Type': 'application/json'
};

// Constant URL value for API
const RAPIDAPI_API_URL = 'https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php';

// Set new location
function setLocation(LOCATION) {	
	LOCATION += ',';
	
	// Making a GET request using an axios instance from a connected library
	axios.get(`${RAPIDAPI_API_URL}?location=${LOCATION}`, {headers: RAPIDAPI_REQUEST_HEADERS})
	  .then(response => {
		map.removeLayer(markerVectorLayer); 	// remove the old markers
		console.log(response.data.Results);		
		var results = response.data.Results;
		setMarkers(results);
	  })
	  .catch(error => console.error('On get city info error', error))	
}
   