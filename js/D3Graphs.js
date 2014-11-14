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

    function makeOverallGraph(overallData, label, value){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
        makeBarGraph(overallSVG, width, height, graphPadding/2, graphPadding/2, 
            overallData, label, value, "green", true, "Chicago", 5, true);
    };

    function makeSelectedGraph(selectedData, label, value){
        var height = ($("#sidebar").height()/2) - graphPadding;
        var width = $(container).width() - graphPadding;
        makeBarGraph(selectedSVG, width, height, graphPadding/2, graphPadding/2, 
            selectedData, label, value, "red", true, "Selected Area", 5, true);
    };

    function clearAll(){
        selectedSVG.selectAll("*").remove();
        overallSVG.selectAll("*").remove();
    }

    // Makes graph given data and svg to draw on
    // Im not proud of this function, but it works...
    function makeBarGraph(drawSection, width, height, dx, dy, dataObject, label, value, color, makeTitle, title, ticks, upright){        
        var max = 0;
        var min = 0;
        for (var i = 0; i < dataObject.length; i++) {
            console.log(dataObject[i]);

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
                        return yscale(d[value]);
                    })
                    .attr("width",(width/dataObject.length) - 5)
                    .attr("fill", color)
                    .attr("x", function(d,i){ 
                        return i*(width/dataObject.length)
                        // return height - yscale(d[value]);
                    })
                    .attr("y", function(d){
                        // return i*(width/dataObject.length)
                        return height - yscale(d[value]);
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
                    return d[label].toUpperCase();
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
    };

    D3GraphsObj.init = init;
    D3GraphsObj.makeOverallGraph = makeOverallGraph;
    D3GraphsObj.makeSelectedGraph = makeSelectedGraph;
    D3GraphsObj.clearAll = clearAll;
    return D3GraphsObj;
};
