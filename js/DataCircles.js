// Data circles obj
function DataCircles() {
    var DataCirclesObj = new Object();
    var layers = [];
    overlays = [];
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

    // add layers of data
    function addLayers(layersInfo, mapLayers){
        for (var i = 0; i < layersInfo.length; i++) {
            
            layers.push({
                link : layersInfo[i].sourceLink,
                type : layersInfo[i].nameType,
                circles : []
            });

            // add circleMarkers to the layers
            var index = layers.length - 1;
            addData(layersInfo[i], index, mapLayers[i]);
        } 
       
    };

    function addData(layerInfo, index, mapLayer){
        var sourceLink = layerInfo.sourceLink;
        d3.json(sourceLink, function(data){
            for (var i = 0; i < data.length; i++) {
                // filters
                var daysAgo = (new Date() - parseDate(data[i].creation_date)) / 1000 / 60 / 60 / 24;
                
                if (daysAgo >= 31) continue;
                if ( data[i]["latitude"] == undefined || data[i]["longitude"] == undefined) continue;

                // add the circles
                var outLine = "white";
                if (daysAgo >= 7)
                    outLine = layerInfo.monthColor;

                layers[index].circles.push(
                    L.circleMarker([data[i]["latitude"], data[i]["longitude"]], 
                    {
                        zindex: 10,
                        radius: 5,
                        color: outLine,
                        fillColor: layerInfo.fill,
                        fillOpacity: 1,
                        opacity: 1
                    }
                ));
            };

            L.layerGroup(layers[index].circles).addTo(mapLayer);

        });
    };


    DataCirclesObj.addLayers = addLayers;
    return DataCirclesObj;
};