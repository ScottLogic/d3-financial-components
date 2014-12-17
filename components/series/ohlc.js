(function(d3, fc) {
    'use strict';

    fc.series.ohlc = function(drawMethod) {

        // Configurable attributes
        var xScale = d3.time.scale(),
            yScale = d3.scale.linear(),
            tickWidth = fc.utilities.seriesElementWidth(d3.time.day, 0.35);

        var yOpen = fc.utilities.valueAccessor('open'),
            yHigh = fc.utilities.valueAccessor('high'),
            yLow = fc.utilities.valueAccessor('low'),
            yClose = fc.utilities.valueAccessor('close');

        // Function to return
        var ohlc;

        // Accessor functions
        var open = function(d) {
                return yScale(yOpen(d));
            },
            high = function(d) {
                return yScale(yHigh(d));
            },
            low = function(d) {
                return yScale(yLow(d));
            },
            close = function(d) {
                return yScale(yClose(d));
            },
            date = function(d) {
                return xScale(d.date);
            };

        // Up/down day logic
        var isUpDay = function(d) {
            return yClose(d) > yOpen(d);
        };
        var isDownDay = function(d) {
            return yClose(d) < yOpen(d);
        };
        var isStaticDay = function(d) {
            return yClose(d) === yOpen(d);
        };

        var barColour = function(d) {
            if (isUpDay(d)) {
                return 'green';
            } else if (isDownDay(d)) {
                return 'red';
            } else {
                return 'black';
            }
        };

        // Path drawing
        var makeBarPath = function(d) {
            var width = tickWidth(xScale),
                moveToLow = 'M' + date(d) + ',' + low(d),
                verticalToHigh = 'V' + high(d),
                openTick = 'M' + date(d) + ',' + open(d) + 'h' + (-width),
                closeTick = 'M' + date(d) + ',' + close(d) + 'h' + width;
            return moveToLow + verticalToHigh + openTick + closeTick;
        };

        var makeConcatPath = function(data) {
            var path = 'M0,0';
            data.forEach(function(d) {
                path += makeBarPath(d);
            });
            return path;
        };

        // Filters data, and draws a series of ohlc bars from the result as a single path.
        var makeConcatPathElement = function(series, elementClass, colour, data, filterFunction) {
            var concatPath;
            var filteredData = data.filter(function(d) {
                return filterFunction(d);
            });
            concatPath = series.selectAll('.' + elementClass)
                .data([filteredData]);

            concatPath.enter()
                .append('path')
                .classed(elementClass, true);

            concatPath
                .attr('d', makeConcatPath(filteredData))
                .attr('stroke', colour);


            concatPath.exit().remove();
        };

        // Common series element
        var makeSeriesElement = function(selection, data) {
            var series = d3.select(selection).selectAll('.ohlc-series').data([data]);
            series.enter().append('g').classed('ohlc-series', true);
            return series;
        };

        // Draw ohlc bars as groups of svg lines
        var ohlcLineGroups = function(selection) {
            selection.each(function(data) {
                var series = makeSeriesElement(this, data);

                var bars = series.selectAll('.bar')
                    .data(data, function(d) {
                        return d.date;
                    });

                // Enter
                var barEnter = bars.enter().append('g').classed('bar', true);
                barEnter.append('line').classed('high-low-line', true);
                barEnter.append('line').classed('open-tick', true);
                barEnter.append('line').classed('close-tick', true);

                // Update
                bars.classed({
                    'up-day': isUpDay,
                    'down-day': isDownDay,
                    'static-day': isStaticDay
                });

                bars.attr('stroke', barColour);

                bars.select('.high-low-line').attr({x1: date, y1: low, x2: date, y2: high});
                bars.select('.open-tick').attr({
                    x1: function(d) { return date(d) - tickWidth(xScale); },
                    y1: open,
                    x2: date,
                    y2: open
                });
                bars.select('.close-tick').attr({
                    x1: date,
                    y1: close,
                    x2: function(d) { return date(d) + tickWidth(xScale); },
                    y2: close
                });

                // Exit
                bars.exit().remove();
            });
        };

        // Draw ohlc bars as svg paths
        var ohlcBarPaths = function(selection) {
            selection.each(function(data) {
                var series = makeSeriesElement(this, data);

                var bars = series.selectAll('.bar')
                    .data(data, function(d) {
                        return d.date;
                    });

                bars.enter()
                    .append('path')
                    .classed('bar', true);

                bars.classed({
                    'up-day': isUpDay,
                    'down-day': isDownDay,
                    'static-day': isStaticDay
                });

                bars.attr({
                    'stroke': barColour,
                    'd': makeBarPath
                });

                bars.exit().remove();
            });
        };

        // Draw the complete series of ohlc bars using 3 paths
        var ohlcConcatBarPaths = function(selection) {
            selection.each(function(data) {
                var series = makeSeriesElement(this, data);
                makeConcatPathElement(series, 'up-day', 'green', data, isUpDay);
                makeConcatPathElement(series, 'down-day', 'red', data, isDownDay);
                makeConcatPathElement(series, 'static-day', 'black', data, isStaticDay);
            });
        };

        switch (drawMethod) {
            case 'line': ohlc = ohlcLineGroups; break;
            case 'path': ohlc = ohlcBarPaths; break;
            case 'paths': ohlc = ohlcConcatBarPaths; break;
            default: ohlc = ohlcBarPaths;
        }

        ohlc.xScale = function(value) {
            if (!arguments.length) {
                return xScale;
            }
            xScale = value;
            return ohlc;
        };

        ohlc.yScale = function(value) {
            if (!arguments.length) {
                return yScale;
            }
            yScale = value;
            return ohlc;
        };

        ohlc.tickWidth = function(value) {
            if (!arguments.length) {
                return tickWidth;
            }
            tickWidth = value;
            return ohlc;
        };

        ohlc.yOpen = function(value) {
            if (!arguments.length) {
                return yOpen;
            }
            yOpen = value;
            return ohlc;
        };

        ohlc.yHigh = function(value) {
            if (!arguments.length) {
                return yHigh;
            }
            yHigh = value;
            return ohlc;
        };

        ohlc.yLow = function(value) {
            if (!arguments.length) {
                return yLow;
            }
            yLow = value;
            return ohlc;
        };

        ohlc.yClose = function(value) {
            if (!arguments.length) {
                return yClose;
            }
            yClose = value;
            return ohlc;
        };

        return ohlc;
    };
}(d3, fc));