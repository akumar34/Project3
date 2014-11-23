// Data circles obj
function DataCircles() {
	var POTHOLES = 0;
	var ABANDONED_VEHICLES = 1;
	var STREET_LIGHTS = 2;
	var DIVVY = 3;
	var CRIME = 4;
	var CTA = 5;
	var FOOD_INSPECTION = 6;

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
	layerContainers[FOOD_INSPECTION] = {};
	
	//markers hashmap for cta bus tracking markers
	var markers = [];
	
    //custom markers
    //pothole
    var potholeIcon = L.icon({
        iconUrl: 'icons/svg/marker_pothole_sized_new.svg',//pothole_sized.svg',
        iconSize:     [60, 90],//must be of ratio 1:1.5 because our icons
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90]
    });//end pothole

    //abandoned vehicles
    var abandonedVehicleIcon = L.icon({
        iconUrl: 'icons/svg/marker_car_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90] 
    });//end abandoned vehicles

    //divvy stations
    var divvyStationIcon = L.icon({
        iconUrl: 'icons/svg/marker_divvy2_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90]
    });//end divvy station

    //street lights
    var streetLightIcon = L.icon({
        iconUrl: 'icons/svg/marker_light_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90] 
    });//end street lights

    //crimes
    var crimeIcon = L.icon({
        iconUrl: 'icons/svg/marker_crime_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90] 
    });//end crimes

    //CTA
    var ctaIcon = L.icon({
        iconUrl: 'icons/svg/marker_cta_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90]
    });//end CTA
	//crimes
    var foodInspectionIcon = L.icon({
        iconUrl: 'icons/svg/marker_crime_sized_new.svg',
        iconSize:     [60, 90],
        iconAnchor:   [30, 90],
        popupAnchor:  [0, -90] 
    });//end crimes
    //end custom markers

/************Potholes Data Handling************/
	function addPotholesData(layerInfo, layer){
		layerContainers[POTHOLES] = 
		{
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            weekOld      : [],
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
        };
		
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;

					// add the circles
					var outLine = "black";
					if (daysAgo > 7) outLine = layerInfo.color;
					if (data[index].status.indexOf("completed") > -1) outLine = "white";
					addPotholesMarkers(layerContainers[POTHOLES], index, data, layer, false);
				};
			});
		});
	};
	
	function refreshPotholesData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;      		
					if (getByServiceNumber(layerContainers[POTHOLES], data[index].service_request_number) != null) continue;
					
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
		});
	}

    //helper function for adding potholes to map
    function addPotholesMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing pothole");
		else console.log("adding pothole");
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: potholeIcon,
                service_request_number : data[dataIndex].service_request_number,
				date: data[dataIndex].creation_date
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))//because time at end is always uselessly zeroed
        );//end .push

        //TODO change icon based on value of "status"
        
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        // add marker to set that contains week old stuff
        var daysAgo = getDaysAgo(data[dataIndex].creation_date);
        if (daysAgo <= 7) {
            layerContainer.weekOld.push(newMarker); 
        };
        // check to see if the new marker is inside the drawn shapes, if any
        if (isInShapes(newMarker)) {
            selectedDataPoints[POTHOLES].circles.push(newMarker);
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
            weekOld      : [],
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
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					
					// add the circles
					var outLine = "black";
					if (daysAgo > 7) outLine = layerInfo.color;
					if (data[index].status.indexOf("completed") > -1) outLine = "white";
					addAbandonedVehiclesMarkers(layerContainers[ABANDONED_VEHICLES], index, data, layer, false);
				};
			});
		});
	};

	function refreshAbandonedVehiclesData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					// filters

					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					if (getByServiceNumber(layerContainers[ABANDONED_VEHICLES], data[index].service_request_number) != null) continue;
					
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
		});
	};
	
	//helper function for adding abandoned vehicle data to map
    function addAbandonedVehiclesMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing aband vehicles");
		else console.log("adding aband vehicles");
		
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: abandonedVehicleIcon,
                service_request_number : data[dataIndex].service_request_number,
				date: data[dataIndex].creation_date
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10) + 
            "<br><strong>Days Reported Parked:</strong> " + data[dataIndex]["how_many_days_has_the_vehicle_been_reported_as_parked_"])
        );//end .push
        //TODO change icon based on value of "status"
        //TODO do we want to put extra data like color, licenese plate, make/model? maybe under a "show more" tab/button, etc?

        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        // add marker to set that contains week old stuff
        var daysAgo = getDaysAgo(data[dataIndex].creation_date);
        if (daysAgo <= 7) {
            layerContainer.weekOld.push(newMarker); 
        };
        // check to see if the new marker is inside the drawn shapes, if any
        if (isInShapes(newMarker)) {
            selectedDataPoints[ABANDONED_VEHICLES].circles.push(newMarker);
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
            weekOld      : [],
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
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					
					// add the circles
					var outLine = "black";
					if (daysAgo > 7) outLine = layerInfo.color;
					if (data[index].status.indexOf("completed") > -1) outLine = "white";
					addStreetLightsMarkers(layerContainers[STREET_LIGHTS], index, data, layer, false);
				};
			});
		});
	};
	
	function refreshStreetLightsData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].creation_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					if (getByServiceNumber(layerContainers[STREET_LIGHTS], data[index].service_request_number) != null) continue;
					
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
		});
	}
	
    function addStreetLightsMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing street lights");
		else console.log("adding street lights");
		
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: streetLightIcon,
                service_request_number : data[dataIndex].service_request_number,
				date: data[dataIndex].creation_date
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))
        );//end .push
        //TODO change icon based on value of "status"
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        // add marker to set that contains week old stuff
        var daysAgo = getDaysAgo(data[dataIndex].creation_date);
        if (daysAgo <= 7) {
            layerContainer.weekOld.push(newMarker); 
        };
        // check to see if the new marker is inside the drawn shapes, if any
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
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, json){
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
		});
	};
	
	function refreshDivvyData(layerInfo, layer){
		var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, json){
				if (error) console.error(error);
				
				var data = json.query.results.json.stationBeanList;
				for (var index = 0; index < data.length; index++) {
					
					// filters
					if (data[index].statusValue == null) continue;
					var statusValue = data[index].statusValue;
					if ( (getByStatusValue(layerContainers[DIVVY], data[index].statusValue) != null) &&
						(getByAvailableBikes(layerContainers[DIVVY], data[index].availableBikes) != null) &&
						(getByTotalDocks(layerContainers[DIVVY], data[index].totalDocks) != null ) ) continue;
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;

					// add the circles
					outLine = layerInfo.color[statusValue];
					addDivvyMarkers(layerContainers[DIVVY], index, data, layer, true);
				};
			});
		});
	}
	
    function addDivvyMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing divvy");
		else console.log("adding divvy");
		
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
            weekOld      : [],
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
	   sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					
					// add the circles
					var outLine = "black";
					if (daysAgo > 14) outLine = layerInfo.color;
					addCrimeMarkers(layerContainers[CRIME], index, data, layer, false);
				};
			});
		});
	};
	
	function refreshCrimeData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);
				
				for (var index = 0; index < data.length; index++) {
					// filters

					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					if (data[index].id == null) continue;
					var id = data[index].id;
					var daysAgo = getDaysAgo(data[index].date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					if ( getById(layerContainers[CRIME], data[index].id) != null ) continue;

					// add the circles
					if (daysAgo > 14) outLine = layerInfo.color;
					addCrimeMarkers(layerContainers[CRIME], index, data, layer, true);
				};

				var selectedLayer = selectedDataPoints[CRIME].controlLayer;
				selectedLayer.clearLayers();
				L.layerGroup(selectedDataPoints[CRIME].circles).addTo(selectedLayer);
			});	
		});
	};
	
    //helper function for adding crime data to map
    function addCrimeMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing crime");
		else console.log("adding crime");
		
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: crimeIcon,
				id : data[dataIndex].id,
				date: data[dataIndex].date,
				crimeType: data[dataIndex].primary_type
            }
        ).bindPopup("<strong>Type:</strong> " + data[dataIndex]["primary_type"] + "<br><strong>Arrest:</strong> " +
                data[dataIndex]["arrest"] +"<br><strong>Location Description:</strong> " + data[dataIndex]["location_description"] + 
                "<br><strong>Date:</strong> " + data[dataIndex]["date"].substring(0,10) + "<br><strong>Updated On:</strong> " +
                data[dataIndex]["updated_on"])
        );//end .push
        //TODO maybe add details like the description and if it was domestic or not, case number, iucr, etc? either
        //in the popup or some sort of "show more"? or maybe we show some basic info on hover, and that+more on click/popup?
        
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        // add marker to set that contains week old stuff
        var daysAgo = getDaysAgo(data[dataIndex].date);
        if (daysAgo <= 14) {
            layerContainer.weekOld.push(newMarker); 
        };
        // check to see if the new marker is inside the drawn shapes, if any
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
	function getDaysAgo(date) { 
		if(date === null) return null;
		var dateObj = parseDate(date);
		return ( (new Date() - dateObj) / 1000 / 60 / 60 / 24 ); 
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

				var results = json.query.results['bustime-response'];		
				//if (results.error) console.error(results.error);
				var data = results.vehicle;
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
				var results = json.query.results['bustime-response'];		
				//if (results.error) console.error(results.error);
				var data = results.vehicle;
				if(data){		
					for (var index = 0; index < data.length; index++) {
						// filters
						if(data[index].vid === null) continue;
						//if ( getByLat(layerContainers[CTA], data[index].lat) != null && 
						//	 getByLon(layerContainers[CTA], data[index].lon) != null ) continue;
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
		if(refresh) console.log("refreshing cta");
		else console.log("adding cta");
		
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

		var latitude = data[dataIndex]["lat"];
		var longitude = data[dataIndex]["lon"];
		
		var marker = markers[data[dataIndex].vid];
		if(marker === undefined || marker === null){
            marker = L.marker(
				[latitude, longitude], 
				{
					icon	: ctaIcon,
					vid 	: data[dataIndex].vid
				}
			).bindPopup("<strong>Route: </strong>" + data[dataIndex].rt + "<br><strong>Destination: </strong>" + data[dataIndex].des +
				"<br><strong>Heading: </strong>" + busHeading + " (" + data[dataIndex].hdg + "&deg)" + "<br><strong>Lat, Lon: </strong>" +
				data[dataIndex].lat + ", " + data[dataIndex].lon + "<br><strong>Delayed: </strong>" + busDelayed +
				"<br><strong>Vehicle ID: </strong>" + data[dataIndex].vid + "<br><strong>Last Update: </strong>" +
				data[dataIndex].tmstmp.substring(0,4) + "-" + data[dataIndex].tmstmp.substring(4,6) + "-" + data[dataIndex].tmstmp.substring(6,8) +
				" " + data[dataIndex].tmstmp.substring(9,14));
				
			markers[data[dataIndex].vid] = marker;
			layerContainer.circles.push(marker);

		} else {
			marker.setLatLng([latitude, longitude]).update();
		}

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

/************Food Inspection Data Handling************/
	function addFoodInspectionData(layerInfo, layer){
		layerContainers[FOOD_INSPECTION] = 
		{
			link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            weekOld      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer
		};

        selectedDataPoints[FOOD_INSPECTION] =
        {
            link         : layerInfo.sourceLink,
            type         : layerInfo.type,
            circles      : [],
            refresh      : layerInfo.refresh,
            id           : layerInfo.id,
            controlLayer : layer,
        };
		
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].inspection_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;
					
					// add the circles
					var outLine = "black";
					if (daysAgo > 7) outLine = layerInfo.color;
					addFoodInspectionMarkers(layerContainers[FOOD_INSPECTION], index, data, layer, false);
				};
			});
		});
	};
	
	function refreshFoodInspectionData(layerInfo, layer){
        var sourceLink = layerInfo.sourceLink;
	    sourceLink.forEach(function(link){
			d3.json(link, function(error, data){
				if (error) console.error(error);

				for (var index = 0; index < data.length; index++) {
					if(data[index].status === "STATUS") continue;
					
					// filters
					if ( data[index]["latitude"] == undefined || data[index]["longitude"] == undefined) continue;
					var daysAgo = getDaysAgo(data[index].inspection_date);
					if(daysAgo === null) continue;
					if (daysAgo > 31) break;                
					if (getByInspectionId(layerContainers[FOOD_INSPECTION], data[index].inspection_id) != null) continue;
					// add the circles
					var outLine = "black";
					if (daysAgo > 7) outLine = layerInfo.color;
					
					// needs rework we are always adding markers, filters are not working
					// addFoodInspectionMarkers(layerContainers[FOOD_INSPECTION], index, data, layer, true);
				};

				var selectedLayer = selectedDataPoints[FOOD_INSPECTION].controlLayer;
				selectedLayer.clearLayers();
				L.layerGroup(selectedDataPoints[FOOD_INSPECTION].circles).addTo(selectedLayer);
			});	
		});
	}

    //helper function for adding food inspection to map
    function addFoodInspectionMarkers(layerContainer, dataIndex, data, layer, refresh) {
		if(refresh) console.log("refreshing food inspection");
		else console.log("adding food inspection");
		
        layerContainer.circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: foodInspectionIcon,
                inspection_id : data[dataIndex].inspection_id,
				date: data[dataIndex].inspection_date
            }
        ).bindPopup("<strong>Name:</strong> " + data[dataIndex]["aka_name"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["address"] + "<br><strong>Risk:</strong> " +
            data[dataIndex]["risk"] + "<br><strong>Results:</strong> " + data[dataIndex]["results"] + "<br><strong>Type:</strong> " + data[dataIndex]["facility_type"] + "<br><strong>Inspection Date:</strong> " + data[dataIndex]["inspection_date"].substring(0,10))//because time at end is always uselessly zeroed
        );//end .push
        //TODO change icon based on value of "status"
        
        var newMarker = layerContainer.circles[layerContainer.circles.length - 1];
        // add marker to set that contains week old stuff
        var daysAgo = getDaysAgo(data[dataIndex].inspection_date);
        if (daysAgo <= 7) {
            layerContainer.weekOld.push(newMarker); 
        };
        // check to see if the new marker is inside the drawn shapes, if any
        if (isInShapes(newMarker)) {
            selectedDataPoints[FOOD_INSPECTION].circles.push(newMarker);
            // debug
            // console.log("Marker was added to the section");
        };
    };
	
	//helper functions
	function getByInspectionId(layer, number) {
        for (var index = 0; index < layer.circles.length; index++)
            if(layer.circles[index].options.inspection_id == number) return layer.circles[index];
        return null;
    };
/************End Food Inspection Data Handling************/

    // function that filters by a simple rectangle
    function filterByShape(coordinates, add, weekFilter){
        var poly = {
            "type": "Polygon",
            "coordinates": coordinates
        };

        var markersToUse = 'circles';
        if (weekFilter) 
            markersToUse = 'weekOld';
        var origToUse = markersToUse;

        for (var q = 0; q < layerContainers.length; q++) {
            if (q == CTA || q == DIVVY)
                markersToUse = 'circles';
            else
                markersToUse = origToUse;

            for (var i = 0; i < layerContainers[q][markersToUse].length; i++) {
                var point = {
                    "type": "Point", 
                    "coordinates": [layerContainers[q][markersToUse][i]._latlng.lng, layerContainers[q][markersToUse][i]._latlng.lat]
                };

                // if the point is in the polygon add it or remove it
                if (gju.pointInPolygon(point, poly)){
                    var index = containsCircle(selectedDataPoints[q].circles, layerContainers[q][markersToUse][i]);
                    // create subset of the total circles to be later shown on map and sent to graphs
                    if (add && index < 0) {
                        selectedDataPoints[q].circles.push(layerContainers[q][markersToUse][i]);
                    }
                    // remove subset of circles
                    else if (!add && index >= 0){
                        selectedDataPoints[q].circles.splice(index, 1);
                    };
                };
            };     
        };

        if (!add){
            D3Graphs.clearAll();
        }
        else{  
            cleanAndMakeGraphs();
        };

        clearLayerControls();
        addSelectedToControl();
    };

    // functions that checks if a marker is inside a circle
    function filterByCircle(circleObj, add, weekFilter){
        var markersToUse = 'circles';
        if (weekFilter) 
            markersToUse = 'weekOld';
        var origToUse = markersToUse;

        for (var i = 0; i < layerContainers.length; i++) {
            if (i == CTA || i == DIVVY)
                markersToUse = 'circles';
            else
                markersToUse = origToUse;

            for (var m = 0; m < layerContainers[i][markersToUse].length; m++) {
                var point = {
                    "type": "Point", 
                    "coordinates": [layerContainers[i][markersToUse][m]._latlng.lng, layerContainers[i][markersToUse][m]._latlng.lat]
                };

                if (pointInCircle(circleObj.center, circleObj.radius, point)) {

                    var index = containsCircle(selectedDataPoints[i].circles, layerContainers[i][markersToUse][m]);
                    // create subset of the total circles to be later shown on map and sent to graphs
                    if (add && index < 0) 
                        selectedDataPoints[i].circles.push(layerContainers[i][markersToUse][m]);
                    // remove subset of circles
                    else if (!add && index >= 0){
                        selectedDataPoints[i].circles.splice(index, 1);
                    };
                };
            };
        };

        if (!add){
            D3Graphs.clearAll();
        }
        else{  
            cleanAndMakeGraphs();
        };

        clearLayerControls();
        addSelectedToControl();
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

    function clearLayerControls(){
        for (var i = 0; i < selectedDataPoints.length; i++) {
            var layer = selectedDataPoints[i].controlLayer;
            layer.clearLayers();
        };
    };

	function formatData(data, daysAgoThresholds, target, source){
		var graphData = [];
		
		var totals = {};
		totals.recent = [];
		totals.old = [];
		
		for(var index = 0; index < data.length; index++){
			var point = data[index];
			var totalCircles = point.circles.length;

			for(var circleIndex = 0; circleIndex < totalCircles; circleIndex++){
				var circle = point.circles[circleIndex];
				var targetObject;
				if(source === "data") targetObject = data[index][target];
				else targetObject = circle.options[target];
                var daysAgo = getDaysAgo(circle.options.date);
				if(daysAgo > daysAgoThresholds[point.type]){
					if(totals.old[targetObject] === undefined || totals.old[targetObject] === null) 
						totals.old[targetObject] = 0;
					totals.old[targetObject]++;
					continue
				} 
				if(totals.recent[targetObject] === undefined || totals.recent[targetObject] === null) 
					totals.recent[targetObject] = 0;
				totals.recent[targetObject]++;
			}			
		}
		
		var candidateTotals = [];
		for(var recent in totals.recent) candidateTotals.push(recent);
		for(var old in totals.old){
			if(totals.recent[old] != undefined) continue;
			if(totals.recent[old] != null) continue;
			candidateTotals.push(old);
		}
		
		for(var candidate in candidateTotals){
			var old = totals.old[candidateTotals[candidate]];
			var recent = totals.recent[candidateTotals[candidate]];
			
			if(old === undefined || old === null) old = 0;
			if(recent === undefined || recent === null) recent = 0;
			
			graphData.push({
				type		: candidateTotals[candidate],
				total		: (old + recent),
				recent	: recent,
				old 	: old
			});		
		}
		
		return graphData;
	};

    function extractData(datasets, daysAgoThresholds, target, source){
		var selected = [];
		var overall = [];
		
		for(var dataset in datasets){
			selected.push(selectedDataPoints[datasets[dataset]]);
			overall.push(layerContainers[datasets[dataset]]);
		}
		var data = [
			formatData(selected, daysAgoThresholds, target, source),
			formatData(overall, daysAgoThresholds, target, source)
		];
		return data;
    };
	
	function makeStackedAndGroupedBarGraph(data, title){
		var selectedAndOverallData = [];
		var SELECTED = 0;
		var OVERALL = 1;
		
		for(var index = 0; index < data[0].length; index++){	
			selectedAndOverallData.push({
				selectedRecent	: data[SELECTED][index].recent,
				selectedOld		: data[SELECTED][index].old,
				overallRecent	: data[OVERALL][index].recent,
				overallOld		: data[OVERALL][index].old,
				type			: data[OVERALL][index].type
			});
		}
		
		var columns = {
		  "column1" : ["overallRecent","overallOld"],
		  "column2" : ["selectedRecent","selectedOld"]
		};
		
		D3Graphs.makeStackedAndGroupedBarGraph(selectedAndOverallData, columns, title);
	};
	
	function cleanAndMakeGraphs(){
		var datasets;
		var data;
		var daysAgoThresholds = [];
		
		D3Graphs.clearAll();
		
		datasets = [POTHOLES,ABANDONED_VEHICLES,STREET_LIGHTS,CRIME];
		daysAgoThresholds['Potholes'] = 7;
		daysAgoThresholds['Abandoned Vehicles'] = 7;
		daysAgoThresholds['Street Lights'] = 7;
		daysAgoThresholds['Crime'] = 14;
		
		data = extractData(datasets, daysAgoThresholds, "type", "data");
		makeStackedAndGroupedBarGraph(data, '311 Bar Chart');
		
		datasets = [CRIME];
		daysAgoThresholds = [];
		daysAgoThresholds['Crime'] = 14;
		data = extractData(datasets, daysAgoThresholds, "crimeType", "circle");
		makeStackedAndGroupedBarGraph(data, 'Crime Dist. Bar Chart');
	};

    // function that checks is a data point that was added is inside a shape
    // data point in our case is a circle object marker thing
    function isInShapes (dataPoint){
        var point = {
            "type": "Point", 
            "coordinates": [dataPoint._latlng.lng, dataPoint._latlng.lat]
        };

        for (var x in shapes) {
            if (shapes[x].type == "circle") {
                if (pointInCircle(shapes[x].center, shapes[x].radius, point))
                    return true;

                continue;
            };

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

    // check to see if point is in circle
    // redo this using latlng distance to method!
    function pointInCircle(circleCenter, circleRadius, point) {
        var lat1 = circleCenter.lat;
        var lng1 = circleCenter.lng;
        var lat2 = point.coordinates[1];
        var lng2 = point.coordinates[0];
        var distance = measureDistance(lat1, lng1, lat2, lng2);
        
        if (distance <= circleRadius) return true;

        return false;
    };

    // helper function thanks to stackoverflow
    // http://stackoverflow.com/a/11172685
    function measureDistance(lat1, lon1, lat2, lon2){  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    };

    DataCirclesObj.filterByShape = filterByShape;
    DataCirclesObj.filterByCircle = filterByCircle;
	
	DataCirclesObj.addPotholesData = addPotholesData;
	DataCirclesObj.addAbandonedVehiclesData = addAbandonedVehiclesData;
	DataCirclesObj.addStreetLightsData = addStreetLightsData;
	DataCirclesObj.addDivvyData = addDivvyData;
	DataCirclesObj.addCrimeData = addCrimeData;
	DataCirclesObj.addCTAData = addCTAData;
	DataCirclesObj.addFoodInspectionData = addFoodInspectionData;
	
	DataCirclesObj.refreshPotholesData = refreshPotholesData;
	DataCirclesObj.refreshAbandonedVehiclesData = refreshAbandonedVehiclesData;
	DataCirclesObj.refreshStreetLightsData = refreshStreetLightsData;
	DataCirclesObj.refreshDivvyData = refreshDivvyData;
	DataCirclesObj.refreshCrimeData = refreshCrimeData;
	DataCirclesObj.refreshCTAData = refreshCTAData;
	DataCirclesObj.refreshFoodInspectionData = refreshFoodInspectionData;
	
    return DataCirclesObj;
};