import { path } from 'd3-path';
import functor from './functor';

// Renders an OHLC as an SVG path based on the given array of datapoints. Each
// OHLC has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
export default () => {

    let context = null;
    let x = (d) => d.date;
    let open = (d) => d.open;
    let high = (d) => d.high;
    let low = (d) => d.low;
    let close = (d) => d.close;
    let orient = 'vertical';
    let width = functor(3);
    let ohlcShape = functor('line')

    const ohlc = function (data) {

        const drawingContext = context || path();

        data.forEach(function (d, i) {
            const xValue = x(d, i);
            const yOpen = open(d, i);
            const yHigh = high(d, i);
            const yLow = low(d, i);
            const yClose = close(d, i);
            const barWidth = width(d, i);
            const halfBarWidth = barWidth / 2;
            const halfWidth = barWidth * 2;
            const ohlcBarShape = ohlcShape(d, i);

            if (ohlcBarShape === 'bar') {
                drawingContext.rect(xValue - halfBarWidth, yHigh, barWidth, yLow - yHigh);
                drawingContext.moveTo(xValue, yOpen);
                drawingContext.lineTo(xValue - halfWidth, yOpen);
                drawingContext.moveTo(xValue, yClose);
                drawingContext.lineTo(xValue + halfWidth, yClose);
            }
            else {
                if (orient === 'vertical') {
                    drawingContext.moveTo(xValue, yLow);
                    drawingContext.lineTo(xValue, yHigh);
                    drawingContext.moveTo(xValue, yOpen);
                    drawingContext.lineTo(xValue - halfWidth, yOpen);
                    drawingContext.moveTo(xValue, yClose);
                    drawingContext.lineTo(xValue + halfWidth, yClose);
                }
                else {
                    drawingContext.moveTo(yLow, xValue);
                    drawingContext.lineTo(yHigh, xValue);
                    drawingContext.moveTo(yOpen, xValue);
                    drawingContext.lineTo(yOpen, xValue + halfWidth);
                    drawingContext.moveTo(yClose, xValue);
                    drawingContext.lineTo(yClose, xValue - halfWidth);
                }
            }

        });

        return context ? null : drawingContext.toString();
    };

    ohlc.context = (...args) => {
        if (!args.length) {
            return context;
        }
        context = args[0];
        return ohlc;
    };
    ohlc.x = (...args) => {
        if (!args.length) {
            return x;
        }
        x = functor(args[0]);
        return ohlc;
    };
    ohlc.open = (...args) => {
        if (!args.length) {
            return open;
        }
        open = functor(args[0]);
        return ohlc;
    };
    ohlc.high = (...args) => {
        if (!args.length) {
            return high;
        }
        high = functor(args[0]);
        return ohlc;
    };
    ohlc.low = (...args) => {
        if (!args.length) {
            return low;
        }
        low = functor(args[0]);
        return ohlc;
    };
    ohlc.close = (...args) => {
        if (!args.length) {
            return close;
        }
        close = functor(args[0]);
        return ohlc;
    };
    ohlc.width = (...args) => {
        if (!args.length) {
            return width;
        }
        width = functor(args[0]);
        return ohlc;
    };
    ohlc.orient = (...args) => {
        if (!args.length) {
            return orient;
        }
        orient = args[0];
        return ohlc;
    };
    ohlc.ohlcShape = (...args) => {
        if (!args.length) {
            return ohlcShape;
        }
        ohlcShape = functor(args[0]);
        return ohlc;
    };

    return ohlc;
};
