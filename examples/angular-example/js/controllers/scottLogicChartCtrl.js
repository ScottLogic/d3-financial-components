define([
	'd3',
	'sl',
    'gridlines',
    'crosshairs',
    'measure',
    'financeScale',
    'candlestick',
    'ohlc',
    'annotation',
    'movingAverage',
    'volume',
    'bollingerBands',
    'fibonacciFan'
	], function(d3, sl) {

	function scottLogicChartCtrl($rootScope) {
		
		// Primary chart options will be set here
		this.chartDataOptions = { style: "bars", width: 3 }; // Possible style options are 'bars' and 'candles', width is used for candles
		this.chartAspect = 0.45; // Height to width mutiplier
		this.axisOptions = { xTicks: 10, yTicks: 5, volYTicks: 2 };
		this.showNavigator = true;
		this.navigatorAspect = 0.2; // Chart height to navigator height mutiplier
		this.showVolume = false;
		this.volumeAspect = 0.4; // Chart height to volume height mutiplier
		this.showFibonacci = false;

		this.gridlineOptions = { show: true };
		this.crosshairOptions = { show: false, snap: true, yValue: '' };
		this.measureOptions = { show: false, snap: true };

		this.annotations = [];
		this.indicators = [];
		this.bollingerOptions = { show: false, movingAverageCount: 5, standardDeviations: 2, yValue: 'close' };

		// Chart options for optimal chart but can be changed if required.
		this.chartId = '#scottLogicChart';
		this.initialDaysShown = 90;

		this.margin = {top: 15, right: 35, bottom: 30, left: 50};

		this.chartWidth = 0;
		this.chartHeight = 0;
		this.navWidth = 0;
		this.navHeight = 0;
		this.volWidth = 0;
		this.volHeight = 0;

		// Axes and Scaling
		this.minDate = null;
		this.maxDate = null;
		this.yMin = null;
		this.yMax = null;
		this.volYMax = null;

		this.xScale = null;
		this.yScale = null;
		this.xAxis = null;
		this.yAxis = null;
		this.navXScale = null;
		this.navYScale = null;
		this.navXAxis = null;
		this.volYScale = null;
		this.volYAxis = null;

		// Data
    	this.chartData = null;
    	this.chartSeries = null;
    	this.navSeries = null;
    	this.navLine = null;
		this.volumeData = null;
		this.volumeSeries = null;

		// SVG Element Handles
		this.mainDiv = null;
		this.plotChart = null;
		this.plotArea = null;
		this.navChart = null;
		this.gridLines = null;
		this.crosshairs = null;
		this.measure = null;
		this.bollinger = null;
		this.fibonacci = null;

		this.viewport = null;
		this.overlay = null;

		// SVG Behaviours
		this.zoomBehaviour = null;

		var share = this;

		this.hasData = function() {
			return $rootScope.chartData !== null;
		};

		this.setDataStyle = function(dataStyle) {

			if( !share.hasData() ) return;

			share.chartDataOptions.style = dataStyle;
			share.initialiseData($rootScope.chartData);
			share.redrawChart();
		};

		this.hasDataStyle = function(dataStyle) {
			return share.chartDataOptions.style == dataStyle;
		};

		this.toggleFeature = function(featureName) {
			if(featureName == 'gridlines') share.gridlineOptions.show = !share.gridlineOptions.show;
			else if(featureName == 'crosshairs') share.crosshairOptions.show = !share.crosshairOptions.show;
			else if(featureName == 'measure') share.measureOptions.show = !share.measureOptions.show;
			else if(featureName == 'bollinger') share.bollingerOptions.show = !share.bollingerOptions.show;
			else if(featureName == 'navigator') share.showNavigator = !share.showNavigator;
			else if(featureName == 'volume') share.showVolume = !share.showVolume;
			else if(featureName == 'fibonacci') share.showFibonacci = !share.showFibonacci;

			share.showHideFeatures();
		};

		this.hasFeature = function(featureName) {
			if(featureName == 'gridlines') return share.gridlineOptions.show;
			else if(featureName == 'crosshairs') return share.crosshairOptions.show;
			else if(featureName == 'measure') return share.measureOptions.show;
			else if(featureName == 'bollinger') return share.bollingerOptions.show;
			else if(featureName == 'navigator') return share.showNavigator;
			else if(featureName == 'volume') return share.showVolume;
			else if(featureName == 'fibonacci') return share.showFibonacci;
			return false;
		};

		this.applyToolOptions = function() {

			if( !share.hasData() ) return;

			var data = $rootScope.chartData;

			share.initialiseGridlines();
			share.initialiseAxes();
			share.initialiseCrosshairs(data);
			share.initialiseMeasure();
			share.initialiseBollinger(data);
			share.initialiseFibonacci(data);
		};

		this.applyCrosshairs = function() {
			if( !share.hasData() ) return;
	        share.initialiseCrosshairs($rootScope.chartData);
		};

		this.applyGridlines = function() {
			share.initialiseGridlines();
		};

        this.applyBollinger = function() {
            if( !share.hasData() ) return;
            share.initialiseBollinger($rootScope.chartData);
        };

        this.applyFibonacci = function() {
            if( !share.hasData() ) return;
            share.initialiseFibonacci($rootScope.chartData);
        };

        this.initialise = function() {

			if( !share.hasData() ) return;

			var data = $rootScope.chartData;

	    	share.minDate = new Date(d3.min(data, function (d) { return d.date; }).getTime() - 8.64e7);
	    	share.maxDate = new Date(d3.max(data, function (d) { return d.date; }).getTime() + 8.64e7);
	    	share.yMin = d3.min(data, function (d) { return d.low; });
	    	share.yMax = d3.max(data, function (d) { return d.high; });
	    	share.volYMax = d3.max(data, function (d) { return d.volume; });

			share.initialiseChart(data, sl);
			share.initialiseNavigator(data);
			share.initialiseGridlines();
			share.initialiseCrosshairs(data);
			share.initialiseMeasure();

			share.initialiseVolume(data);
			share.initialiseBollinger(data);
			share.initialiseFibonacci(data);

			share.initialiseBehaviours();
			share.initialiseOverlay(data);

			share.updateViewportFromChart();
	        share.updateZoomFromChart();
		};

		this.initialiseChart = function(data) {

			// Create the main chart
		    share.mainDiv = d3.select(share.chartId);

	    	$(window).on('resize', function() {
	    		// todo
	    	});

		    share.chartWidth = share.mainDiv.node().offsetWidth;
		    share.chartHeight = share.mainDiv.node().offsetWidth * share.chartAspect;

		    share.plotChart = share.mainDiv.classed('chart', true).append('svg')
		        .attr('width', share.chartWidth)
		        .attr('height', share.chartHeight)
		        .append('g')
		        .attr('transform', 'translate(' + share.margin.left + ',' + share.margin.top + ')');

		    var width = share.chartWidth - share.margin.left - share.margin.right,
		        height = share.chartHeight - share.margin.top - share.margin.bottom;

		    share.plotArea = share.plotChart.append('g').attr('clip-path', 'url(#plotAreaClip)');
		    share.plotArea.append('clipPath').attr('id', 'plotAreaClip').append('rect').attr({ width: width, height: height });

		    //share.xScale = d3.time.scale().domain([share.minDate, share.maxDate]).range([0, width]);
		   	share.xScale = sl.scale.finance().domain([share.minDate, share.maxDate]).range([0, width]);
		    share.yScale = d3.scale.linear().domain([share.yMin, share.yMax]).nice().range([height, 0]);

		    share.xScale.domain([
		        data[data.length - share.initialDaysShown - 1].date,
		        data[data.length - 1].date
		    ]);

		    share.initialiseData(data);
		    share.initialiseAxes();
		};

		this.initialiseData = function(data) {

		    share.chartData = this.chartDataOptions.style == 'candles' ? 
		    	sl.series.candlestick().rectangleWidth(this.chartDataOptions.width).xScale(share.xScale).yScale(share.yScale) :
		    	sl.series.ohlc().xScale(share.xScale).yScale(share.yScale);

		    share.plotArea.selectAll(".series").remove();
    		share.chartSeries = share.plotArea.append('g').attr('class', 'series').datum(data).call(share.chartData);
		};

		this.initialiseVolume = function(data) {

			var height = share.chartHeight - share.margin.top - share.margin.bottom;

			share.plotArea.selectAll('.volume').remove();

		    share.volYScale = d3.scale.linear().domain([0, share.volYMax]).nice().range([height,height * share.volumeAspect]);
		    share.volYAxis = d3.svg.axis().scale(share.volYScale).orient('left').ticks(share.axisOptions.yTicks)
		    share.volYAxis.tickFormat(function(d) {
				return d >= 1000000000 ? "" + Math.floor(d/1000000000) + " bil." : (d >= 1000000 ? "" + Math.floor(d/1000000) + " mil." : d);
			});
		    share.plotChart.append('g').attr('id', 'yVolAxis').attr('class', 'y axis').call(share.volYAxis);

		    share.volumeData = sl.series.volume()
		        .xScale(share.xScale)
		        .yScale(share.volYScale)
		        .barWidth(this.chartDataOptions.width);

		    share.volumeSeries = share.plotArea.append('g').attr('class', 'volume').datum(data).call(share.volumeData);
		};

		this.initialiseAxes = function() {

			share.plotChart.selectAll('.axis').remove();

		    share.xAxis = d3.svg.axis().scale(share.xScale).orient('bottom').ticks(share.axisOptions.xTicks);
		    share.yAxis = d3.svg.axis().scale(share.yScale).orient('right').ticks(share.axisOptions.yTicks);

		    var width = share.chartWidth - share.margin.left - share.margin.right;
		    var height = share.chartHeight - share.margin.top - share.margin.bottom;
		    share.plotChart.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(share.xAxis);
		    share.plotChart.append('g').attr('class', 'y axis').attr('transform', 'translate(' + width + ', 0)').call(share.yAxis);		    
		};

		this.initialiseNavigator = function(data) {
		    share.navWidth = share.chartWidth - share.margin.left - share.margin.right;
		    share.navHeight = (share.chartHeight * share.navigatorAspect) - share.margin.top - share.margin.bottom;

		    share.navChart = share.mainDiv.append('svg')
		        .classed('navigator', true)
		        .attr('width', share.navWidth + share.margin.left + share.margin.right)
		        .attr('height', share.navHeight + share.margin.top + share.margin.bottom)
		        .append('g')
		        .attr('transform', 'translate(' + share.margin.left + ', 0)'); // + share.margin.top + ')');

		    //share.navXScale = d3.time.scale().domain([share.minDate, share.maxDate]).range([0, share.navWidth]);
		    share.navXScale = sl.scale.finance().domain([share.minDate, share.maxDate]).range([0, share.navWidth]);
		    share.navYScale = d3.scale.linear().domain([share.yMin, share.yMax]).range([share.navHeight, 0]);
		    share.navXAxis = d3.svg.axis().scale(share.navXScale).orient('bottom');

		    share.navChart.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + share.navHeight + ')').call(share.navXAxis);

		    share.navSeries = d3.svg.area().x(function (d) { return share.navXScale(d.date); }).y0(share.navHeight).y1(function (d) { return share.navYScale(d.close); });
		    share.navLine = d3.svg.line().x(function (d) { return share.navXScale(d.date); }).y(function (d) { return share.navYScale(d.close); });
		    share.navChart.append('path').attr('class', 'data').attr('d', share.navSeries(data));
		    share.navChart.append('path').attr('class', 'line').attr('d', share.navLine(data));

		    share.viewport = d3.svg.brush().x(share.navXScale)
		    	.on("brush", function () {
		            share.xScale.domain(share.viewport.empty() ? share.navXScale.domain() : share.viewport.extent());
		            share.redrawChart();
		        })
		        .on("brushend", function () {
			        share.updateZoomFromChart();
			    });
			    share.navChart.append("g").attr("class", "viewport").call(share.viewport).selectAll("rect").attr("height", share.navHeight);
		};

		this.initialiseGridlines = function() {

			share.plotArea.selectAll('.gridlines').remove();

		    share.gridLines = sl.scale.gridlines()
		        .xScale(share.xScale)
		        .yScale(share.yScale)
		        .xTicks(share.axisOptions.xTicks);

		    share.plotArea.call(share.gridLines);
		};

		this.initialiseCrosshairs = function(data) {

			share.plotArea.selectAll('.crosshairs').remove();

		    share.crosshairs = sl.tools.crosshairs()
		        .target(share.plotArea)
		        .series(data)
		        .xScale(share.xScale)
		        .yScale(share.yScale)
		        .yValue(share.crosshairOptions.yValue)
		        .formatV(function(d) { return d3.time.format('%b %e')(d); })
		        .formatH(function(d, field) { return field + " : " + d3.format('.1f')(d); });

		    share.plotArea.call(share.crosshairs);
		};

		this.initialiseMeasure = function() {

			share.plotArea.selectAll('.measure').remove();

		    share.measure = sl.tools.measure()
		        .target(share.plotArea)
		        .xScale(share.xScale)
		        .yScale(share.yScale)
		        .formatH(function(d) { 
		            var timediff = d / 1000;
		            var days = Math.floor(timediff / 86400),
		                hours = Math.floor((timediff % 86400) / 3600),
		                minutes = Math.floor((timediff % 3600) / 60),
		                seconds = Math.floor(timediff % 60);

		            return '' + days + 'days ' + hours + 'h ' + minutes + 'm ' + seconds + 's'; 
		        })
        		.formatV(function(d) { return d3.format('.2f')(d); });

		    share.plotArea.call(share.measure);
		};

		this.initialiseBollinger = function(data) {

			share.plotArea.selectAll('.bollinger').remove();

		    share.bollinger = sl.indicators.bollingerBands()
		        .xScale(share.xScale)
		        .yScale(share.yScale)
		        .yValue(share.bollingerOptions.yValue)
		        .movingAverage(share.bollingerOptions.movingAverageCount)
		        .standardDeviations(share.bollingerOptions.standardDeviations);

		    share.plotArea.append('g').attr('class', 'bollinger').attr('id', 'bollinger').datum(data).call(share.bollinger);
		};

        this.initialiseFibonacci = function(data) {

            share.plotArea.selectAll('.fibonacci-fan').remove();

            share.fibonacci = sl.tools.fibonacciFan()
                .target(share.plotArea)
                .series(data)
                .xScale(share.xScale)
                .yScale(share.yScale)
                .active(false);

            share.plotArea.call(share.fibonacci);
        };

		this.initialiseBehaviours = function() {

		    share.zoomBehaviour = d3.behavior.zoom().x(share.xScale).on('zoom', function() {
		        if (share.xScale.domain()[0] < share.minDate) {
		        	var x = share.zoomBehaviour.translate()[0] - share.xScale(share.minDate) + share.xScale.range()[0];
		            share.zoomBehaviour.translate([x, 0]);
		        } else if (share.xScale.domain()[1] > share.maxDate) {
		        	var x = share.zoomBehaviour.translate()[0] - share.xScale(share.maxDate) + share.xScale.range()[1];
		            share.zoomBehaviour.translate([x, 0]);
		        }
		        share.redrawChart();
		        share.updateViewportFromChart();
		    });
		};

		this.initialiseOverlay = function(data) {

			var height = share.chartHeight - share.margin.top - share.margin.bottom;
		    share.overlay = d3.svg.area().x(function (d) { return share.xScale(d.date); }).y0(0).y1(height);
		    share.plotArea.append('path')
		    	.attr('class', 'overlay')
		    	.attr('id', 'plotOverlay')
		    	.attr('d', share.overlay(data))
		        .call(share.zoomBehaviour);
		};

		this.addIndicator = function() {
			share.indicators.push( { type: 'movingAverage', yLabel: 'Moving Average', averagePoints: 5, yValue:'close' } );
			share.redrawChart();
		};

		this.removeIndicator = function(index) {
			share.indicators.splice(index, 1);
			share.redrawChart();
		};

		this.indicatorUpdated = function(index) {
			if( !share.indicators[index].yValue ) return;
			if( !share.indicators[index].averagePoints ) return;

	        share.plotArea.select("#indicators_" + index).remove();
	        var indicator = sl.indicators.movingAverage()
				.xScale(share.xScale)
				.yScale(share.yScale)
				.yValue(share.indicators[index].yValue)
				.yLabel(share.indicators[index].yLabel)
				.averagePoints(share.indicators[index].averagePoints);
    		share.plotArea.append('g')
				.attr('class', 'indicator ' + share.indicators[index].yValue)
				.attr('id', 'indicators_' + index)
				.datum($rootScope.chartData)
				.call(indicator);
		};

		this.addAnnotation = function() {
			share.annotations.push( { yLabel: 'Annotation', yValue: Math.floor(((share.yMax - share.yMin) / 2.0) + share.yMin) } );
			share.redrawChart();
		};

		this.removeAnnotation = function(index) {
			share.annotations.splice(index, 1);
			share.redrawChart();
		};

		this.annotationUpdated = function(index) {
			if( !share.annotations[index].yValue ) return;

	        share.plotArea.select("#annotation_" + index).remove();
	        var annotation = sl.tools.annotation()
    				.index(index)
    				.xScale(share.xScale)
    				.yScale(share.yScale)
					.yValue(share.annotations[index].yValue)
					.yLabel(share.annotations[index].yLabel)
					.formatCallout(function(d) { return d3.format('.1f')(d); });
    		share.plotArea.call(annotation);
		};

	    this.redrawChart = function() {
	        share.plotChart.select('.x.axis').call(share.xAxis);
	        share.plotArea.call(share.gridLines);
	        share.plotArea.select('#bollinger').call(share.bollinger);
            share.fibonacci.update();

	        share.volumeSeries.call(share.volumeData);
	        share.chartSeries.call(share.chartData);

	        // Draw all indicators
	        share.plotArea.selectAll('.indicator').remove();
	        for(var i=0; i<share.indicators.length; i++) {
    			var indicator = null
    			if(share.indicators[i].type == 'movingAverage') {
    				indicator = sl.indicators.movingAverage()
    					.xScale(share.xScale)
    					.yScale(share.yScale)
						.yValue(share.indicators[i].yValue)
						.yLabel(share.indicators[i].yLabel)
						.averagePoints(share.indicators[i].averagePoints);
	    			share.plotArea.append('g')
	    				.attr('class', 'indicator ' + share.indicators[i].yValue)
	    				.attr('id', 'indicators_' + i)
	    				.datum($rootScope.chartData)
	    				.call(indicator);
	    		};
    		}

	        // Draw all annotations
	        share.plotArea.selectAll('.annotation').remove();
	        for(var i=0; i<share.annotations.length; i++) {
    			var annotation = sl.tools.annotation()
    				.index(i)
    				.xScale(share.xScale)
    				.yScale(share.yScale)
					.yValue(share.annotations[i].yValue)
					.yLabel(share.annotations[i].yLabel)
					.formatCallout(function(d) { return d3.format('.1f')(d); });
    			share.plotArea.call(annotation);
    		}
	    };

	    this.updateViewportFromChart = function() {
	        if ((share.xScale.domain()[0] <= share.minDate) && (share.xScale.domain()[1] >= share.maxDate)) { share.viewport.clear(); }
	        else { share.viewport.extent(share.xScale.domain()); }
	        share.navChart.select('.viewport').call(share.viewport);
	    };

	    this.updateZoomFromChart = function() {
	        share.zoomBehaviour.x(share.xScale);
	        var fullDomain = share.maxDate - share.minDate,
	            currentDomain = share.xScale.domain()[1] - share.xScale.domain()[0];
	        var minScale = currentDomain / fullDomain,
	            maxScale = minScale * 20;
	        share.zoomBehaviour.scaleExtent([minScale, maxScale]);
	    };

	    this.showHideFeatures = function() {

	    	share.plotArea.selectAll('.gridlines').style('display', share.gridlineOptions.show ? 'block' : 'none' );
	    	share.plotArea.selectAll('.crosshairs').style('display', share.crosshairOptions.show ? 'block' : 'none' );
	    	share.plotArea.selectAll('.measure').style('display', share.measureOptions.show ? 'block' : 'none' );
	    	share.plotArea.selectAll('.bollinger').style('display', share.bollingerOptions.show ? 'block' : 'none' );

            share.fibonacci.visible(share.showFibonacci);
            share.fibonacci.active(share.showFibonacci);

            share.crosshairs.freezable(share.crosshairOptions.show);

	    	share.plotArea.selectAll('.volume-series').style('display', share.showVolume ? 'block' : 'none' );
	    	share.plotChart.selectAll('#yVolAxis').style('display', share.showVolume ? 'block' : 'none' );
	    	share.mainDiv.selectAll('.navigator').style('display', share.showNavigator ? 'block' : 'none' );
	    };

		this.initialise();
		this.showHideFeatures();
	};

	scottLogicChartCtrl.$inject=['$rootScope'];

	return scottLogicChartCtrl;
});