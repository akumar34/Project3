var MapApp = Class.extend({
    construct: function () {
		this.map = null;
		this.map1 = null;
		this.map2 = null;
		this.svg = null;
		
		this.mapURL2 = 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
		this.mapCopyright2 = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'

		this.mapURL1 = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
		this.mapCopyright1 = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

		this.map1 = L.tileLayer(this.mapURL1, {attribution: this.mapCopyright1});
		this.map2 = L.tileLayer(this.mapURL2, {attribution: this.mapCopyright2});

		this.map = L.map('map', {layers: [this.map1], zoomControl: false}).setView([41.869910, -87.65], 16);

		/* Initialize the SVG layer */
		this.map._initPathRoot();  

		/* We simply pick up the SVG from the map object */
		this.svg = d3.select(this.map.getPanes().overlayPane).select("svg");

		this.g = this.svg.append("g");

		this.parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

		this.today = new Date();

		this.bigCollection = [];
	},

	setMap: function(whichMap) {
		var selectedOnes = null;

		if (whichMap === 1)
			{
				this.map.removeLayer(this.map2);
				this.map1.addTo(this.map);

				selectedOnes = this.svg.selectAll("text");
				selectedOnes.style("fill", "white");
			}
		else
			{
				this.map.removeLayer(this.map1);
				this.map2.addTo(this.map);

				selectedOnes = this.svg.selectAll("text");
				selectedOnes.style("fill", "black");	
			}
	},

	getNewData: function(){
		var callback = this.processData.bind(this);
		var query = 
"http://data.cityofchicago.org/resource/7as2-ds3y.json?$order=creation_date DESC&$$app_token=8CrJt3g8pNLmVHdmhQDJCj2yr";
		var bigCollection = this.bigCollection;
		
		d3.json
		(
			query, function(collection) 
			{
				bigCollection = bigCollection.concat(collection);
				callback(bigCollection);
			}
		);
	},
	
	processData: function(collection){
		var geoJsonData = this.toGeoJson(collection);
		var geojsonMarkerOptions = {
			radius: 8,
			fillColor: "#ff7800",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};
		
		L.geoJson(geoJsonData, {
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, geojsonMarkerOptions);
			}
		}).addTo(this.map);
	},
	
	/*processPotholesData: function(collection){
		var parseDate = this.parseDate;
		var today = this.today;
		var map = this.map;
		collection.filter
		(
			function(d)
			{
				var diff = (today - parseDate(d.creation_date)) / 1000 / 60 / 60 / 24; 
				return diff <= 31;
			}
		)
		.forEach
		(
			function(d)
			{
				if (d.latitude && d.longitude)
				{
					if (isNaN(d.latitude))
						console.log("latitude is not a number");
					if (isNaN(d.longitude))
						console.log("longitude is not a number");
					d.LatLng = new L.LatLng(+d.latitude, +d.longitude);
					d.myDate = parseDate(d.creation_date);
					d.daysAgo = (today - d.myDate) / 1000 / 60 / 60 / 24;
					
					if (d.daysAgo < 8)
						d.inLastWeek = 1;
					else
						d.inLastWeek = 0;
					
					switch(d.inLastWeek)
					{
						case 1: d.color = "green"; break;
						case 0: d.color = "yellow"; break;
					}
					
					var potholes = new L.LayerGroup();
					L.marker([d.longitude, d.latitude]).bindPopup('Location' + d.street + '\nstatus' + d.status).addTo(potholes);
					
					//this.map = L.map('map', {layers: [this.map1, potholes], zoomControl: false}).setView([41.869910, -87.65], 16);

					var baseLayers = {
						"aerial": this.map1,
						"map":    this.map2
					};

					var overlays = {
						"potholes": potholes
					};

					L.control.layers(baseLayers, overlays).addTo(this.map);
				} else {
					d.LatLng = new L.LatLng(0,0);
				}	
			}
		);*/
		/*var feature = this.g.selectAll("circle")
			.data(collection)
			.enter()
			.append("svg:circle")
			.style("stroke", function (d) { if (d.inLastWeek) return "black"; else return "white"; })  
			.style("stroke-width", function (d) { if (d.inLastWeek) return 6; else return 2; })
			.style("opacity", function (d) { if (d.inLastWeek) return 1.0; else return 0.4; })
			.style("fill", function (d) { return d.color; })
			.attr("r", 15);

		var feature2 = this.g.selectAll("text")
			.data(collection)
			.enter()
			.append("svg:text")
			.style("fill", "white")
			.style("stroke", function (d) { return d.color; })
			.style("stroke-width", "1")
			.style("font-size", "30px")
			.style("font-family", "Arial")
			.style("text-anchor", "start")
			.style("font-weight","bold")
			.text(function (d){
				return d.status.toLowerCase(); 
			});
		
		map.on("viewreset", update);
		update();

			function update() {
			feature.attr("transform", 
			function(d) { 
				return "translate("+ 
					map.latLngToLayerPoint(d.LatLng).x +","+ 
					map.latLngToLayerPoint(d.LatLng).y +")";
				}
			);
			feature2.attr("transform", 
			function(d) { 
				return "translate("+ 
					(map.latLngToLayerPoint(d.LatLng).x+20.0) +","+ 
					(map.latLngToLayerPoint(d.LatLng).y+5.0) +")";
				}
			);
		}*/			
	//},

	refreshData: function()
	{
		/* We simply pick up the SVG from the map object */
		//if (this.g != null)
		//{
		//	this.g.selectAll("circle").remove();
		//	this.g.selectAll("text").remove();
		//}
		this.getNewData();
	},
	
	toGeoJson: function(collection){

		var type = '"type"';
		var featureCollectionLabel = '"FeatureCollection"';

		var FeatureLabel = '"Feature"';
		var featuresLabel = '"features"';
		var geometryLabel = '"geometry"';

		var pointLabel = '"Point"';
		var coordinatesLabel = '"coordinates"';
		var propertiesLabel = '"properties"';
			
		var geoJson = "{" + type + ":" + featureCollectionLabel + ",";
		geoJson = geoJson + featuresLabel + ":[";

		collection.forEach
		(
			function(d)
			{
				geoJson = geoJson + "{";
				geoJson = geoJson + type + ":";
				geoJson = geoJson + FeatureLabel + ",";
				geoJson = geoJson + geometryLabel + ":{";
				geoJson = geoJson + type + ":";
				geoJson = geoJson + pointLabel + ",";
				geoJson = geoJson + coordinatesLabel + ":[";
				if(d.location){
					var longitude = d.location.longitude;
					var latitude = d.location.latitude;
					geoJson = geoJson + longitude + "," + latitude + "]},";
				} else geoJson = geoJson + 0.00000 + "," + 0.00000 + "]},";
				geoJson = geoJson + propertiesLabel + ":{";
				for( obj in d ){
					if(obj !== "location"){
						geoJson = geoJson + '"' + obj + '":"' + d[obj] + '",';	
						continue;
					}
					if(! d.location){
						geoJson = geoJson + 
							'"location/needs_recoding":"","location/longitude":"","location/latitude":"",';
						continue;
					}
					var longitude = d.location.longitude;
					var latitude = d.location.latitude;
					for(var locObj in d[obj]){
						geoJson = geoJson + '"location/' + locObj + '":"' + d[obj][locObj] + '",';
					}
				}
				geoJson = geoJson.substring(0, geoJson.length - 1);
				geoJson = geoJson + "}},";

			}
		);
		geoJson = geoJson.substring(0, geoJson.length - 1);
		geoJson = geoJson + "]}";
		geoJson = jQuery.parseJSON(geoJson);
		return geoJson;
	},

});