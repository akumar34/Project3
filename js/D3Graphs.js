// obj that creates graphs given input
function D3Graphs(){
    var REFRESHABLE_DATA_SVG = 0;
	var CRIME_DATA_SVG = 1;
	
	var container;

    var D3GraphsObj = new Object();
    var graphPadding = 35;
	
	var svgs = [];

    function init(div){
        var height = $("#sidebar").height();
        var width = $(div).width();
        container = div;
		
		svgs[REFRESHABLE_DATA_SVG] = d3.select(container)
            .append("svg")
            .attr("viewBox", "-55 -40 " + (width + graphPadding + 100) + " " + ((height + graphPadding)/2 + 150))
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g");
			
		svgs[CRIME_DATA_SVG] = d3.select(container)
            .append("svg")
            .attr("viewBox", "-55 -40 " + (width + graphPadding + 100) + " " + ((height + graphPadding)/2 + 150))
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g");
    };
	
	function makeStackedAndGroupedBarGraph(data, columns, title){
		var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
		var dx = graphPadding/2;
		var dy = graphPadding/2;
		
		var svg;
		if(data[0].type.search("Potholes") != -1) svg = svgs[REFRESHABLE_DATA_SVG];
		else svg = svgs[CRIME_DATA_SVG]; 
		
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
			.tickFormat(d3.format(".2s"))
			.ticks(5);
		 
		//var color = d3.scale.ordinal()
		//	.range(["red","green"]);
			
			
		var palette = d3.scale.category20c();
		var colorRange = palette.range();
		var color = d3.scale.ordinal().range(colorRange);
		 
		var yBegin;
		
		var innerColumns = columns;
		 
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

		svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
			  .selectAll("text")
				.attr("y", 0)
				.attr("x", 9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(65)")
				.style("text-anchor", "start")
			    .attr("font-family", "sans-serif")
			    .attr("font-size","65%");
			   
		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
			  .append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", -55)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("Total");
			
		var project_stackedbar = svg.selectAll(".project_stackedbar")
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

        svg.selectAll("text.label")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) {
                return d.total;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, index) {
                return (x0(d.type) + (x0.rangeBand()/2));
            })
            .attr("y", function(d) {
                return y(d.total + 10);
            })
            .style("font-size","75%");
			
		var legend = svg.selectAll(".legend")
		  .data(columnHeaders.slice().reverse())
		  .enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		  .attr("x", width + 110)
		  .attr("width", 9)
		  .attr("height", 9)
		  .style("fill", color);

		legend.append("text")
		  .attr("x", width + 100)
		  .attr("y", 9)
		  .attr("dy", ".15em")
		  .style("text-anchor", "end")
		  .text(function(d) { return d; });
		  
		svg.selectAll(".chart-title")
		   .data(data)
		   .enter()
		   .append("text")
		   .attr("x", width/2)
		   .attr("y", height-165)
		   .attr("text-anchor","middle")
		   .attr("font-family", "sans-serif")
		   .attr("font-size","90%")
		   .text(title);
	};
	
    function clearAll() { 
		svgs[REFRESHABLE_DATA_SVG].selectAll("*").remove();
		svgs[CRIME_DATA_SVG].selectAll("*").remove();
	};
	
	/*function makeStackedBarGraph(drawSection, width, height, dx, dy, data, makeTitle, title, ticks){
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

		refreshableDataSVG.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + dy + ")")
			.call(xAxis);

		refreshableDataSVG.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		
		var type = refreshableDataSVG.selectAll(".type")
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

		var legend = refreshableDataSVG.selectAll(".legend")
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

		refreshableDataSVG.append("g")
			.attr("transform", "translate(" +  dx +"," + (dy - 40) + ")")
			.append("text")
			.text(function(){
				return title.toUpperCase();
			})
			.style("font-size", "80%")
			.style("font-family", "sans-serif");
	};*/

    D3GraphsObj.init = init;
	D3GraphsObj.makeStackedAndGroupedBarGraph = makeStackedAndGroupedBarGraph;	
    D3GraphsObj.clearAll = clearAll;
    return D3GraphsObj;
};
