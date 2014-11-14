// Data circles obj
function DataCircles() {
    var DataCirclesObj = new Object();
   
    // make this private after testing
    layersContainer = [];
    
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

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
				case "CTA":
					addCTAData(layersInfo[i], index, layers[i]);
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
				case "CTA":
					refreshCTAData(layersInfo[i], index, layers[i]);
					break;						
				default:
					refreshData(layersInfo[i], index, layers[i]);
					break;
			}	
        } 
    };

    // function filterByShapes()

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
                    the extraneous 0'd out time that's appended after the date in each entry*/
                );
            };

            L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
	function addDivvyData(layerInfo, index, layers){
		var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
		
		ajaxRequest(response,sourceLink);
		
		function response(json){
			var data = json.stationBeanList;
			for (var i = 0; i < data.length; i++) {
                
				// filters
                if (data[i].statusValue == null) continue;
				var statusValue = data[i].statusValue;
				
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                // add the circles
                outLine = layerInfo.color[statusValue];
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
                );
            };
		L.layerGroup(layersContainer[index].circles).addTo(layers);
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
                );
			};

            L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
	function addCTAData(layerInfo, index, layers){
        var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, json){
            if (error) {
                console.error(error);
            };
			
			var data = json.query.results['bustime-response'].vehicle;
            for (var i = 0; i < data.length; i++) {
				if(data[i].vid === null) continue;

                // filters
				//var creation_date = parseDate(data[i].creation_date);
                //if (creation_date == null) continue;

                if ( data[i]["lat"] == undefined || data[i]["lon"] == undefined) continue;

                //var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                //if (daysAgo >= 31) break;
                
                // add the circles
                //var outLine = "black";
                //if (daysAgo >= 7)
                //outLine = layerInfo.color;

                //if (data[i].status.indexOf("completed") > -1)
                //    outLine = "white";

                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["lat"], data[i]["lon"]], 
                        {
                            zindex: 10,
                            radius: 5,
                            color: layerInfo.color,
                            fillColor: layerInfo.fill,
                            fillOpacity: 1,
                            opacity: 1,
                            // properties
                            lat : data[i].lat,
							lon : data[i].lon
                        }
                    )
                );
            };

            L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
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
            };

            //if( layersContainer[index].refresh === null ) )
            layers.clearLayers();
			L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
    function refreshDivvyData(layerInfo, index, layers){
		var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
		ajaxRequest(response,sourceLink);
		
		function response(json){
			var data = json.stationBeanList;
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
            };
            //if( layersContainer[index].refresh === null ) )
            layers.clearLayers();
			L.layerGroup(layersContainer[index].circles).addTo(layers);
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

                // add the circles

                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        radius: 5,
                        color: layerInfo.color,
						fillColor: "pink",
                        fillOpacity: 1,
                        opacity: 1,
						//properties
						id : data[i].id
                    }
                ));
            };

            //if( layersContainer[index].refresh === null ) )
            layers.clearLayers();
			L.layerGroup(layersContainer[index].circles).addTo(layers);
			// layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };
	
    function refreshCTAData(layerInfo, index, layers){
      var sourceLink = layerInfo.sourceLink;
		var refreshIndex = 0;
        d3.json(sourceLink, function(error, json){
            if (error) {
                console.error(error);
            };
			var data = json.query.results['bustime-response'].vehicle;
            for (var i = 0; i < data.length; i++) {
				if(data[i].vid === null) continue;

                // filters
				//var creation_date = parseDate(data[i].creation_date);
                //if (creation_date == null) continue;

				if ( getByLat(layersContainer[index], data[i].lat) != null && 
					 getByLon(layersContainer[index], data[i].lon) != null ) return;
								
                if ( data[i]["lat"] == undefined || data[i]["lon"] == undefined) continue;
				
				

                //var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                //if (daysAgo >= 31) break;
                
                // add the circles
                //var outLine = "black";
                //if (daysAgo >= 7)
                //outLine = layerInfo.color;

                //if (data[i].status.indexOf("completed") > -1)
                //    outLine = "white";

                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["lat"], data[i]["lon"]], 
                        {
                            zindex: 10,
                            radius: 5,
                            color: layerInfo.color,
                            fillColor: layerInfo.fill,
                            fillOpacity: 1,
                            opacity: 1,
                            // properties
                            lat : data[i].lat,
							lon : data[i].lon
                        }
                    )
                );
            };

            //if( layersContainer[index].refresh === null ) )
            layers.clearLayers();
			L.layerGroup(layersContainer[index].circles).addTo(layers);
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
                    layersContainer[q].circles[i].setStyle({opacity: 0, fillOpacity:0});
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

	function getByLat(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.lat == number)
                return layer.circles[i];
        };
        return null;
    };

	function getByLon(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.lon == number)
                return layer.circles[i];
        };
        return null;
    };
	
    DataCirclesObj.filterByShape = filterByShape;
    DataCirclesObj.addLayers = addLayers;
	DataCirclesObj.refreshLayers = refreshLayers;
    return DataCirclesObj;
};