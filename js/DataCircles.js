// Data circles obj
function DataCircles() {
	var POTHOLES = 0;
	var ABANDONED_VEHICLES = 1;
	var STREET_LIGHTS = 2;
	var DIVVY = 3;
	var CRIME = 4;
	var CTA = 5;

    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;	
    var DataCirclesObj = new Object();
    // make this private after testing
    var selectedDataPoints = [];

	var layerContainers = [];
	layerContainers[POTHOLES] = {};
	layerContainers[ABANDONED_VEHICLES] = {};
	layerContainers[STREET_LIGHTS] = {};
	layerContainers[DIVVY] = {};
	layerContainers[CRIME] = {};
	layerContainers[CTA] = {};
	
    //custom markers
    //pothole
    var potholeIcon = L.icon({
        iconUrl: 'icons/svg/exclamation3.svg',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    });//end pothole

    //abandoned vehicles
    var abandonedVehicleIcon = L.icon({
        iconUrl: 'icons/svg/car168.svg',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76] 
    });//end abandoned vehicles

    //divvy stations
    var divvyStationIcon = L.icon({
        iconUrl: 'icons/svg/pins6.svg',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    });//end divvy station

    //street lights
    var streetLightIcon = L.icon({
        iconUrl: 'icons/svg/street9.svg',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76] 
    });//end street lights

    //crimes
    var crimeIcon = L.icon({
        iconUrl: 'icons/svg/handcuffs.svg',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76] 
    });//end crimes

    //CTA
    var ctaIcon = L.icon({
    iconUrl: 'icons/svg/pins17.svg',
    iconSize:     [38, 95],
    shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
    });//end CTA
    //end custom markers

/************Potholes Data Handling************/
	function addPotholesData(layerInfo, layer){
		layerContainers[POTHOLES] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
				if(data[index].status === "STATUS") continue;
				
                // filters
				var creation_date = parseDate(data[index].creation_date);
                if (creation_date == null) continue;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
				addPotholesMarkers(layerContainers[POTHOLES], index, data, layer, false);
            };
        });
	};
	
	function refreshPotholesData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
				if(data[index].status === "STATUS") continue;
				
                // filters
                if (data[index].creation_date == null) continue;
				var creation_date = parseDate(data[index].creation_date);
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) return;
                if (getByServiceNumber(layerContainers[POTHOLES], data[index].service_request_number) != null) return;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addPotholesMarkers(layerContainers[POTHOLES], index, data, layer, true);
            };
        });	
	}

    //helper function for adding potholes to map
    function addPotholesMarkers(layerContainer, dataIndex, data, layer, refresh) {
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: potholeIcon,
                service_request_number : data[dataIndex].service_request_number
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))//because time at end is always uselessly zeroed
        );//end .push
        //TODO change icon based on value of "status"
        if(refresh) layer.clearLayers();
        L.layerGroup(layerContainer.circles).addTo(layer);
        return null;
    };
/************End Potholes Data Handling************/

/************Abandoned Vehicles Data Handling************/
	function addAbandonedVehiclesData(layerInfo, layer){
		layerContainers[ABANDONED_VEHICLES] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
                // filters
				var creation_date = parseDate(data[index].creation_date);
                if (creation_date == null) continue;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
				addAbandonedVehiclesMarkers(layerContainers[ABANDONED_VEHICLES], index, data, layer, false);
            };
        });
	};

	function refreshAbandonedVehiclesData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
                // filters
                if (data[index].creation_date == null) continue;
				var creation_date = parseDate(data[index].creation_date);
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) return;
                if (getByServiceNumber(layerContainers[ABANDONED_VEHICLES], data[index].service_request_number) != null) return;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addAbandonedVehiclesMarkers(layerContainers[ABANDONED_VEHICLES], index, data, layer, true);
            };
        });	
	}
	
	//helper function for adding abandoned vehicle data to map
    function addAbandonedVehiclesMarkers(layerContainer, dataIndex, data, layer, refresh) {
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: abandonedVehicleIcon,
                service_request_number : data[dataIndex].service_request_number
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10) + 
            "<br><strong>Days Reported Parked:</strong> " + data[dataIndex]["how_many_days_has_the_vehicle_been_reported_as_parked_"])
        );//end .push
        //TODO change icon based on value of "status"
        //TODO do we want to put extra data like color, licenese plate, make/model? maybe under a "show more" tab/button, etc?
        if(refresh) layer.clearLayers();
        L.layerGroup(layerContainer.circles).addTo(layer);
        return null;
    };	
/************End Abandoned Vehicles Data Handling************/

/************Street Lights Data Handling************/	
	function addStreetLightsData(layerInfo, layer){
		layerContainers[STREET_LIGHTS] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
				if(data[index].status === "STATUS") continue;
				
                // filters
				var creation_date = parseDate(data[index].creation_date);
                if (creation_date == null) continue;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
				addStreetLightsMarkers(layerContainer, index, data, layer, false);
            };
        });
	};
	
	function refreshStreetLightsData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
				if(data[index].status === "STATUS") continue;
				
                // filters
                if (data[index].creation_date == null) continue;
				var creation_date = parseDate(data[index].creation_date);
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) return;
                if (getByServiceNumber(layerContainers[STREET_LIGHTS], data[index].service_request_number) != null) return;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo >= 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addStreetLightsMarkers(layerContainers[STREET_LIGHTS], index, data, layer, true);
            };
        });	
	}
	
    function addStreetLightsMarkers(layerContainer, dataIndex, data, layer, refresh) {
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: streetLightIcon,
                service_request_number : data[dataIndex].service_request_number
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))
        );//end .push
        //TODO change icon based on value of "status"
        if(refresh) layer.clearLayers();
        L.layerGroup(layerContainer.circles).addTo(layer);
        return null;
    };
	
	//helper functions
    function getByServiceNumber(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.service_request_number == number) return layer.circles[index];
        return null;
    };
/************End Street Lights Data Handling************/	

/************Divvy Data Handling************/		
	function addDivvyData(layerInfo, layer){
		layerContainers[DIVVY] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
		var sourceLink = layerInfo.sourceLink;
		d3.json(sourceLink, function(error, json){
            if (error) console.error(error);
            
			var data = json.query.results.json.stationBeanList;
			for (var index = 0; index < data.length; index++) {
			
				// filters
				if (data[index].statusValue == null) continue;
				var statusValue = data[index].statusValue;
				if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

				// add the circles
				outLine = layerInfo.color[statusValue];
				addDivvyMarkers(layerContainers[DIVVY], index, data, layer, false);
            };
		});
	};
	
	function refreshDivvyData(layerInfo, layer){
		var sourceLink = layerInfo.sourceLink;
		d3.json(sourceLink, function(error, json){
            if (error) console.error(error);
			
			var data = json.query.results.json.stationBeanList;
			for (var index = 0; index < data.length; index++) {
                
				// filters
                if (data[index].statusValue == null) continue;
				var statusValue = data[index].statusValue;
                if ( (getByStatusValue(layerContainers[DIVVY], data[index].statusValue) != null) &&
					(getByAvailableBikes(layerContainers[DIVVY], data[index].availableBikes) != null) &&
					(getByTotalDocks(layerContainers[DIVVY], data[index].totalDocks) != null ) ) return;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                outLine = layerInfo.color[statusValue];
                addDivvyMarkers(layerContainers[DIVVY], index, data, layer, true);
            };
		});
	}
	
    function addDivvyMarkers(layerContainer, dataIndex, data, layer, refresh) {
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: divvyStationIcon,
				totalDocks : data[dataIndex].totalDocks,
    			availableBikes : data[dataIndex].availableBikes,
    			statusValue : data[dataIndex].statusValue
            }
        ).bindPopup("<strong>Station Name:</strong> " + data[dataIndex]["stationName"] + "<br><strong>Status:</strong> " +
                data[dataIndex]["statusValue"] +"<br><strong>Occupied Docks / Total Docks: </strong>" + data[dataIndex]["availableBikes"] + 
                "/" + data[dataIndex]["totalDocks"])
        );//end .push
        //TODO change icon based on value of "statusValue"
        if(refresh) layer.clearLayers();
        L.layerGroup(layerContainer.circles).addTo(layer);
        return null;
    };
	
	//helper functions
   function getByStatusValue(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) 
            if(layer.circles[i].options.statusValue == number) return layer.circles[i];
        return null;
    };

	function getByAvailableBikes(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) 
            if(layer.circles[i].options.availableBikes == number) return layer.circles[i];
        return null;
    };
	
	function getByTotalDocks(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.totalDocks == number) return layer.circles[index];
        return null;
    };
/************End Divvy Data Handling************/		

/************Crime Data Handling************/
	function addCrimeData(layerInfo, layer){
		layerContainers[CRIME] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
       var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
                // filters
				var date = parseDate(data[index].date);
                if (date == null) continue;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
                var daysAgo = (new Date() - date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 14) outLine = layerInfo.color;
                addCrimeMarkers(layerContainers[CRIME], index, data, layer, false);
			};
        });
	};
	
	function refreshCrimeData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);
			
            for (var index = 0; index < data.length; index++) {
				// filters
                if (data[index].id == null) continue;
				var id = data[index].id;
                if ( getById(layersContainer[index], data[index].id) != null ) return;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                addCrimeMarkers(layerContainers[CRIME], index, data, layer, true);
            };
        });	
	};
	
    //helper function for adding crime data to map
    function addCrimeMarkers(layerContainer, dataIndex, data, layer, refresh) {
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: crimeIcon,
				id : data[dataIndex].id
            }
        ).bindPopup("<strong>Type:</strong> " + data[dataIndex]["primary_type"] + "<br><strong>Arrest:</strong> " +
                data[dataIndex]["arrest"] +"<br><strong>Location Description:</strong> " + data[dataIndex]["location_description"] + 
                "<br><strong>Date:</strong> " + data[dataIndex]["date"].substring(0,10) + "<br><strong>Updated On:</strong> " +
                data[dataIndex]["updated_on"])
        );//end .push
        //TODO maybe add details like the description and if it was domestic or not, case number, iucr, etc? either
        //in the popup or some sort of "show more"? or maybe we show some basic info on hover, and that+more on click/popup?
        if(refresh) layer.clearLayers();
        L.layerGroup(layerContainer.circles).addTo(layer);
        return null;
    };
	
	//helper functions
	function getById(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.id == number) return layer.circles[index];
        return null;
    };

/************End Crime Data Handling************/

/************CTA Data Handling************/	
	function addCTAData(layerInfo, layer){
		layerContainers[CTA] = 
		{
			link    : layerInfo.sourceLink,
			type    : layerInfo.type,
			circles : [],
			refresh : layerInfo.refresh,
			id      : layerInfo.id
		};
		
        var sourceLink = layerInfo.sourceLink;
		sourceLink.forEach(function(link){
			d3.json(link, function(error, json){
				if (error) console.error(error);
				
				var data = json.query.results['bustime-response'].vehicle;
				if(data){		
					for (var index = 0; index < data.length; index++){
						// filters
						if(data[index].vid === null) continue;
						if ( data[index]["lat"] == undefined || data[index]["lon"] == undefined) continue;
						
						// add the circles
						addCTAMarkers(layerContainers[CTA], index, data, layer, false);
					};
				};
			});
		});
	};	

    function refreshCTAData(layerInfo, index, layer){
	    var sourceLink = layerInfo.sourceLink;
		sourceLink.forEach(function(link){
			d3.json(link, function(error, json){
				if (error) console.error(error);
				
				var data = json.query.results['bustime-response'].vehicle;
				if(data){		
					for (var index = 0; index < data.length; index++) {
						// filters
						if(data[index].vid === null) continue;
						if ( getByLat(layersContainer[CTA], data[index].lat) != null && 
							 getByLon(layersContainer[CTA], data[index].lon) != null ) return;
						if ( data[index]["lat"] == undefined || data[index]["lon"] == undefined) continue;
						
						// add the circles
						addCTA(layerContainers[CTA], index, data, layer, true);
					};
				};
			});
		});
    };	
	
    //helper function for adding CTA data to map
    function addCTAMarkers(layerContainer, dataIndex, data, layer, refresh) {
		layerContainer.circles.push(
			L.marker([data[dataIndex]["lat"], data[dataIndex]["lon"]], 
			{
				icon: ctaIcon,
				lat : data[dataIndex].lat,
				lon : data[dataIndex].lon
			}
		)/*.bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
			"<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
			data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10) + 
			"<br><strong>Days Reported Parked:</strong> " + data[dataIndex]["how_many_days_has_the_vehicle_been_reported_as_parked_"])*/
		);//end .push
		//TODO change icon based on value of "status"
		//TODO do we want to put extra data like color, licenese plate, make/model? maybe under a "show more" tab/button, etc?
		if(refresh) layer.clearLayers();
		L.layerGroup(layerContainer.circles).addTo(layer);
		return null;
	};
	
	//helper functions
	function getByLat(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.lat == number) return layer.circles[index];
        return null;
    };

	function getByLon(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.lon == number) return layer.circles[index];
        return null;
    };
/************End CTA Data Handling************/	

    // function that filters by a simple rectangle
    function filterByShape(coordinates){
         var poly = {
            "type": "Polygon",
            "coordinates": coordinates
        };

        for (var q = 0; q < layersContainer.length; q++) {

            selectedDataPoints.push({
                link : layersContainer[q].sourceLink,
                type : layersContainer[q].type,
                circles : [],
                refresh : layersContainer[q].refresh,
                id : layersContainer[q].id
            });

            for (var i = 0; i < layersContainer[q].circles.length; i++) {
                var point = {
                    "type": "Point", 
                    "coordinates": [layersContainer[q].circles[i]._latlng.lng, layersContainer[q].circles[i]._latlng.lat]
                };

                if (!gju.pointInPolygon(point, poly)){
                    // this needs to be changed later!
                    layersContainer[q].circles[i].setOpacity(0);
                    //layersContainer[q].circles[i].setStyle({opacity: 0, fillOpacity:0});
                }
                else{
                    // create subset of the total circles to be later shown on map and sent to graphs
                    selectedDataPoints[q].circles.push(layersContainer[q].circles[i]);
                };
            };
        };

        cleanAndMakeGraphs();
    };

    // clean data of selectedDataPoints so that d3 can make graphs using D3Graphs object
    function cleanAndMakeGraphs(){
        var selectedData = [];
        var overallData = [];

        for (var i = 0; i < selectedDataPoints.length; i++) {
            selectedData.push(
            {
                label : selectedDataPoints[i].type,
                value : selectedDataPoints[i].circles.length
            });
        };

        for (var i = 0; i < layersContainer.length; i++) {
            overallData.push(
            {
                label : layersContainer[i].type,
                value : layersContainer[i].circles.length
            });
        };

        D3Graphs.clearAll();
        D3Graphs.makeOverallGraph(overallData, "label", "value");
        D3Graphs.makeSelectedGraph(selectedData, "label", "value");
    };

    DataCirclesObj.filterByShape = filterByShape;
	
	DataCirclesObj.addPotholesData = addPotholesData;
	DataCirclesObj.addAbandonedVehiclesData = addAbandonedVehiclesData;
	DataCirclesObj.addStreetLightsData = addStreetLightsData;
	DataCirclesObj.addDivvyData = addDivvyData;
	DataCirclesObj.addCrimeData = addCrimeData;
	DataCirclesObj.addCTAData = addCTAData;
	
	DataCirclesObj.refreshPotholesData = refreshPotholesData;
	DataCirclesObj.refreshAbandonedVehiclesData = refreshAbandonedVehiclesData;
	DataCirclesObj.refreshStreetLightsData = refreshStreetLightsData;
	DataCirclesObj.refreshDivvyData = refreshDivvyData;
	DataCirclesObj.refreshCrimeData = refreshCrimeData;
	DataCirclesObj.refreshCTAData = refreshCTAData;
	
    return DataCirclesObj;
};