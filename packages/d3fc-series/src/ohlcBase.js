import { scaleIdentity } from 'd3-scale';
import defined from './defined';
import functor from './functor';
import alignOffset from './alignOffset';
import createBase from './base';

export default () => {

    let base;
    let crossValue = (d) => d.date;
    let openValue = (d) => d.open;
    let highValue = (d) => d.high;
    let lowValue = (d) => d.low;
    let closeValue = (d) => d.close;
    let bandwidth = () => 5;
    let ohlcShape = () => 'line';
    let align = 'center';
    let crossValueScaled = (d, i) => base.xScale()(crossValue(d, i));

    base = createBase({
        decorate: () => { },
        defined: (d, i) => defined(
            crossValue,
            openValue,
            lowValue,
            highValue,
            closeValue
        )(d, i),
        xScale: scaleIdentity(),
        yScale: scaleIdentity()
    });

    base.values = (d, i) => {
        const closeRaw = closeValue(d, i);
        const openRaw = openValue(d, i);
        const width = bandwidth(d, i);
        const offset = alignOffset(align, width);
        const ohlcBarShape = ohlcShape(ohlcShape)

        let direction = '';
        if (closeRaw > openRaw) {
            direction = 'up';
        } else if (closeRaw < openRaw) {
            direction = 'down';
        }

        return {
            cross: crossValueScaled(d, i) + offset,
            open: base.yScale()(openRaw),
            high: base.yScale()(highValue(d, i)),
            low: base.yScale()(lowValue(d, i)),
            close: base.yScale()(closeRaw),
            width,
            direction,
            ohlcBarShape
        };
    };

    base.xValues = () => [crossValue];
    base.yValues = () => [
        openValue,
        highValue,
        lowValue,
        closeValue
    ];
    base.crossValue = (...args) => {
        if (!args.length) {
            return crossValue;
        }
        crossValue = args[0];
        return base;
    };
    base.openValue = (...args) => {
        if (!args.length) {
            return openValue;
        }
        openValue = args[0];
        return base;
    };
    base.highValue = (...args) => {
        if (!args.length) {
            return highValue;
        }
        highValue = args[0];
        return base;
    };
    base.lowValue = (...args) => {
        if (!args.length) {
            return lowValue;
        }
        lowValue = args[0];
        return base;
    };
    base.yValue = base.closeValue = (...args) => {
        if (!args.length) {
            return closeValue;
        }
        closeValue = args[0];
        return base;
    };
    base.bandwidth = (...args) => {
        if (!args.length) {
            return bandwidth;
        }
        bandwidth = functor(args[0]);
        return base;
    };
    base.align = (...args) => {
        if (!args.length) {
            return align;
        }
        align = args[0];
        return base;
    };
    base.ohlcShape = (...args) => {
        if (!args.length) {
            return ohlcShape;
        }
        ohlcShape = functor(args[0]);
        return base;
    };

    return base;
};
