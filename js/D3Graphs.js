// obj that creates graphs given input
function D3Graphs(){
    var container;
    var overallSVG;
    var selectedSVG;
    var D3GraphsObj = new Object();
    var graphPadding = 20;

    function init(div){
        var height = $("#sidebar").height();
        var width = $(div).width();
        container = $(div);

        overallSVG = d3.select(container)
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height/2)
            .attr("preserveAspectRatio", "xMidYMid meet");

        selectedSVG = = d3.select(container)
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height/2)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("transform", "translate(" + 0 + "," + height/2 +")"); 
    };

    function makeOverallGraph(data, label){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(div).width() - graphPadding;
        makeBarGraph(overallSVG, width, height, graphPadding/2, graphPadding/2, data, label, value, "green", true, "Chicago", 5, true);
    };

    function makeSelectedGraph(data, label){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(div).width() - graphPadding;
        makeBarGraph(selectedSVG, width, height, graphPadding/2, graphPadding/2, 
            data, label, value, "red", true, "Selected Area", 5, true);
    };

    // Makes graph given data and svg to draw on
    function makeBarGraph(drawSection, width, height, dx, dy, dataObject, label, value, color, makeTitle, title, ticks, upright){
        var max = 0;
        var min = 0;
        for (var i = 0; i < dataObject.length; i++) {
            if(dataObject[i][value] > max)
                max = dataObject[i][value];
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

        if(!upright){
            // make axis
            var xscale1 = d3.scale.linear()
            .domain([min, max])
            .range([0, width]);

            var xscale2 = d3.scale.linear()
            .domain([min, max])
            .range([height, 0]);
            var yaxis = d3.svg.axis().scale(xscale1).ticks(ticks).orient("bottom");

            drawSection.append("g")
                .call(yaxis)
                .attr("transform", "translate("+ dx + "," + (height + dy)+ ")");

            // make bars
            graph.selectAll("rect")
                .data(dataObject)
                .enter()
                    .append("rect")
                    .attr("width", function(d){
                        return xscale1(d[value]);
                    })
                    .attr("height",(height/dataObject.length) - 2)
                    .attr("fill", color)
                    .attr("y", function(d,i){ 
                        return i*(height/dataObject.length)
                        // return height - xscale1(d[value]);
                    })
                    .attr("x", function(d){
                        // return i*(width/dataObject.length)
                        return 0;
                    });

            // labels
            graph.selectAll("text")
                .data(dataObject)
                .enter()
                    .append("text")
                    .attr("y", function(d,i){ 
                        return i*(height/dataObject.length) + ((height/dataObject.length) - 3) ;
                        // return height - xscale1(d[value]);
                    })
                    .attr("x", function(d){
                        // return i*(width/dataObject.length)
                        return 0;
                    })
                    .text(function (d){
                        return d[label];
                    })
                    .attr("fill", "white")
                    .style("font-size", "12px")
                    .style("font-family", "sans-serif");
        };

        if(upright){
            // make axis
            var xscale1 = d3.scale.linear()
            .domain([min, max])
            .range([0, height]);

            var xscale2 = d3.scale.linear()
            .domain([min, max])
            .range([height, 0]);

            var xscale3 = d3.scale.linear()
            .domain([0, 99])
            .range([0, width]);

            var yaxis = d3.svg.axis().scale(xscale2).ticks(ticks).orient("left");

            var xaxis = d3.svg.axis().scale(xscale3).ticks(10).orient("bottom");

            drawSection.append("g")
                .call(yaxis)
                .attr("transform", "translate("+ dx + "," + dy + ")");

            drawSection.append("g")
                .call(xaxis)
                .attr("transform", "translate("+ dx + "," + (dy + height) + ")");

            // make bars
            graph.selectAll("rect")
                .data(dataObject)
                .enter()
                    .append("rect")
                    .attr("height", function(d){
                        return xscale1(d[value]);
                    })
                    .attr("width",(width/dataObject.length))
                    .attr("fill", color)
                    .attr("x", function(d,i){ 
                        return i*(width/dataObject.length)
                        // return height - xscale1(d[value]);
                    })
                    .attr("y", function(d){
                        // return i*(width/dataObject.length)
                        return height - xscale1(d[value]);
                    });

            graph.append("text")
                .attr("transform", "translate("+ width/2 + "," + (height + (dy - 10))+ ")")
                .text(function(){
                    return label;
                })
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-family", "sans-serif");
        }
    };

    D3GraphsObj.init = init;
    D3GraphsObj.makeOverallGraph = makeOverallGraph;
    D3GraphsObj.makeSelectedGraph = makeSelectedGraph;
};
