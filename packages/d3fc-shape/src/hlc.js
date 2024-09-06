import { path } from 'd3-path';
import functor from './functor';

// Renders an hlc as an SVG path based on the given array of datapoints. Each
// hlc has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
export default () => {

    let context = null;
    let x = (d) => d.date;
    let open = (d) => d.open;
    let high = (d) => d.high;
    let low = (d) => d.low;
    let close = (d) => d.close;
    let width = functor(3);

    const hlc = function (data) {

        const drawingContext = context || path();

        data.forEach(function (d, i) {
            const xValue = x(d, i);
            const yHigh = high(d, i);
            const yLow = low(d, i);
            const yClose = close(d, i);
            const barWidth = width(d, i);
            const halfBarWidth = barWidth / 2;
            const halfWidth = barWidth * 2;

            drawingContext.rect(xValue - halfBarWidth, yHigh, barWidth, yLow - yHigh);
            drawingContext.moveTo(xValue, yClose);
            drawingContext.lineTo(xValue + halfWidth, yClose);
        });

        return context ? null : drawingContext.toString();
    };

    hlc.context = (...args) => {
        if (!args.length) {
            return context;
        }
        context = args[0];
        return hlc;
    };
    hlc.x = (...args) => {
        if (!args.length) {
            return x;
        }
        x = functor(args[0]);
        return hlc;
    };
    hlc.open = (...args) => {
        if (!args.length) {
            return open;
        }
        open = functor(args[0]);
        return hlc;
    };
    hlc.high = (...args) => {
        if (!args.length) {
            return high;
        }
        high = functor(args[0]);
        return hlc;
    };
    hlc.low = (...args) => {
        if (!args.length) {
            return low;
        }
        low = functor(args[0]);
        return hlc;
    };
    hlc.close = (...args) => {
        if (!args.length) {
            return close;
        }
        close = functor(args[0]);
        return hlc;
    };
    hlc.width = (...args) => {
        if (!args.length) {
            return width;
        }
        width = functor(args[0]);
        return hlc;
    };
    hlc.orient = (...args) => {
        if (!args.length) {
            return orient;
        }
        orient = args[0];
        return hlc;
    };

    return hlc;
};
