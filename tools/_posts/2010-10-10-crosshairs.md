---
layout: default
title: Crosshairs
---

This component draws a crosshair on a target element.
The crosshairs can be made to snap to a particular field on the data model, but by default will snap to any field.
By default the component will become fixed at its current position in response to a mouse click event, and unfrozen in response to a second click.

<div id="example_crosshairs" class="chart"> </div>

<div class="tabs">
  <div>
    <h4>JavaScript</h4>
<pre>
// Create an invisible overlay
var overlay = d3.svg.area()
  .x(function (d) { return chart.dateScale(d.date); })
  .y0(0)
  .y1(chart.layout.getPlotAreaHeight());

// Create the crosshairs
var crosshairs = fc.tools.crosshairs()
  .target(chart.plotArea)
  .series(dataSeries1)
  .xScale(chart.dateScale)
  .yScale(chart.priceScale)
  .formatH(function(d) { return d3.format('.1f')(d); })
  .formatV(function(d) { return d3.time.format('%b %e')(d); });

// Add the crosshairs on top of the overlay
chart.plotArea.append('path')
  .attr('class', 'overlay')
  .attr('d', overlay(dataSeries1))
  .call(crosshairs);
</pre>
  </div>
  <div>
    <h4>CSS</h4>
<pre>
line.crosshairs {
  stroke: #69f;
  stroke-width: 1;
}

circle.crosshairs {
  fill: none;
  stroke: #69f;
  stroke-width: 1;
}

text.crosshairs {
  font: 10px sans-serif;
}

.crosshairs.frozen {
  stroke: #933;
}
</pre>
  </div>
  <div>
    <h4>SVG Output</h4>
<xmp>
<g class="crosshairs">
	<line class="crosshairs horizontal"></line>
	<line class="crosshairs vertical"></line>
	<circle class="crosshairs circle"></circle>
	<text class="crosshairs callout horizontal"></text>
	<text class="crosshairs callout vertical"></text>
</g>
</xmp>
  </div>
</div>

<script type="text/javascript">
(function(){
  var chart = createPlotArea(dataSeries1, '#example_crosshairs');

  // Create the OHLC series
  var ohlc = fc.series.ohlc()
    .xScale(chart.dateScale)
    .yScale(chart.priceScale);

  // Add the primary OHLC series
  chart.plotArea.selectAll('.series').remove();
  chart.plotArea.append('g')
    .attr('class', 'series')
    .datum(dataSeries1)
    .call(ohlc);

  // Create an invisible overlay
  var overlay = d3.svg.area()
    .x(function (d) { return chart.dateScale(d.date); })
    .y0(0)
    .y1(chart.layout.getPlotAreaHeight());

  // Create the crosshairs
  var crosshairs = fc.tools.crosshairs()
    .target(chart.plotArea)
    .series(dataSeries1)
    .xScale(chart.dateScale)
    .yScale(chart.priceScale)
    .formatH(function(d) { return d3.format('.1f')(d); })
    .formatV(function(d) { return d3.time.format('%b %e')(d); });

  // Add the crosshairs on top of the overlay
  chart.plotArea.append('path')
    .attr('class', 'overlay')
    .attr('d', overlay(dataSeries1))
    .call(crosshairs);
}());
</script>
