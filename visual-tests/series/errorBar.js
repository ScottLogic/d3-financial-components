(function(d3, fc) {
    'use strict';

    var data = fc.data.random.financial().startDate(new Date(2014, 1, 1))(50);

    var width = 600, height = 250;

    var container = d3.select('#errorBar')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create scale for x axis
    var dateScale = fc.scale.dateTime()
        .domain(fc.util.extent().fields('date')(data))
        .range([0, width])
        .nice();

    // Create scale for y axis
    var priceScale = d3.scale.linear()
        .domain(fc.util.extent().fields(['high', 'low'])(data))
        .range([height, 0])
        .nice();

    //Generating the error information for the data
    data.forEach(function(d) {
        d.yUpError = Math.random();
        d.yDownError = Math.random();
    });

    var errorBarV = fc.series.errorBar()
        .xScale(dateScale)
        .yScale(priceScale)
        .errorLow(function(d, i) {return d.close - d.yDownError;})
        .errorHigh(function(d, i) {return d.close + d.yUpError;})
        .xValue(function(d, i) {return d.date;})
        .yValue(function(d, i) {return d.close;});

    var errorBarH = fc.series.errorBar()
        .orient('horizontal')
        .xScale(dateScale)
        .yScale(priceScale)
        .errorHigh(function(d, i) {
            return new Date(d.date.getTime() + (0.5 * 24 * 60 * 60 * 1000)); //add half a day
        })
        .errorLow(function(d, i) {
            return new Date(d.date.getTime() - (0.5 * 24 * 60 * 60 * 1000)); //subtract half a day
        })
        .xValue(function(d, i) {return d.date;})
        .yValue(function(d, i) {return d.close;});

    var multi = fc.series.multi()
        .series([errorBarV, errorBarH])
        .xScale(dateScale)
        .yScale(priceScale);

    container.append('g')
        .datum(data)
        .call(multi);
})(d3, fc);
