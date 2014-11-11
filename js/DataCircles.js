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
            addData(layersInfo[i], i, layers[i]);
        } 
       
    };
	
	    // add layers of data
    function refreshLayers(layersInfo, layers){
        for (var i = 0; i < layersInfo.length; i++) {
            // refresh circleMarkers to the layers
            refreshData(layersInfo[i], i, layers[i]);
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
                        opacity: 1,
                        // properties
                        service_request_number : data[i].service_request_number
                    }
                ));
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
                    outLine = layerInfo.monthColor;

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

    // quick helper function
    function getByServiceNumber(layer, number) {
        for (var i = 0; i < layer.circles.length; i++) {
            if(layer.circles[i].options.service_request_number == number)
                return layer.circles[i];
        };
        return null;
    };

    DataCirclesObj.addLayers = addLayers;
	DataCirclesObj.refreshLayers = refreshLayers;
    return DataCirclesObj;
};