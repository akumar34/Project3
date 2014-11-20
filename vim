diff --git a/js/DataCircles.js b/js/DataCircles.js
index e9edab5..5342835 100644
--- a/js/DataCircles.js
+++ b/js/DataCircles.js
@@ -800,7 +800,9 @@ function DataCircles() {
                 // add the circles
                 var outLine = "black";
                 if (daysAgo > 7) outLine = layerInfo.color;
-                addFoodInspectionMarkers(layerContainers[FOOD_INSPECTION], index, data, layer, true);
+                
+                // needs rework we are always adding markers, filters are not working
+                // addFoodInspectionMarkers(layerContainers[FOOD_INSPECTION], index, data, layer, true);
             };
 
             var selectedLayer = selectedDataPoints[FOOD_INSPECTION].controlLayer;
@@ -811,6 +813,7 @@ function DataCircles() {
 
     //helper function for adding food inspection to map
     function addFoodInspectionMarkers(layerContainer, dataIndex, data, layer, refresh) {
+        console.log("Added inspection data");
         layerContainer.circles.push(
             L.marker([data[dataIndex]["latitude"], data[dataIndex]["longitude"]], 
             {
@@ -829,7 +832,7 @@ function DataCircles() {
         if (isInShapes(newMarker)) {
             selectedDataPoints[FOOD_INSPECTION].circles.push(newMarker);
             // debug
-            console.log("Marker was added to the section");
+            // console.log("Marker was added to the section");
         };
     };
 	
@@ -876,6 +879,36 @@ function DataCircles() {
         cleanAndMakeGraphs();
     };
 
+    // functions that checks if a marker is inside a circle
+    function filterByCircle(circleObj, add){
+        for (var i = 0; i < layerContainers.length; i++) {
+            for (var m = 0; m < layerContainers[i].circles.length; m++) {
+                var point = {
+                    "type": "Point", 
+                    "coordinates": [layerContainers[i].circles[m]._latlng.lng, layerContainers[i].circles[m]._latlng.lat]
+                };
+
+                if (pointInCircle(circleObj.center, circleObj.radius, point)) {
+
+                    var index = containsCircle(selectedDataPoints[i].circles, layerContainers[i].circles[m]);
+                    // create subset of the total circles to be later shown on map and sent to graphs
+                    if (add && index < 0) 
+                        selectedDataPoints[i].circles.push(layerContainers[i].circles[m]);
+                    // remove subset of circles
+                    else if (!add && index >= 0){
+                        selectedDataPoints[i].circles.splice(index, 1);
+                    };
+                };
+            };
+        };
+
+        if (!add)
+            revomeSelectedFromControl();
+
+        addSelectedToControl();
+        cleanAndMakeGraphs();
+    };
+
     // helper function
     function containsCircle(circleArray,circle) {
         for (var c = 0; c < circleArray.length; c++) {
@@ -1025,6 +1058,13 @@ function DataCircles() {
         };
 
         for (var x in shapes) {
+            if (shapes[x].type == "circle") {
+                if (pointInCircle(shapes[x].center, shapes[x].radius, point))
+                    return true;
+
+                continue;
+            };
+
             var coordinatesArray = shapes[x].latlngs;
             var coordinates = [];
 
@@ -1044,7 +1084,36 @@ function DataCircles() {
         return false;
     };
 
+    // check to see if point is in circle
+    // redo this using latlng distance to method!
+    function pointInCircle(circleCenter, circleRadius, point) {
+        var lat1 = circleCenter.lat;
+        var lng1 = circleCenter.lng;
+        var lat2 = point.coordinates[1];
+        var lng2 = point.coordinates[0];
+        var distance = measureDistance(lat1, lng1, lat2, lng2);
+        
+        if (distance <= circleRadius) return true;
+
+        return false;
+    };
+
+    // helper function thanks to stackoverflow
+    // http://stackoverflow.com/a/11172685
+    function measureDistance(lat1, lon1, lat2, lon2){  // generally used geo measurement function
+        var R = 6378.137; // Radius of earth in KM
+        var dLat = (lat2 - lat1) * Math.PI / 180;
+        var dLon = (lon2 - lon1) * Math.PI / 180;
+        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
+        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
+        Math.sin(dLon/2) * Math.sin(dLon/2);
+        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
+        var d = R * c;
+        return d * 1000; // meters
+    };
+
     DataCirclesObj.filterByShape = filterByShape;
+    DataCirclesObj.filterByCircle = filterByCircle;
 	
 	DataCirclesObj.addPotholesData = addPotholesData;
 	DataCirclesObj.addAbandonedVehiclesData = addAbandonedVehiclesData;
