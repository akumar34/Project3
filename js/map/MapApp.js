var MapApp = Class.extend({
    construct: function () {
		this.POTHOLES = 0;
		this.ABANDONED_VEHICLES = 1;
		this.STREET_LIGHTS = 2;
		this.DIVVY = 3;
		this.CRIME = 4;
		this.CTA = 5;
		this.FOOD_INSPECTION = 6;
	
		this.map = null;
		this.svg = null;
		this.layers = [];
		this.DataCircles = new DataCircles();
		
		this.statusColors = [];
		this.statusColors["In Service"] = "blue";
		this.statusColors["Out of Service"] = "purple";
		
		this.layersInfo = [];
		
		this.potholeUrl = [];
		this.abandonedVehicleUrl = [];
		this.streetLightUrl = [];
		this.crimeUrl = [];
		this.divvyUrl = [];
		this.ctaUrl = [];
		this.foodInspectionUrl = [];

		this.weekFilter = true;
		
		// this.updateDiv = L.control({
  //       	position: 'topleft'
  //   	});
  //   	this.updateDiv.onAdd = function () {
  //       	this._div = L.DomUtil.create('div', 'updateDiv');
  //       	this._div.innerHTML = '<h5>Update:</h5> <hr>' + '<p>ID:' + 1 + '<br>' + 2 + '</p>';
  //       	return this._div;
  //   	};
	},
	
	init: function(chicagoMap){
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());
		this.layers.push(new L.LayerGroup());

		var statusColors = this.statusColors;
		
		this.potholeUrl.push("http://data.cityofchicago.org/resource/7as2-ds3y.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=5000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.potholeUrl.push("http://data.cityofchicago.org/resource/7as2-ds3y.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=1000&$offset=5000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		var potholeUrl = this.potholeUrl;
		
		this.abandonedVehicleUrl.push("http://data.cityofchicago.org/resource/3c9v-pnva.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=3000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		var abandonedVehicleUrl = this.abandonedVehicleUrl;
		
		this.streetLightUrl.push("http://data.cityofchicago.org/resource/zuxi-7xem.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=3000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.streetLightUrl.push("http://data.cityofchicago.org/resource/3aav-uy2v.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=5000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.streetLightUrl.push("http://data.cityofchicago.org/resource/3aav-uy2v.json?$where=status!='Completed' AND status!='Completed - Dup'&$limit=5000&$offset=5000&$order=creation_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		var streetLightUrl = this.streetLightUrl;

		this.crimeUrl.push("http://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$order=date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.crimeUrl.push("http://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$offset=5000&$order=date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.crimeUrl.push("http://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$offset=10000&$order=date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.crimeUrl.push("http://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$offset=15000&$order=date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		this.crimeUrl.push("http://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$offset=20000&$order=date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");		
		var crimeUrl = this.crimeUrl;
		
		this.divvyUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fdivvybikes.com%2Fstations%2Fjson%3F_out%3Djson%22&format=json&diagnostics=true&callback=");
		var divvyUrl = this.divvyUrl;
		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C8A'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D9%2C10%2C11%2C12%2CJ14%2C15%2C18%2C19'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D20%2C21%2C22%2C24%2C26%2C28%2C29%2C30'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D33%2C34%2C35%2C36%2C37%2C39%2C43%2C44'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D47%2C48%2C49%2C49B%2C50%2C51%2C52%2C52A'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D53%2C53A%2C54%2C54A%2C54B%2C55%2C55A%2C55N'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D56%2C57%2C59%2C60%2C62%2C62H%2C63%2C63W'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D65%2C66%2C67%2C68%2C70%2C71%2C72%2C73'&format=json&diagnostics=true&callback=");	
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D74%2C75%2C76%2C77%2C78%2C79%2C80%2C81'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D81W%2C82%2C84%2C85%2C85A%2C86%2C87%2C88'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D90%2C91%2C92%2C93%2C94%2C95E%2C95W%2C96'&format=json&diagnostics=true&callback=");		
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D97%2CX98%2C100%2C103%2C106%2C108%2C111%2C112'&format=json&diagnostics=true&callback=");	
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D115%2C119%2C120%2C121%2C124%2C125%2C126%2C132'&format=json&diagnostics=true&callback=");	
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D134%2C135%2C136%2C143%2C146%2C147%2C148%2C151'&format=json&diagnostics=true&callback=");	
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D152%2C155%2C156%2C157%2C165%2C169%2C170%2C171'&format=json&diagnostics=true&callback=");	
		this.ctaUrl.push("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.ctabustracker.com%2Fbustime%2Fapi%2Fv1%2Fgetvehicles%3Fkey%3DHJN3hHSdDr3HRiJ5AirDZaScN%26rt%3D172%2C192%2C201%2C205%2C206'&format=json&diagnostics=true&callback=");	
		var ctaUrl = this.ctaUrl;

		this.foodInspectionUrl.push("http://data.cityofchicago.org/resource/4ijn-s7e5.json?$limit=2000&$where=results!=%27Out%20of%20Business%27&$order=inspection_date%20DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr");
		var foodInspectionUrl = this.foodInspectionUrl;
		
		var POTHOLES = this.POTHOLES;
		var ABANDONED_VEHICLES = this.ABANDONED_VEHICLES;
		var STREET_LIGHTS = this.STREET_LIGHTS;
		var DIVVY = this.DIVVY;
		var CRIME = this.CRIME;
		var CTA = this.CTA;
		var FOOD_INSPECTION = this.FOOD_INSPECTION;
		
		var DataCircles = this.DataCircles;
		
		this.layersInfo[POTHOLES] = 
		{
			sourceLink : potholeUrl,
			type : "Potholes",
			fill : "cyan",
			color : "orange",
			id : 0,
			refresh : new Date("January 1, 1901 00:00:00"), //hack: fix later
		};
		DataCircles.addPotholesData(this.layersInfo[POTHOLES], this.layers[POTHOLES]);
		
		this.layersInfo[ABANDONED_VEHICLES] = 
		{
			sourceLink : abandonedVehicleUrl,
			type : "Abandoned Vehicles",
			fill : "brown",
			color : "orange",
			id : 1,
			refresh : new Date("January 1, 1901 00:00:00"), //hack: fix later
		};
		DataCircles.addAbandonedVehiclesData(this.layersInfo[ABANDONED_VEHICLES], this.layers[ABANDONED_VEHICLES]);
		
		this.layersInfo[STREET_LIGHTS] = 		
		{
			sourceLink : streetLightUrl,
			type : "Street Lights",
			fill : "red",
			color : "orange",
			id : 2,
			refresh : new Date("January 1, 1901 00:00:00"), //hack: fix later
		};
		DataCircles.addStreetLightsData(this.layersInfo[STREET_LIGHTS], this.layers[STREET_LIGHTS]);
		
		this.layersInfo[DIVVY] = 		
		{
			sourceLink : divvyUrl, 
			type : "Divvy",
			fill : "blue",
			color : statusColors,
			id : 3,
			refresh : new Date("January 1, 1901 00:00:00"), //hack: fix later
		};
		DataCircles.addDivvyData(this.layersInfo[DIVVY], this.layers[DIVVY]);
		
		this.layersInfo[CRIME] = 		
		{
			sourceLink : crimeUrl,
			type : "Crime",
			fill : "green",
			color : "yellow",
			id : 4,
			refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
		};
		DataCircles.addCrimeData(this.layersInfo[CRIME], this.layers[CRIME]);
		
		this.layersInfo[CTA] = 		
		{
			sourceLink : ctaUrl, 
			type : "CTA",
			fill : "orange",
			color : "gray",
			id : 5,
			refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
		};
		DataCircles.addCTAData(this.layersInfo[CTA], this.layers[CTA]);
		
		this.layersInfo[FOOD_INSPECTION] = 		
		{
			sourceLink : foodInspectionUrl,
			type : "Food Inspection",
			fill : "green",
			color : "yellow",
			id : 6,
			refresh : new Date("January 1, 1901 00:00:00") //hack: fix later
		};
		DataCircles.addFoodInspectionData(this.layersInfo[FOOD_INSPECTION], this.layers[FOOD_INSPECTION]);

		// create and initialize map
		this.map = L.map('map', {zoomControl : false}).setView([41.869910, -87.65], 12);
		
		//add zoom control with options. Thanks internet
		new L.Control.Zoom({ position:'bottomright'}).addTo(this.map);
		// this.updateDiv.addTo(this.map);

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

        //DBPediaLayer stuff
		/*dbpedia_layer = L.dbPediaLayer({
			icon: {
	            iconUrl: 'icons/svg/marker_wikipedia.svg',
	            iconSize:     [60, 90],
	            iconAnchor:   [30, 90],
	            popupAnchor:  [0, -90]
        	}
		});*/
		/*
		dbpedia_layer.eachLayer(function(){//} (layer) {
		    console.log('hi');
		    //layer.bindPopup('Hello');
		});
		*/
		//end DBPediaLayer stuff
		
		/*
		var overlays = {
			"Potholes"  			: this.layers[this.POTHOLES],
			"Abandoned Vehicles"	: this.layers[this.ABANDONED_VEHICLES],
			"Street Lights" 		: this.layers[this.STREET_LIGHTS],
			"Divvy Bikes"			: this.layers[this.DIVVY],
			"Crime"					: this.layers[this.CRIME],
			"CTA"					: this.layers[this.CTA],
			"Food Inspection"		: this.layers[this.FOOD_INSPECTION],
			//"Wikipedia POIs"		: dbpedia_layer,

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
		};//end overlays
		*/

		//PANEL LAYERS STUFF
		var baseLayers = [
			{
				name: "Base Layer",
				sep: true
			},
		    {
		        name: "Road Map",
		        layer: L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
					attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
					subdomains: '1234',
					maxZoom : 18,
					minZoom: 10
				})
		    },
		    {
		        name: "Aerial",
		        layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')       
		    }
		];

		var overLayers = [
		    {
		        name: 'Overlays',   //separator with label
		        sep: true       
		    },
		    {
		        name: "Potholes",
		        icon: DataCircles.potholeIcon,
		        layer: this.layers[this.POTHOLES]
		    }/*,
		    {
		        name: 'Car POI',    //separator with label
		        sep: true       
		    },
		    {
		        name: "Parking",
		        icon: '<i class="icon icon-parking"></i>',
		        layer: L.geoJson(ParkingGeoJSON)
		    }   */
		];

		this.map.addControl( new L.Control.PanelLayers(baseLayers, overLayers, {collapsed: false}) );
		//END PANEL LAYERS STUFF
		
		// L.control.layers(baseLayers, overlays).addTo(this.map);
		// L.control.layers(baseLayers, overlays, {position: 'bottomleft', collapsed:false}).addTo(this.map);

		/*commented out to test panel layers
		var control = L.control.layers(baseLayers, overlays, {collapsed:false});
		control._map = this.map;
		var controlDiv = control.onAdd(this.map);

		$('#filters').append(controlDiv);
		// $('.leaflet-top.leaflet-right').hide();
		baseLayers['Streets'].addTo(this.map);
		*/



		//LEAFLET.DRAW STUF
		//FeatureGroup to store editabble layers
		drawnItems = new L.FeatureGroup();
		//drawnItems.addTo(map);
		this.map.addLayer(drawnItems); 
		//draw control, passed the FeatureGroup from above
		drawControl = new L.Control.Draw({
			position: 'bottomright',
			edit: 
			{
				featureGroup: drawnItems
			},
			draw: 
			{
		        marker	: false,
		    }
		});

		//add control to map
		this.map.addControl(drawControl);
		
		//drawControl.addTo(map);
		var context = this;
		this.map.on('draw:created', function(e) {
			var type = e.layerType;
			var layer = e.layer;
			
			// todo: check if its ok to draw if needed
			drawnItems.addLayer(layer);

			if (type == 'rectangle' || type == 'polygon') {
				shapes[layer._leaflet_id] = 
					{
						type 	: type,
						id  	: layer._leaflet_id,
						latlngs : layer._latlngs
					};
			}
			else if (type == 'circle') {
				shapes[layer._leaflet_id] = 
					{
						type 	: type,
						id  	: layer._leaflet_id,
						center 	: {lat : layer.getLatLng().lat, lng : layer.getLatLng().lng},
						radius	: layer.getRadius()
					};
			}
			else if (type == 'polyline') {
				foo = layer;
			};

			// extract lat lngs and add datapoints inside shape to the layers
			context.filterByShapes(shapes, true);

		});

		this.map.on('draw:deleted', function(e){
			var layers = e.layers._layers;
			var shapesToRemove = {};
			for(var x in layers){
				layer = layers[x];
				shapesToRemove[layer._leaflet_id] = shapes[layer._leaflet_id];
				delete shapes[layer._leaflet_id];
			};
			
			context.filterByShapes(shapesToRemove, false);			
		});
		//END LEAFLET.DRAW STUFF

		//leaflet locate control stuff
		L.control.locate({position: "bottomright"}).addTo(this.map);
		//end leaflet locate control stuff


		//terrible hack to move sidebar down. Will make it better
		var height = $('#map').height();
		var padding = 0;
		divs = $('.leaflet-bottom');
		for (var i = 0; i < divs.length; i++) {
			if ($(divs[i]).attr('class') == "leaflet-bottom leaflet-left") {
				padding = $(divs[i]).height() + $('#sidebar').height() + 20;
			};
		};
		$('#sidebar').css({'margin-top' : (height - padding) + 'px'});
	},

	drawDefaultRectangle: function(){
		var context = this;
		var bounds = [[41.8762076638325, -87.6873779296875], [41.8478259600331, -87.61322021484375]];
		var rect = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(context.map);
		
		shapes[rect._leaflet_id] = 
		{
			type 	: "rectangle",
			id  	: rect._leaflet_id,
			latlngs : rect._latlngs
		};
		
		context.filterByShapes(shapes, true);
	},
	
	filterByShapes: function (selectedShapes, add){
		var point;
		for(var x in selectedShapes){
			var shape = selectedShapes[x];
			
			if (shape.type == 'rectangle' || shape.type == 'polygon') {
				point = this.extractLngLatFromShape(shape.latlngs);
				this.DataCircles.filterByShape(point, add, this.weekFilter);
			}
			else if (shape.type == 'circle'){
				this.DataCircles.filterByCircle(shape, add, this.weekFilter);
			};
		};
	},

	extractLngLatFromShape: function (coordinatesArray) {
        var coordinates = [];
        for (var i = 0; i < coordinatesArray.length; i++) {
            coordinates.push([coordinatesArray[i].lng, coordinatesArray[i].lat]);
        };

        return coordinates;
    },

    filterByWeek : function (){
    	this.filterByShapes(shapes, false);
    	this.weekFilter = !this.weekFilter;
    	this.filterByShapes(shapes, true);
    },
	
	/*dateBefore: function(date1,date2) { return (date1-date2) < 0; },	
	dateAfter: function(date1,date2) { return (date1-date2) > 0; },	
	dateEqual: function(date1,date2) { return (date1-date2) === 0; },*/	
	
	refreshPotholes: function() { this.DataCircles.refreshPotholesData(this.layersInfo[this.POTHOLES], this.layers[this.POTHOLES]); },	
	refreshAbandonedVehicles: function() { this.DataCircles.refreshAbandonedVehiclesData(this.layersInfo[this.ABANDONED_VEHICLES], this.layers[this.ABANDONED_VEHICLES]); },
	refreshStreetLights: function() { this.DataCircles.refreshStreetLightsData(this.layersInfo[this.STREET_LIGHTS], this.layers[this.STREET_LIGHTS]); },
	refreshDivvy: function() { this.DataCircles.refreshDivvyData(this.layersInfo[this.DIVVY], this.layers[this.DIVVY]); },
	refreshCrime: function() { this.DataCircles.refreshCrimeData(this.layersInfo[this.CRIME], this.layers[this.CRIME]); },
	refreshCTA: function() { this.DataCircles.refreshCTAData(this.layersInfo[this.CTA], this.layers[this.CTA]); },
	refreshFoodInspection: function() { 
		this.DataCircles.refreshFoodInspectionData(this.layersInfo[this.FOOD_INSPECTION], this.layers[this.FOOD_INSPECTION]); 
	}
});