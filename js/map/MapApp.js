var MapApp = Class.extend({
    construct: function () {
		this.map = null;
		this.svg = null;
		this.layers = [];
		this.DataCircles = new DataCircles();
	},
	
	dateBefore: function(date1,date2) { 
		return (date1-date2) < 0; 
	},
	
	dateAfter: function(date1,date2) { 
		return (date1-date2) > 0; 
	},
	
	dateEqual: function(date1,date2) { 
		return (date1-date2) === 0; 
	},
	
	init: function(chicagoMap){
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());

		var layersInfo = [
			{
				sourceLink : "http://data.cityofchicago.org/resource/7as2-ds3y.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Potholes",
				fill : "cyan",
				monthColor : "orange",
				id : 0,
				refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
			},
			{
				sourceLink : "http://data.cityofchicago.org/resource/3c9v-pnva.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Abandoned Vehicles",
				fill : "brown",
				monthColor : "orange",
				id : 1,
				refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
			},

			{
				sourceLink : "http://data.cityofchicago.org/resource/zuxi-7xem.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Lights",
				fill : "red",
				monthColor : "orange",
				id : 2,
				refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
			}
		];

		this.DataCircles.addLayers(layersInfo, this.layers);
		
		this.map = L.map('map', {zoomControl: false}).setView([41.869910, -87.65], 12);
		this.map._initPathRoot();  

		var baseLayers = {
	        'Streets' : L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
				attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
				subdomains: '1234',
				maxZoom : 18,
				minZoom: 10
			}),

	        'Aerial': L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
	        {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18,
                minZoom: 10
	        })
		
        };
		
		var overlays = {
			"Potholes"  			: this.layers[0],
			"Abandoned Vehicles"	: this.layers[1],
			"Street Lights" 		: this.layers[2],

			'Chicago Communities' : L.geoJson(chicagoMap, {
                style: function (feature){
                    return {
                        color: "#A669FF",
                        // colorOpacity: 1,
                        fillColor: "white",
                        fillOpacity: 0.25,
                        opacity: 1,
                        weight: 2
                    };
                },
                onEachFeature: function (feature, layer){
                    layer.bindPopup(feature.properties.name);
                    layer.on('click', function (){
                        // call some function;
                    });
                }
            })
		};
		
		// L.control.layers(baseLayers, overlays).addTo(this.map);
		L.control.layers(baseLayers, overlays, {position: 'bottomright'}).addTo(this.map);
		baseLayers['Streets'].addTo(this.map);

		//LEAFLET.DRAW STUF
		//FeatureGroup to store editabble layers
		var drawnItems = new L.FeatureGroup();
		//drawnItems.addTo(map);
		this.map.addLayer(drawnItems); 
		//draw control, passed the FeatureGroup from above
		var drawControl = new L.Control.Draw({
				position: 'bottomright',
			edit: {
				featureGroup: drawnItems
			}
		});

		//add control to map
		this.map.addControl(drawControl);
		console.log("yeah, bs");
		//drawControl.addTo(map);
		var context = this;
		this.map.on('draw:created', function(e) {
			var type = e.layerType,
			layer = e.layer;

			// very simple test right now
			if (type == 'rectangle') {
				//do marker stuff
				// console.log(layer._latlngs);
				// console.log(context.extractLngLatFromShape(layer._latlngs));
				var coorArray = context.extractLngLatFromShape(layer._latlngs);
				context.DataCircles.filterByShape(coorArray);	

			};

			//this.map.addLayer(layer);
			drawnItems.addLayer(layer);
		});//ennd this.map.on('draw:created
		//END LEAFLET.DRAW STUFF
	},

	extractLngLatFromShape: function (coordinatesArray) {
        coordinates = [];
        for (var i = 0; i < coordinatesArray.length; i++) {
            coordinates.push([coordinatesArray[i].lng, coordinatesArray[i].lat]);
        };

        return coordinates;
    },
	
	refresh: function(){
		//for(var index = 0; index < this.layers.length; index++) this.layers[index].clearLayers();
		
		//this.layers.push(new L.LayerGroup());
		//this.layers.push(new L.LayerGroup());
		//this.layers.push(new L.LayerGroup());

		var layersInfo = [
			{
				sourceLink : "http://data.cityofchicago.org/resource/7as2-ds3y.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Potholes",
				fill : "cyan",
				monthColor : "orange",
				id : 0
			},
			{
				sourceLink : "http://data.cityofchicago.org/resource/3c9v-pnva.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Abandoned Vehicles",
				fill : "brown",
				monthColor : "orange",
				id : 1
			},

			{
				sourceLink : "http://data.cityofchicago.org/resource/zuxi-7xem.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr", 
				type : "Lights",
				fill : "red",
				monthColor : "orange",
				id : 2
			}
		];
		this.DataCircles.refreshLayers(layersInfo, this.layers);	
	},
});