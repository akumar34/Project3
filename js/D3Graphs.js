// obj that creates graphs given input
function D3Graphs(){
    var container;
    var overallSVG;
    var selectedSVG;
    var D3GraphsObj = new Object();
    var graphPadding = 100;

    function init(div){
        var height = $("#sidebar").height();
        var width = $(div).width();
        container = div;

        overallSVG = d3.select(container)
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height/2)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g");

        selectedSVG = d3.select(container)
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height/2)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("transform", "translate(" + 0 + "," + height/2 +")")
            .append("g"); 
    };

   function makeOverallGraph(overallData, type, recentTotal, olderTotal, total){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
        makeStackedAndGroupedBarGraph(overallSVG, width, height, graphPadding/2, graphPadding/2, 
            overallData, true, "Chicago", 5);
    };

    function makeSelectedGraph(selectedData, type, recentTotal, olderTotal, total){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
        makeStackedAndGroupedBarGraph(selectedSVG, width, height, graphPadding/2, graphPadding/2, 
            overallData, true, "Chicago", 5);
    };

	function makeBarGraph(data){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
        makeStackedAndGroupedBarGraph(selectedSVG, width, height, graphPadding/2, graphPadding/2, 
            data, true, "Chicago", 5);
	};

	function makeStackedAndGroupedBarGraph(drawSection, width, height, dx, dy, data, makeTitle, title, ticks){
		//var margin = {top: 20, right: 20, bottom: 30, left: 40},
		//	width = 960 - margin.left - margin.right,
		//	height = 500 - margin.top - margin.bottom;
		 
		var x0 = d3.scale.ordinal()
			.rangeRoundBands([0, width], 0.1);
		 
		var x1 = d3.scale.ordinal();
		 
		var y = d3.scale.linear()
			.range([height, 0]);
		 
		var xAxis = d3.svg.axis()
			.scale(x0)
			.orient("bottom");
		 
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".2s"));
		 
		var color = d3.scale.ordinal()
			.range(["red","green"]);
		 
		var yBegin;
		 
		var innerColumns = {
		  "column1" : ["overallRecentTotal","overallOlderTotal"],
		  "column2" : ["selectedRecentTotal","selectedOlderTotal"]
		}
		 
		//d3.csv("data.csv", function(error, data) {
//		dataObj.forEach(function(data){
		  var columnHeaders = d3.keys(data[0]).filter(function(key) { return key !== "type"; });
		  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "type"; }));
		  data.forEach(function(d) {
			var yColumn = new Array();
			d.columnDetails = columnHeaders.map(function(name) {
			  for (ic in innerColumns) {
				if($.inArray(name, innerColumns[ic]) >= 0){
				  if (!yColumn[ic]){
					yColumn[ic] = 0;
				  }
				  yBegin = yColumn[ic];
				  yColumn[ic] += +d[name];
				  return {name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin,};
				}
			  }
			});
			d.total = d3.max(d.columnDetails, function(d) { 
			  return d.yEnd; 
			});
		  });
		 
		  x0.domain(data.map(function(d) { return d.type; }));
		  x1.domain(d3.keys(innerColumns)).rangeRoundBands([0, x0.rangeBand()]);
		 
		  y.domain([0, d3.max(data, function(d) { 
			return d.total; 
		  })]);
		 
		  drawSection.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);
		 
		  drawSection.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			.append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".7em")
			  .style("text-anchor", "end")
			  .text("");
		 
		  var project_stackedbar = drawSection.selectAll(".project_stackedbar")
			  .data(data)
			.enter().append("g")
			  .attr("class", "g")
			  .attr("transform", function(d) { return "translate(" + x0(d.type) + ",0)"; });
		 
		  project_stackedbar.selectAll("rect")
			  .data(function(d) { return d.columnDetails; })
			.enter().append("rect")
			  .attr("width", x1.rangeBand())
			  .attr("x", function(d) { 
				return x1(d.column);
				 })
			  .attr("y", function(d) { 
				return y(d.yEnd); 
			  })
			  .attr("height", function(d) { 
				return y(d.yBegin) - y(d.yEnd);
			  })
			  .style("fill", function(d) { return color(d.name); });
		 
		  var legend = drawSection.selectAll(".legend")
			  .data(columnHeaders.slice().reverse())
			.enter().append("g")
			  .attr("class", "legend")
			  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
		 
		  legend.append("rect")
			  .attr("x", width - 18)
			  .attr("width", 18)
			  .attr("height", 18)
			  .style("fill", color);
		 
		  legend.append("text")
			  .attr("x", width - 24)
			  .attr("y", 9)
			  .attr("dy", ".35em")
			  .style("text-anchor", "end")
			  .text(function(d) { return d; });
		 
		//});
	};
	
    function clearAll(){
        selectedSVG.selectAll("*").remove();
        overallSVG.selectAll("*").remove();
    };
	
	function makeStackedBarGraph(drawSection, width, height, dx, dy, data, makeTitle, title, ticks){
		// Our X scale
		var x = d3.scale.ordinal()
			.rangeRoundBands([0, dx], .1);

		// Our Y scale
		var y = d3.scale.linear()
			.rangeRound([dy, 0]);

		// Our color bands
		var color = d3.scale.ordinal()
			.range(["green", "red"]);

		// Use our X scale to set a bottom axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		// Same for our left axis
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".2s"));	

		data.forEach(function(d){
			d.type = d.type;
			d.total = +d.total;
			d.recentTotal = +d.recentTotal;
			d.olderTotal = +d.olderTotal;
		});
		
		// Map our columns to our colors
		color.domain(d3.keys(data[0]).filter(function (key) {
			return key === "recentTotal" || key === "olderTotal";
		}));

		data.forEach(function (d) {
			var y0 = 0;
			d.types = color.domain().map(function (name) {
				return {
					name: name,
					y0: y0,
					y1: y0 += +d[name]
				};
			});
			d.total = d.types[d.types.length - 1].y1;
		});
		
		// Our X domain is our set of years
		x.domain(data.map(function (d) {
			return d.type;
		}));

		// Our Y domain is from zero to our highest total
		y.domain([0, d3.max(data, function (d) {
			return d.total;
		})]);

		drawSection.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + dy + ")")
			.call(xAxis);

		drawSection.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		
		var type = drawSection.selectAll(".type")
			.data(data)
			.enter().append("g")
			.attr("class", "g")
			.attr("transform", function (d) {
			return "translate(" + x(d.type) + ",0)";
		});

		type.selectAll("rect")
			.data(function (d) {
			return d.types;
		})
			.enter().append("rect")
			.attr("width", x.rangeBand())
			.attr("y", function (d) {
			return y(d.y1);
		})
			.attr("height", function (d) {
			return y(d.y0) - y(d.y1);
		})
			.style("fill", function (d) {
			return color(d.name);
		});

		var legend = drawSection.selectAll(".legend")
			.data(color.domain().slice().reverse())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function (d, i) {
			return "translate(0," + i * 20 + ")";
		});

		legend.append("rect")
			.attr("x", width - 12)
			.attr("width", 8)
			.attr("height", 8)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function (d) {
			return d;
		});
		
        if(makeTitle){
            drawSection.append("g")
                .attr("transform", "translate(" +  dx +"," + (dy - 40) + ")")
                .append("text")
                .text(function(){
                    return title.toUpperCase();
                })
                .style("font-size", "80%")
                .style("font-family", "sans-serif");

		};
	};

    // Makes graph given data and svg to draw on
    // Im not proud of this function, but it works...
 /*   function makeBarGraph(drawSection, width, height, dx, dy, dataObject, type, recentTotal, olderTotal, total, color, makeTitle, title, ticks, upright){        
        var max = 0;
        var min = 0;
        for (var i = 0; i < dataObject.length; i++) {
            if(dataObject[i][total] > max)
                max = dataObject[i][total];
        };

        var graph = drawSection.append("g")
            .attr("transform", "translate("+ dx + "," + dy + ")");

        if(makeTitle){
            drawSection.append("g")
                .attr("transform", "translate(" +  dx +"," + (dy - 10) + ")")
                .append("text")
                .text(function(){
                    return title.toUpperCase();
                })
                .style("font-size", "16px")
                .style("font-family", "sans-serif");
        };

        if(upright){
            // make axis
            var yscale = d3.scale.linear()
            .domain([min, max])
            .range([0, height]);

            var axisScale = d3.scale.linear()
            .domain([min, max])
            .range([height, 0]);

            var yaxis = d3.svg.axis().scale(axisScale).ticks(ticks).orient("left");

            drawSection.append("g")
                .call(yaxis)
                .attr("transform", "translate("+ dx + "," + dy + ")");

            // make bars
            graph.selectAll("rect")
                .data(dataObject)
                .enter()
                    .append("rect")
                    .attr("height", function(d){
                        return yscale(d[total]);
                    })
                    .attr("width",(width/dataObject.length) - 5)
                    .attr("fill", color)
                    .attr("x", function(d,i){ 
                        return i*(width/dataObject.length)
                        // return height - yscale(d[total]);
                    })
                    .attr("y", function(d){
                        // return i*(width/dataObject.length)
                        return height - yscale(d[total]);
                    });

            // make labels
            graph.selectAll("text")
                .data(dataObject)
                .enter()
                    .append("text")
                    .attr("fill", "black")
                    .attr("x", function(d,i){ 
                        return i*(width/dataObject.length)
                        // return height - yscale(d[value]);
                    })
                    .attr("y", function(d){
                        // return i*(width/dataObject.length)
                        return height;
                    })
                    .text(function(d){
                    return d[type].toUpperCase();
                    })
                    .style("font-size", "8px")
                    .style("font-family", "sans-serif");
            
            // well fuck that didn't work
            // // hacky way to get the text to align right
            // 
            // for (var i = 0; i < dataObject.length; i++) {
            //     graph.append("text")
            //     .attr("fill", "black")
            //     .attr("x", function(d,i){ 
            //         return i*(width/dataObject.length)
            //         // return height - yscale(d[value]);
            //     })
            //     .attr("y", function(d){
            //         // return i*(width/dataObject.length)
            //         return height;
            //     })
            //     .text(dataObject[i][label].toUpperCase())
            //     .style("font-size", "8px")
            //     .style("font-family", "sans-serif")
            //     .style("text-anchor", "middle")
            //     .attr("dx", "-.8em")
            //     .attr("dy", ".15em")
            //     .attr("transform", function(d) {
            //         return "rotate(-65)" 
            //     });
            // };
        }
    };*/

    D3GraphsObj.init = init;
    D3GraphsObj.makeOverallGraph = makeOverallGraph;
    D3GraphsObj.makeSelectedGraph = makeSelectedGraph;
	D3GraphsObj.makeBarGraph = makeBarGraph;
    D3GraphsObj.clearAll = clearAll;
    return D3GraphsObj;
};
