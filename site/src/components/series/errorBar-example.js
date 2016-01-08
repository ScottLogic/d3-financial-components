var width = 500, height = 250;
var container = d3.select('#errorbar')
    .append('svg')
    .attr({'width': width, 'height': height});

var dataGenerator = fc.data.random.walk();
var data = dataGenerator(100).map(function(datum, index) {
    return {
        x: index,
        y: datum,
        errorLow: datum - Math.random() * 2,
        errorHigh: datum + Math.random() * 2
    };
});

var xScale = d3.scale.linear()
    .domain(fc.util.extent().fields('x')(data))
    .range([0, width]);

var yScale = d3.scale.linear()
    .domain(fc.util.extent().fields('errorLow', 'errorHigh')(data))
    .range([height, 0]);

//START
var errorBar = fc.series.errorBar()
    .xValue(function(d) { return d.x; })
    .yValue(function(d) { return d.y; })
    .errorLow(function(d) { return d.errorLow; })
    .errorHigh(function(d) { return d.errorHigh; })
    .xScale(xScale)
    .yScale(yScale);

container.append('g')
    .datum(data)
    .call(errorBar);
//END
