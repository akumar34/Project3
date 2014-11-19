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
    selectedDataPoints = [];

    // make this private after testing
	layerContainers = [];
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
    iconUrl: 'icons/svg/bus.svg',
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
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[POTHOLES] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer,
			recentData	 : 0,
			oldData		 : 0
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
                if (daysAgo > 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
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
                if (daysAgo > 31) break;
                if (getByServiceNumber(layerContainers[POTHOLES], data[index].service_request_number) != null) break;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addPotholesMarkers(layerContainers[POTHOLES], index, data, layer, true);

            };

            var selectedLayer = selectedDataPoints[POTHOLES].controlLayer;
            selectedLayer.clearLayers();
            L.layerGroup(selectedDataPoints[POTHOLES].circles).addTo(selectedLayer);
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
        
        // check to see if the new marker is inside the drawn shapes, if any
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        if (isInShapes(newMarker)) {
            selectedDataPoints[POTHOLES].circles.push(newMarker);
            // debug
            console.log("Marker was added to the section");
        };
    };
/************End Potholes Data Handling************/

/************Abandoned Vehicles Data Handling************/
	function addAbandonedVehiclesData(layerInfo, layer){
		layerContainers[ABANDONED_VEHICLES] = 
		{
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[ABANDONED_VEHICLES] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
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
                if (daysAgo > 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
				addAbandonedVehiclesMarkers(layerContainers[ABANDONED_VEHICLES], index, data, layer, false);
            };
        });
	};

	function refreshAbandonedVehiclesData(layerInfo, layer){
        console.log("refresh");
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(error, data){
            if (error) console.error(error);

            for (var index = 0; index < data.length; index++) {
                // filters
                if (data[index].creation_date == null) continue;
				var creation_date = parseDate(data[index].creation_date);
                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo > 31) break;
                if (getByServiceNumber(layerContainers[ABANDONED_VEHICLES], data[index].service_request_number) != null) break;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addAbandonedVehiclesMarkers(layerContainers[ABANDONED_VEHICLES], index, data, layer, true);
            };

            // temp way to refresh when updating
            var selectedLayer = selectedDataPoints[ABANDONED_VEHICLES].controlLayer;
            selectedLayer.clearLayers();
            L.layerGroup(selectedDataPoints[ABANDONED_VEHICLES].circles).addTo(selectedLayer);
        });	
	};
	
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

        // check to see if the new marker is inside the drawn shapes, if any
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        if (isInShapes(newMarker)) {
            selectedDataPoints[ABANDONED_VEHICLES].circles.push(newMarker);
            // debug
            console.log("Marker was added to the section");
        };
    };	
/************End Abandoned Vehicles Data Handling************/

/************Street Lights Data Handling************/	
	function addStreetLightsData(layerInfo, layer){
		layerContainers[STREET_LIGHTS] = 
		{
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[STREET_LIGHTS] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
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
                if (daysAgo > 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
				addStreetLightsMarkers(layerContainers[STREET_LIGHTS], index, data, layer, false);
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
                if (daysAgo > 31) break;
                if (getByServiceNumber(layerContainers[STREET_LIGHTS], data[index].service_request_number) != null) break;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "black";
                if (daysAgo > 7) outLine = layerInfo.color;
                if (data[index].status.indexOf("completed") > -1) outLine = "white";
                addStreetLightsMarkers(layerContainers[STREET_LIGHTS], index, data, layer, true);
            };

            var selectedLayer = selectedDataPoints[STREET_LIGHTS].controlLayer;
            selectedLayer.clearLayers();
            L.layerGroup(selectedDataPoints[STREET_LIGHTS].circles).addTo(selectedLayer);
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
        
        // check to see if the new marker is inside the drawn shapes, if any
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        if (isInShapes(newMarker)) {
            selectedDataPoints[STREET_LIGHTS].circles.push(newMarker);
            // debug
            console.log("Marker was added to the section");
        };
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
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[DIVVY] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
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
        
        // we should only show the data on the map when a polygon is drawn
        // if(refresh) layer.clearLayers();
        // L.layerGroup(layerContainer.circles).addTo(layer);
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
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[CRIME] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
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
                if (daysAgo > 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo > 14) outLine = layerInfo.color;
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
                if ( getById(layerContainers[CRIME], data[index].id) != null ) break;
                if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

                // add the circles
                addCrimeMarkers(layerContainers[CRIME], index, data, layer, true);
            };

            var selectedLayer = selectedDataPoints[CRIME].controlLayer;
            selectedLayer.clearLayers();
            L.layerGroup(selectedDataPoints[CRIME].circles).addTo(selectedLayer);
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
        
        // check to see if the new marker is inside the drawn shapes, if any
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        if (isInShapes(newMarker)) {
            selectedDataPoints[CRIME].circles.push(newMarker);
            // debug
            console.log("Marker was added to the section");
        };
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
			link         : layerInfo.sourceLink,
			type         : layerInfo.type,
			circles      : [],
			refresh      : layerInfo.refresh,
			id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[CTA] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
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

    function refreshCTAData(layerInfo, layer){
	    var sourceLink = layerInfo.sourceLink;
		sourceLink.forEach(function(link){
			d3.json(link, function(error, json){
				if (error) console.error(error);
				
				var data = json.query.results['bustime-response'].vehicle;
				if(data){		
					for (var index = 0; index < data.length; index++) {
						// filters
						if(data[index].vid === null) continue;
						if ( getByLat(layerContainers[CTA], data[index].lat) != null && 
							 getByLon(layerContainers[CTA], data[index].lon) != null ) return;
						if ( data[index]["lat"] == undefined || data[index]["lon"] == undefined) continue;
						
						// add the circles
						addCTAMarkers(layerContainers[CTA], index, data, layer, true);
					};
				};
			});
		});
    };	
	
    //helper function for adding CTA data to map
    function addCTAMarkers(layerContainer, dataIndex, data, layer, refresh) {
		//parse heading into N, NE, E, SE, S, SW, W, NW directions
        var busHeading = "SOMEWHERE ON EARTH...?";
        if((data[dataIndex].hdg >= 337.5) || (data[dataIndex].hdg <= 22.5)) {
            busHeading = "N";
        } else if((data[dataIndex].hdg > 22.5) && (data[dataIndex].hdg < 67.5)) {
            busHeading = "NE";
        } else if((data[dataIndex].hdg >= 67.5) && (data[dataIndex].hdg <= 112.5)) {
            busHeading = "E";
        } else if((data[dataIndex].hdg > 112.5) && (data[dataIndex].hdg < 157.5)) {
            busHeading = "SE";
        } else if((data[dataIndex].hdg >= 157.5) && (data[dataIndex].hdg <= 202.5)) {
            busHeading = "S";
        } else if((data[dataIndex].hdg > 202.5) && (data[dataIndex].hdg < 247.5)) {
            busHeading = "SW";
        } else if((data[dataIndex].hdg >= 247.5) && (data[dataIndex].hdg <= 292.5)) {
            busHeading = "W";
        } else if((data[dataIndex].hdg > 292.5) && (data[dataIndex].hdg < 337.5)) {
            busHeading = "NW";
        }//end parsing heading into 8 basic compass directions

        //delayed might or might not be undefined, handle accordingly
        var busDelayed = "(probably, it's Chicago)";
        if(data[dataIndex].dly == "true") {
            busDelayed = "YES";
        }

        //actually create the marker
        layerContainer.circles.push(
			L.marker([data[dataIndex]["lat"], data[dataIndex]["lon"]], 
			{
				icon: ctaIcon,
				lat : data[dataIndex].lat,
				lon : data[dataIndex].lon
			}
		).bindPopup("<strong>Route: </strong>" + data[dataIndex].rt + "<br><strong>Destination: </strong>" + data[dataIndex].des +
            "<br><strong>Heading: </strong>" + busHeading + " (" + data[dataIndex].hdg + "&deg)" + "<br><strong>Lat, Lon: </strong>" +
            data[dataIndex].lat + ", " + data[dataIndex].lon + "<br><strong>Delayed: </strong>" + busDelayed +
            "<br><strong>Vehicle ID: </strong>" + data[dataIndex].vid + "<br><strong>Last Update: </strong>" +
            data[dataIndex].tmstmp.substring(0,4) + "-" + data[dataIndex].tmstmp.substring(4,6) + "-" + data[dataIndex].tmstmp.substring(6,8) +
            " " + data[dataIndex].tmstmp.substring(9,14))
        /*.bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
			"<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
			data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10) + 
			"<br><strong>Days Reported Parked:</strong> " + data[dataIndex]["how_many_days_has_the_vehicle_been_reported_as_parked_"])*/
		);//end .push
		//TODO change icon based on value of "status"
		//TODO do we want to put extra data like color, licenese plate, make/model? maybe under a "show more" tab/button, etc?
		
        // we should only show the data points when the polygon is drawn
        // if(refresh) layer.clearLayers();
		// L.layerGroup(layerContainer.circles).addTo(layer);
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
    function filterByShape(coordinates, add){
        var poly = {
            "type": "Polygon",
            "coordinates": coordinates
        };

        for (var q = 0; q < layerContainers.length; q++) {
            for (var i = 0; i < layerContainers[q].circles.length; i++) {
                var point = {
                    "type": "Point", 
                    "coordinates": [layerContainers[q].circles[i]._latlng.lng, layerContainers[q].circles[i]._latlng.lat]
                };

                // if the point is in the polygon add it or remove it
                if (gju.pointInPolygon(point, poly)){
                    var index = containsCircle(selectedDataPoints[q].circles, layerContainers[q].circles[i]);
                    // create subset of the total circles to be later shown on map and sent to graphs
                    if (add && index < 0) 
                        selectedDataPoints[q].circles.push(layerContainers[q].circles[i]);
                    // remove subset of circles
                    else if (!add && index >= 0){
                        selectedDataPoints[q].circles.splice(index, 1);
                    }
                };
            };     
        };

        if (!add)
            revomeSelectedFromControl();

        addSelectedToControl();
        cleanAndMakeGraphs();
    };

    // helper function
    function containsCircle(circleArray,circle) {
        for (var c = 0; c < circleArray.length; c++) {
            if (circleArray[c] === circle)
                return c
        };

        return -1;
    };

    function addSelectedToControl(){
        for (var i = 0; i < selectedDataPoints.length; i++) {
            var layer = selectedDataPoints[i].controlLayer;
            L.layerGroup(selectedDataPoints[i].circles).addTo(layer);
        };
    };

    function revomeSelectedFromControl(){
        for (var i = 0; i < selectedDataPoints.length; i++) {
            var layer = selectedDataPoints[i].controlLayer;
            layer.clearLayers();
        };
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

        for (var i = 0; i < layerContainers.length; i++) {
            overallData.push(
            {
                label : layerContainers[i].type,
                value : layerContainers[i].circles.length
            });
        };

        D3Graphs.clearAll();
        D3Graphs.makeOverallGraph(overallData, "label", "value");
        D3Graphs.makeSelectedGraph(selectedData, "label", "value");
    };

    // function that checks is a data point that was added is inside a shape
    // data point in our case is a circle object marker thing
    function isInShapes (dataPoint){
        var point = {
            "type": "Point", 
            "coordinates": [dataPoint._latlng.lng, dataPoint._latlng.lat]
        };

        for (var x in shapes) {
            var coordinatesArray = shapes[x].latlngs;
            var coordinates = [];

            for (var i = 0; i < coordinatesArray.length; i++) {
                coordinates.push([coordinatesArray[i].lng, coordinatesArray[i].lat]);
            };

            var poly = {
            "type": "Polygon",
            "coordinates": coordinates
            };

            if (gju.pointInPolygon(point, poly))
                return true;
        };

        return false;
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