import ohlcBase from '../ohlcBase';
import { rebind, rebindAll } from '@d3fc/d3fc-rebind';
import colors from '../colors';

export default (pathGenerator) => {

    const base = ohlcBase();

    const candlestick = (data) => {
        const filteredData = data.filter(base.defined());
        const context = pathGenerator.context();

        filteredData.forEach((d, i) => {
            context.save();

            const values = base.values(d, i);
            context.translate(values.cross, values.high);
            context.beginPath();
            if (pathGenerator.ohlcShape) {
                pathGenerator.x(0)
                    .open(() => values.open - values.high)
                    .width(values.width)
                    .ohlcShape(values.ohlcBarShape)
                    .high(0)
                    .low(() => values.low - values.high)
                    .close(() => values.close - values.high)([d]);
            }
            else {
                pathGenerator.x(0)
                    .open(() => values.open - values.high)
                    .width(values.width)
                    .high(0)
                    .low(() => values.low - values.high)
                    .close(() => values.close - values.high)([d]);
            }

            const color = values.direction === 'up' ? colors.green : colors.red;
            context.strokeStyle = color;
            context.fillStyle = color;

            base.decorate()(context, d, i);

            context.fill();
            context.stroke();
            context.closePath();

            context.restore();
        });
    };

    rebind(candlestick, pathGenerator, 'context');
    rebindAll(candlestick, base);

    return candlestick;

};
