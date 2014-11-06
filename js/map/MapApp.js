var MapApp = Class.extend({
    construct: function () {
		this.map = null;
		this.svg = null;
		this.layers = [];
		this.DataCircles = new DataCircles();
	},
		
	init: function()
	{
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());

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

		this.DataCircles.addLayers(layersInfo, this.layers);
		
		this.map = L.map('map', {zoomControl: false}).setView([41.869910, -87.65], 12);
		this.map._initPathRoot();  

		var baseLayers = {
	        'Streets' : L.tileLayer('http://{s}.tiles.mapbox.com/v3/dare2wow.jkic38a8/{z}/{x}/{y}.png', 
	        {
                attribution: 'Tiles Courtesy of <a href="http://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
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
			"Street Lights" 		: this.layers[2]
		};
		
		// L.control.layers(baseLayers, overlays).addTo(this.map);
		L.control.layers(baseLayers, overlays, {position: 'bottomleft'}).addTo(this.map);
		baseLayers['Streets'].addTo(this.map);
	},
});