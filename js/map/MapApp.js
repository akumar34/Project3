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

		this.numBeats = 3;
		this.currentBeats = 0;
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

	getNewData: function(beat){
		var query = "http://data.cityofchicago.org/resource/x2n5-8w5q.json?beat=".concat(beat);
		var bigCollection = this.bigCollection;
		
		d3.json(query, function(collection) {
			this.currentBeats++;
			if (this.currentBeats === 1)
					bigCollection = collection;
			else
					bigCollection = bigCollection.concat(collection);
			this.bigCollection = bigCollection;
			if (this.currentBeats === this.numBeats)
				this.dealWithData(bigCollection);
		});
	},

	dealWithData: function(collection){		
		collection.forEach(function(d) {
			if (d.latitude && d.longitude){
				if (isNaN(d.latitude))
					console.log("latitude is not a number");
				if (isNaN(d.longitude))
					console.log("longitude is not a number");
				d.LatLng = new L.LatLng(+d.latitude, +d.longitude);
				d.myDate = parseDate(d.date_of_occurrence);
				d.daysAgo = (today - d.myDate) / 1000 / 60 / 60 / 24; //7-373

				if (d.daysAgo < 31)
					d.inLastMonth = 1;
				else
					d.inLastMonth = 0;

				d.description = d._primary_decsription;

			   switch(d._primary_decsription) {
				case "THEFT":
				case "BURGLARY":
				case "MOTOR VEHICLE THEFT":
				case "ROBBERY": 			d.color = "green"; break; 

				case "ASSAULT":
				case "HOMICIDE":
				case "CRIM SEXUAL ASSAULT":
				case "BATTERY": 			d.color = "red"; break; 

				case "CRIMINAL DAMAGE": 
				case "CRIMINAL TRESPASS": 	d.color = "purple"; break;

				case "NARCOTICS": 			d.color = "pink"; break;

				case "DECEPTIVE PRACTICE": d.color = "orange"; break; 

				default: 					d.color = "grey"; 
					break;
				}
			} else{
				d.LatLng = new L.LatLng(0,0);
			}	
		});

		var feature = this.g.selectAll("circle")
			.data(collection)
			.enter()
			.append("svg:circle")
			.style("stroke", function (d) { if (d.inLastMonth) return "black"; else return "white"; })  
			.style("stroke-width", function (d) { if (d.inLastMonth) return 6; else return 2; })
			.style("opacity", function (d) { if (d.inLastMonth) return 1.0; else return 0.4; })
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
				if (d.inLastMonth) return d._primary_decsription.toLowerCase(); 
			});
		
		this.map.on("viewreset", update);
		update();

		function update() {
			feature.attr("transform", 
			function(d) { 
				return "translate("+ 
					this.map.latLngToLayerPoint(d.LatLng).x +","+ 
					this.map.latLngToLayerPoint(d.LatLng).y +")";
				}
			);
			feature2.attr("transform", 
			function(d) { 
				return "translate("+ 
					(this.map.latLngToLayerPoint(d.LatLng).x+20.0) +","+ 
					(this.map.latLngToLayerPoint(d.LatLng).y+5.0) +")";
				}
			);
		}	
	},		

	refreshData: function()
	{
		/* We simply pick up the SVG from the map object */
		if (this.g != null)
			{
				this.g.selectAll("circle").remove();
				this.g.selectAll("text").remove();
			}

		this.currentBeats = 0;
		
		this.getNewData("1232");
		this.getNewData("1231");
		this.getNewData("0124");
	},
//this.refreshData();
});