// Data circles obj
function DataCircles() {
    var DataCirclesObj = new Object();
   
    // make this private after testing
    layersContainer = [];
    
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

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
    //end custom markers

  // add layers of data
    function addLayers(layersInfo, layers){
        for (var i = 0; i < layersInfo.length; i++) {
            
            layersContainer.push({
                link : layersInfo[i].sourceLink,
                type : layersInfo[i].nameType,
                circles : [],
				refresh : layersInfo[i].refresh
            });

            // add circleMarkers to the layers
            var index = layersContainer.length - 1;
			
			switch(layersInfo[i].type){
				case "Divvy":
					addDivvyData(layersInfo[i], index, layers[i]);
					break;
				case "Crime":
					addCrimeData(layersInfo[i], index, layers[i]);
					break;				
				default:
					addData(layersInfo[i], index, layers[i]);
					break;
			}					
        } 
    };
	
	    // add layers of data
    function refreshLayers(layersInfo, layers){
        for (var i = 0; i < layersInfo.length; i++) {
            // refresh circleMarkers to the layers
            var index = layersContainer.length - 1;
			
			switch(layersInfo[i].type){
				case "Divvy":
					refreshDivvyData(layersInfo[i], index, layers[i]);
					break;
				case "Crime":
					refreshCrimeData(layersInfo[i], index, layers[i]);
					break;					
				default:
					refreshData(layersInfo[i], index, layers[i]);
					break;
			}	
        } 
    };

    // function filterByShapes()

    //for non-divvy and non-crime data
    //currently means potholes, street lights, and abandoned vehicles
    function addData(layerInfo, index, layers){
        var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, data){
            if (error) {
                console.error(error);
            };

            for (var i = 0; i < data.length; i++) {
				if(data[i].status === "STATUS"){
					refreshIndex = i + 1;
					continue;
				}
                // filters
				var creation_date = parseDate(data[i].creation_date);
                if (creation_date == null) continue;

                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7)
                    outLine = layerInfo.color;

                if (data[i].status.indexOf("completed") > -1)
                    outLine = "white";

                //check what type of data we're using so we know what icon to use.
                switch(layerInfo.type) {
                    case "Potholes":
                        addPothole(index, i, data, layers, 0);
                        break;
                    case "Lights":
                        addStreetLight(index, i, data, layers, 0);
                        break;
                    case "Abandoned Vehicles":
                        addAbandonedVehicle(index, i, data, layers, 0);
                        break;
                }//end switch/case on what type of data we're importing

                /*
                //check what type of data we're using so we know what icon to use. could be switch/case
                if(layerInfo.type == "Potholes") {
                    addPothole(index, i, data);
                    /*
                    layersContainer[index].circles.push(
                        L.marker([data[i]["latitude"], data[i]["longitude"]], 
                        {
                            icon: potholeIcon
                        }
                    ).bindPopup("<strong>Community Area:</strong> " + data[i]["community_area"] +
                        "<br><strong>Street Address:</strong> " + data[i]["street_address"] + "<br><strong>Status:</strong> " +
                        data[i]["status"] + "<br><strong>Creation Date:</strong> " + data[i]["creation_date"].substring(0,10))
                    );//end .push
                    /
                };//end if Potholes

                //if the data is for a street light out
                if(layerInfo.type == "Lights") {
                    addStreetLight(index, i, data);
                    /*
                    layersContainer[index].circles.push(
                        L.marker([data[i]["latitude"], data[i]["longitude"]], 
                        {
                            icon: streetLightIcon
                        }
                    ).bindPopup("<strong>Community Area:</strong> " + data[i]["community_area"] +
                        "<br><strong>Street Address:</strong> " + data[i]["street_address"] + "<br><strong>Status:</strong> " +
                        data[i]["status"] + "<br><strong>Creation Date:</strong> " + data[i]["creation_date"].substring(0,10))
                    );//end .push
                    /
                };//end if lights

                //if the data is from an abandoned vehicle
                if(layerInfo.type == "Abandoned Vehicles") {
                    addAbandonedVehicle(index, i, data);
                }

                if(layerInfo.type != "Potholes" && layerInfo.type != "Lights" && layerInfo.type != "Abandoned Vehicles"){
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                        {
                            zindex: 10,
                            radius: 5,
                            color: outLine,
                            fillColor: layerInfo.fill,
                            fillOpacity: 1,
                            opacity: 1,
                            // properties
                            service_request_number : data[i].service_request_number
                        }
                    ).bindPopup("<strong>Community Area:</strong> " + data[i]["community_area"] +
                        "<br><strong>Street Address:</strong> " + data[i]["street_address"] + "<br><strong>Status:</strong> " +
                        data[i]["status"] + "<br><strong>Creation Date:</strong> " + data[i]["creation_date"].substring(0,10))
                    /*binds popup to the pothole markers pulling each bit of relevant data. on the last part, the substring just cuts off
                    the extraneous 0'd out time that's appended after the date in each entry/
                );
                };
                */
            };

            //L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
	function addDivvyData(layerInfo, index, layers){
		var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
		
		ajaxRequest(response,sourceLink);
		
		function response(json){
			var data = JSON.parse(json).stationBeanList;
			for (var i = 0; i < data.length; i++) {
                
				// filters
                if (data[i].statusValue == null) continue;
				var statusValue = data[i].statusValue;
				
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                // add the circles
                outLine = layerInfo.color[statusValue];

                addDivvyStation(index, i, data, layers, 0);

                /*
                layersContainer[index].circles.push(
                    L.marker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        icon: divvyStationIcon
                    }
                ).bindPopup("<strong>Station Name:</strong> " + data[i]["stationName"] + "<br><strong>Status:</strong> " +
                        data[i]["statusValue"] +"<br><strong>Occupied Docks / Total Docks: </strong>" + data[i]["availableBikes"] + 
                        "/" + data[i]["totalDocks"])
                );//end .push
                */
                /*
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                        {
                            zindex: 10,
                            radius: 5,
                            color: outLine,
                            fillColor: layerInfo.fill,
                            fillOpacity: 1,
                            opacity: 1,
    						//properties
    						totalDocks : data[i].totalDocks,
    						availableBikes : data[i].availableBikes,
    						statusValue : data[i].statusValue
                        }
                    ).bindPopup("<strong>Station Name:</strong> " + data[i]["stationName"] + "<br><strong>Status:</strong> " +
                        data[i]["statusValue"] +"<br><strong>Occupied Docks / Total Docks: </strong>" + data[i]["availableBikes"] + 
                        "/" + data[i]["totalDocks"])
                );//end .push
                */
            };//end for loop
		//L.layerGroup(layersContainer[index].circles).addTo(layers);
		//layersContainer[index].refresh = parseDate(data[refreshIndex].executionTime);
		}
    };
	
    function addCrimeData(layerInfo, index, layers){
        var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, data){
            if (error) {
                console.error(error);
            };

            for (var i = 0; i < data.length; i++) {
				if(data[i].status === "STATUS"){
					refreshIndex = i + 1;
					continue;
				}
                // filters
				var date = parseDate(data[i].date);
                if (date == null) continue;

                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                var daysAgo = (new Date() - date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 14)
                    outLine = layerInfo.color;

                addCrime(index, i, data, layers, 0);

				/*
                layersContainer[index].circles.push(
					L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
						{
							zindex: 10,
							radius: 5,
							color: outLine,
							fillColor: layerInfo.fill,
							fillOpacity: 1,
							opacity: 1,
							//properties
							id : data[i].id
						}
					)
                );//end .push
                */
			};//end for loop

            //L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
    //refresh for potholes, street lights, and abandoned vehicles
    function refreshData(layerInfo, index, layers){
        var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, data){
            if (error) {
                console.error(error);
            };

            for (var i = 0; i < data.length; i++) {
				if(data[i].status === "STATUS"){
					refreshIndex = i + 1;
					continue;
				}
                // filters
                if (data[i].creation_date == null) continue;
				var creation_date = parseDate(data[i].creation_date);
				
				// var isNewData = mapApp.dateAfter(creation_date,layerInfo.refresh);
				// if(! isNewData) break;

                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) return;
                if (getByServiceNumber(layersContainer[index], data[i].service_request_number) != null) return;
                
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                console.log("added stuff");
               
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7)
                    outLine = layerInfo.color;

                if (data[i].status.indexOf("completed") > -1)
                    outLine = "white";
				
                //check what type of data we're using so we know what icon to use.
                switch(layerInfo.type) {
                    case "Potholes":
                        addPothole(index, i, data, layers, 1);
                        break;
                    case "Lights":
                        addStreetLight(index, i, data, layers, 1);
                        break;
                    case "Abandoned Vehicles":
                        addAbandonedVehicle(index, i, data, layers, 1);
                        break;
                }//end switch/case on what type of data we're importing

                /*
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        // change this later , only for testing
                        radius: 20,
                        color: outLine,
                        fillColor: "pink",
                        fillOpacity: 1,
                        opacity: 1,
                        // properties
                        service_request_number : data[i].service_request_number
                    }
                ));
                */
            };

            //if( layersContainer[index].refresh === null ) )
            //layers.clearLayers();
			//L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };//end refreshData()
	
    function refreshDivvyData(layerInfo, index, layers){
		var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
		ajaxRequest(response,sourceLink);
		
		function response(json){
			var data = JSON.parse(json).stationBeanList;
			for (var i = 0; i < data.length; i++) {
                
				// filters
                if (data[i].statusValue == null) continue;
				var statusValue = data[i].statusValue;
				
                if (
					(getByStatusValue(layersContainer[index], data[i].statusValue) != null) &&
					(getByAvailableBikes(layersContainer[index], data[i].availableBikes) != null) &&
					(getByTotalDocks(layersContainer[index], data[i].totalDocks) != null ) ) return;
				
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                // add the circles
                outLine = layerInfo.color[statusValue];

                addDivvyStation(index, i, data, layers, 1);
                /*
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        radius: 5,
                        color: outLine,
						fillColor: "pink",
                        fillOpacity: 1,
                        opacity: 1,
						//properties
						totalDocks : data[i].totalDocks,
						availableBikes : data[i].availableBikes,
						statusValue : data[i].statusValue
                    }
                ));
                */
            };
            //if( layersContainer[index].refresh === null ) )
            //layers.clearLayers();
			//L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
		}
    };

	function refreshCrimeData(layerInfo, index, layers){
        var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, data){
            if (error) {
                console.error(error);
            };

            for (var i = 0; i < data.length; i++) {
				// filters
                if (data[i].id == null) continue;
				var id = data[i].id;
				
                if ( getById(layersContainer[index], data[i].id) != null ) return;
				
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                addCrime(index, i, data, layers, 1);

                /*
                // add the circles
                outLine = layerInfo.color[statusValue];
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        radius: 5,
                        color: outLine,
						fillColor: "pink",
                        fillOpacity: 1,
                        opacity: 1,
						//properties
						id : data[i].id
                    }
                ));//end .push
                */
            };//end for loop

            //if( layersContainer[index].refresh === null ) )
            //layers.clearLayers();
			//L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };

    // function that filters by a simple rectangle
    function filterByShape(coordinates){
         var poly = {
            "type": "Polygon",
            "coordinates": coordinates
        };

        for (var q = 0; q < layersContainer.length; q++) {
            for (var i = 0; i < layersContainer[q].circles.length; i++) {
                var point = {
                    "type": "Point", 
                    "coordinates": [layersContainer[q].circles[i]._latlng.lng, layersContainer[q].circles[i]._latlng.lat]
                };

                if (!gju.pointInPolygon(point, poly))
                    layersContainer[q].circles[i].setOpacity(0);
                    //layersContainer[q].circles[i].setStyle({opacity: 0, fillOpacity:0});
            };
        };
    }

    // quick helper function
    function getByServiceNumber(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.service_request_number == number)
                return layer.circles[i];
        };
        return null;
    };
   
   function getByStatusValue(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.statusValue == number)
                return layer.circles[i];
        };
        return null;
    };

	function getByAvailableBikes(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.availableBikes == number)
                return layer.circles[i];
        };
        return null;
    };
	
	function getByTotalDocks(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.totalDocks == number)
                return layer.circles[i];
        };
        return null;
    };

	function getById(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.id == number)
                return layer.circles[i];
        };
        return null;
    };

    //helper function for adding potholes to map
    function addPothole(layerIndex, dataIndex, data, layers, refresh) {
        layersContainer[layerIndex].circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: potholeIcon
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))//because time at end is always uselessly zeroed
        );//end .push
        //TODO change icon based on value of "status"
        if(refresh == 1) {
            layers.clearLayers();
        }
        L.layerGroup(layersContainer[layerIndex].circles).addTo(layers);
        return null;
    };//end addPothole()

    //helper function for adding street light data to map
    function addStreetLight(layerIndex, dataIndex, data, layers, refresh) {
        layersContainer[layerIndex].circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: streetLightIcon
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10))
        );//end .push
        //TODO change icon based on value of "status"
        if(refresh == 1) {
            layers.clearLayers();
        }
        L.layerGroup(layersContainer[layerIndex].circles).addTo(layers);
        return null;
    };//end addStreetLight()

    //helper function for adding abandoned vehicle data to map
    function addAbandonedVehicle(layerIndex, dataIndex, data, layers, refresh) {
        layersContainer[layerIndex].circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: abandonedVehicleIcon
            }
        ).bindPopup("<strong>Community Area:</strong> " + data[dataIndex]["community_area"] +
            "<br><strong>Street Address:</strong> " + data[dataIndex]["street_address"] + "<br><strong>Status:</strong> " +
            data[dataIndex]["status"] + "<br><strong>Creation Date:</strong> " + data[dataIndex]["creation_date"].substring(0,10) + 
            "<br><strong>Days Reported Parked:</strong> " + data[dataIndex]["how_many_days_has_the_vehicle_been_reported_as_parked_"])
        );//end .push
        //TODO change icon based on value of "status"
        //TODO do we want to put extra data like color, licenese plate, make/model? maybe under a "show more" tab/button, etc?
        if(refresh == 1) {
            layers.clearLayers();
        }
        L.layerGroup(layersContainer[layerIndex].circles).addTo(layers);
        return null;
    };//end addAbandonedVehicle()

    //helper function for adding divvy stations to map
    function addDivvyStation(layerIndex, dataIndex, data, layers, refresh) {
        layersContainer[layerIndex].circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: divvyStationIcon
            }
        ).bindPopup("<strong>Station Name:</strong> " + data[dataIndex]["stationName"] + "<br><strong>Status:</strong> " +
                data[dataIndex]["statusValue"] +"<br><strong>Occupied Docks / Total Docks: </strong>" + data[dataIndex]["availableBikes"] + 
                "/" + data[dataIndex]["totalDocks"])
        );//end .push
        //TODO change icon based on value of "statusValue"
        if(refresh == 1) {
            layers.clearLayers();
        }
        L.layerGroup(layersContainer[layerIndex].circles).addTo(layers);
        return null;
    };//end addDivvyStation()

    //helper function for adding crime data to map
    function addCrime(layerIndex, dataIndex, data, layers, refresh) {
        layersContainer[layerIndex].circles.push(
            L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
            {
                icon: crimeIcon
            }
        ).bindPopup("<strong>Type:</strong> " + data[dataIndex]["primary_type"] + "<br><strong>Arrest:</strong> " +
                data[dataIndex]["arrest"] +"<br><strong>Location Description:</strong> " + data[dataIndex]["location_description"] + 
                "<br><strong>Date:</strong> " + data[dataIndex]["date"].substring(0,10) + "<br><strong>Updated On:</strong> " +
                data[dataIndex]["updated_on"])
        );//end .push
        //TODO maybe add details like the description and if it was domestic or not, case number, iucr, etc? either
        //in the popup or some sort of "show more"? or maybe we show some basic info on hover, and that+more on click/popup?
        if(refresh == 1) {
            layers.clearLayers();
        }
        L.layerGroup(layersContainer[layerIndex].circles).addTo(layers);
        return null;
    };//end addCrime()
	
    DataCirclesObj.filterByShape = filterByShape;
    DataCirclesObj.addLayers = addLayers;
	DataCirclesObj.refreshLayers = refreshLayers;
    return DataCirclesObj;
};