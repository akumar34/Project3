// Data circles obj
function DataCircles() {
    var DataCirclesObj = new Object();
    var layersContainer = [];
    overlays = [];
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
            addData(layersInfo[i], index, layers[i]);
        } 
       
    };
	
	    // add layers of data
    function refreshLayers(layersInfo, layers){
        for (var i = 0; i < layersInfo.length; i++) {
            // refresh circleMarkers to the layers
            var index = layersContainer.length - 1;
            refreshData(layersInfo[i], index, layers[i]);
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
                    outLine = layerInfo.monthColor;

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
                            opacity: 1
                        }
                    ).bindPopup("<strong>Community Area:</strong> " + data[i]["community_area"] +
                        "<br><strong>Street Address:</strong> " + data[i]["street_address"] + "<br><strong>Status:</strong> " +
                        data[i]["status"] + "<br><strong>Creation Date:</strong> " + data[i]["creation_date"].substring(0,10))
                    /*binds popup to the pothole markers pulling each bit of relevant data. on the last part, the substring just cuts off
                    the extraneous 0'd out time that's appended after the date in each entry*/
                );
            };

            L.layerGroup(layersContainer[index].circles).addTo(layers);
			layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
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
				var creation_date = parseDate(data[i].creation_date);
                if (creation_date == null) continue;
				
				var isNewData = mapApp.dateAfter(creation_date,layerInfo.refresh);
				if(! isNewData) break;
				
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                var daysAgo = (new Date() - creation_date) / 1000 / 60 / 60 / 24;
                if (daysAgo >= 31) break;
                
                // add the circles
                var outLine = "black";
                if (daysAgo >= 7)
                    outLine = layerInfo.monthColor;

                if (data[i].status.indexOf("completed") > -1)
                    outLine = "white";
				
                layersContainer[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        radius: 5,
                        color: outLine,
                        fillColor: "pink",
                        fillOpacity: 1,
                        opacity: 1
                    }
                ));
            };

            //if( layersContainer[index].refresh === null ) )
			//	L.layerGroup(layersContainer[index].circles).addTo(layers);
			layersContainer[index].refresh = parseDate(data[refreshIndex].creation_date);
        });
    };

    DataCirclesObj.addLayers = addLayers;
	DataCirclesObj.refreshLayers = refreshLayers;
    return DataCirclesObj;
};