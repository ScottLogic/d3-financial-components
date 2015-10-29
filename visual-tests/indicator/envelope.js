(function(d3, fc) {
    'use strict';

    var data = fc.data.random.financial().startDate(new Date(2014, 1, 1))(50);

    var width = 600, height = 250;

    var container = d3.select('#envelope')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create scale for x axis
    var dateScale = fc.scale.dateTime()
        .domain(fc.util.extent()(data, 'date'))
        .range([0, width])
        .nice();

    // Create scale for y axis
    var priceScale = d3.scale.linear()
        .domain(fc.util.extent()(data, ['high', 'low']))
        .range([height, 0])
        .nice();

    // Create the envelope component
    var envelope = fc.indicator.algorithm.envelope().factor(0.01).value(function(d) {return d.close;});

    envelope(data);

    // create the series
    var ohlc = fc.series.ohlc();
    var envelopeSeries = fc.indicator.renderer.envelope();
    var multi = fc.series.multi()
        .xScale(dateScale)
        .yScale(priceScale)
        .series([envelopeSeries, ohlc]);

    // Add it to the chart
    container.append('g')
        .datum(data)
        .call(multi);

})(d3, fc);
