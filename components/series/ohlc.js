(function(d3, fc) {
    'use strict';

    fc.series.ohlc = function(drawMethod) {

        // Configurable attributes
        var xScale = d3.time.scale(),
            yScale = d3.scale.linear(),
            tickWidth = fc.utilities.timeIntervalWidth(d3.time.day, 0.35);

        var yOpen = fc.utilities.valueAccessor('open'),
            yHigh = fc.utilities.valueAccessor('high'),
            yLow = fc.utilities.valueAccessor('low'),
            yClose = fc.utilities.valueAccessor('close');

        // Function to return
        var ohlc;

        // Element specific scales
        var chartXScale,
            chartYScale;

        // Accessor functions
        var open = function(d) {
                return chartYScale(yOpen(d));
            },
            high = function(d) {
                return chartYScale(yHigh(d));
            },
            low = function(d) {
                return chartYScale(yLow(d));
            },
            close = function(d) {
                return chartYScale(yClose(d));
            },
            date = function(d) {
                return chartXScale(d.date);
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

        // Path drawing
        var makeBarPath = function(d) {
            var width = tickWidth(chartXScale),
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
        var makeConcatPathElement = function(series, elementClass, data, filterFunction) {
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
                .attr('d', makeConcatPath(filteredData));

            concatPath.exit().remove();
        };

        // Common series element
        // TODO: All series components can use this.
        var makeSeriesElement = function(element, data) {
            element.__chart__ = element.__chart__ || {};
            chartYScale = element.__chart__.yScale || yScale;
            chartXScale = element.__chart__.xScale || xScale;
            element.__chart__.yScale = chartYScale;
            element.__chart__.xScale = chartXScale;
            element.__chart__.initialYScale = chartYScale.copy();
            var series = d3.select(element).selectAll('.ohlc-series').data([data]);
            series.enter().append('g').classed('ohlc-series', true);
            return series;
        };

        // Draw ohlc bars as svg paths
        var ohlcBarPaths = function(selection) {
            selection.each(function(data) {
                var series = makeSeriesElement(this, data);
                series.attr('transform', null);

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

                bars.attr('d', makeBarPath);

                bars.exit().remove();
            });
        };

        // Draw the complete series of ohlc bars using 3 paths
        var ohlcConcatBarPaths = function(selection) {
            selection.each(function(data) {
                var series = makeSeriesElement(this, data);
                series.attr('transform', null);
                makeConcatPathElement(series, 'up-day', data, isUpDay);
                makeConcatPathElement(series, 'down-day', data, isDownDay);
                makeConcatPathElement(series, 'static-day', data, isStaticDay);
            });
        };

        switch (drawMethod) {
            case 'path': ohlc = ohlcBarPaths; break;
            case 'paths': ohlc = ohlcConcatBarPaths; break;
            default: ohlc = ohlcBarPaths;
        }

        ohlc.zoom = fc.utilities.series.zoom('.ohlc-series');

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
            tickWidth = d3.functor(value);
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