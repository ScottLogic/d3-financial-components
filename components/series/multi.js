(function(d3, fc) {
    'use strict';

    fc.series.multi = function() {

        var multi = function(selection) {

            selection.each(function(data) {

                var container = d3.select(this);

                var g = container.selectAll('g.multi-outer')
                    .data(multi.series.value);

                g.enter()
                    .append('g')
                    .attr('class', 'multi-outer')
                    .append('g')
                    .attr('class', 'multi-inner');

                g.exit()
                    .remove();

                g.select('g.multi-inner')
                    .each(function(d, i) {

                        var series = d3.select(this.parentNode)
                            .datum()
                            .xScale(multi.xScale.value)
                            .yScale(multi.yScale.value);

                        d3.select(this)
                            .datum(multi.mapping.value(data, series, i))
                            .call(series);
                    });
            });
        };

        multi.xScale = fc.utilities.property(d3.time.scale());
        multi.yScale = fc.utilities.property(d3.scale.linear());
        multi.series = fc.utilities.property([]);
        multi.mapping = fc.utilities.property(fc.utilities.fn.identity);

        return multi;
    };
}(d3, fc));