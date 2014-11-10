#D3 Financial Components

We are building a set of re-usable [D3](http://d3js.org) components that make it easier to create financial charts. Some of these components have been demonstrated via the following blogs:

 + [An Fibonacci fan component](http://www.scottlogic.com/blog/2014/10/31/fibonacci.html)
 + [An interactive crosshairs component](http://www.scottlogic.com/blog/2014/09/29/crosshairs.html)
 + [A re-based comparison chart](http://www.scottlogic.com/blog/2014/09/26/an-interactive-stock-comparison-chart-with-d3.html)
 + [A bollinger band component](http://www.scottlogic.com/blog/2014/08/28/bollinger.html)
 + [Line annotations](http://www.scottlogic.com/blog/2014/08/26/two-line-components-for-d3-charts.html)
 + [OHLC and candlestick charts](http://www.scottlogic.com/blog/2014/08/19/an-ohlc-chart-component-for-d3.html)
 
We are in the process of tidying up these components into a single 'package'.

Included so far:
----------------

The following components are included in this version:

+ Annotations 
+ Bollinger Bands
+ Candlestick Data Series
+ Crosshairs
+ Fibonacci Fans
+ Financial Time Scale
+ Gridlines 
+ Measuring Tool
+ Mock Data Generator
+ OHLC (Open, High, Low, Close) Data Series 
+ Rolling Average Tracker 

Other files exists in the 'components' folder but these are utility classes for the main components.

Planned components in the near future
-------------------------------------

+ Auto margin calculator
+ Live data connector/stream

Short-comings and planned functionality
---------------------------------------

Documentation is scarce at the moment so we'll be concentrating on getting the documents pulled together. For now the [Scott Logic blog](http://www.scottlogic.com/blog/) provides some good blogs about some of the components. These blogs are referenced above.

### Annotations

The annotations component is currently missing the ability to display labels or numbers, we are currently looking at removing this component as we are not happy with how it works, currently creating a dataset to draw what is essentially a horizontal rule.

### Measuring Tool

the measuring tool needs to have a snapping mode as currently the resolution of measurement is dependant on how accurate the user is and also the zoom level of the chart.

##License

These components are licensed under the [MIT License](http://opensource.org/licenses/MIT)
