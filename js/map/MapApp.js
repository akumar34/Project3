var map = null;
var map1 = null;
var map2 = null;

var svg = null;

function setMap(whichMap)
{
	var selectedOnes = null;

	if (whichMap === 1)
		{
			map.removeLayer(map2);
			map1.addTo(map);

			selectedOnes = svg.selectAll("text");
    		selectedOnes.style("fill", "white");
		}
	else
		{
			map.removeLayer(map1);
			map2.addTo(map);

			selectedOnes = svg.selectAll("text");
    		selectedOnes.style("fill", "black");	
    	}
}

var mapURL2 = 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
var mapCopyright2 = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'

var mapURL1 = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
var mapCopyright1 = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

map1 = L.tileLayer(mapURL1, {attribution: mapCopyright1});
map2 = L.tileLayer(mapURL2, {attribution: mapCopyright2});

map = L.map('map', {layers: [map1], zoomControl: false}).setView([41.869910, -87.65], 16);

/* Initialize the SVG layer */
map._initPathRoot();  

/* We simply pick up the SVG from the map object */
svg = d3.select(map.getPanes().overlayPane).select("svg");

var g = svg.append("g");

var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

var today = new Date();

var bigCollection = {};

var numBeats = 3;
var currentBeats = 0;

function getNewData(beat)
{
	var query = "http://data.cityofchicago.org/resource/x2n5-8w5q.json?beat=".concat(beat);

	d3.json(query, function(collection) {
		currentBeats++;
		if (currentBeats === 1)
				bigCollection = collection;
		else
				bigCollection = bigCollection.concat(collection);

		if (currentBeats === numBeats)
			dealWithData(bigCollection);
	});
}

function dealWithData(collection)
{		
	collection.forEach(function(d) {
		if (d.latitude && d.longitude)
			{
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
			}
		else
			{
				d.LatLng = new L.LatLng(0,0);
			}	
	});

	var feature = g.selectAll("circle")
		.data(collection)
		.enter()
		.append("svg:circle")
		.style("stroke", function (d) { if (d.inLastMonth) return "black"; else return "white"; })  
		.style("stroke-width", function (d) { if (d.inLastMonth) return 6; else return 2; })
		.style("opacity", function (d) { if (d.inLastMonth) return 1.0; else return 0.4; })
		.style("fill", function (d) { return d.color; })
		.attr("r", 15);

	var feature2 = g.selectAll("text")
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
		.text(function (d)
		{
			if (d.inLastMonth)
				return d._primary_decsription.toLowerCase(); 
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
	}		
}

function refreshData()
{
	/* We simply pick up the SVG from the map object */
	if (g != null)
		{
			g.selectAll("circle").remove();
			g.selectAll("text").remove();
		}

	currentBeats = 0;
	
	getNewData("1232");
	getNewData("1231");
	getNewData("0124");
}
refreshData();