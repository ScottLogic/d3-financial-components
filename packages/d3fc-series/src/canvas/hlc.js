import ohlcBase from './ohlcBase';
import { shapeHlc } from '@d3fc/d3fc-shape';

export default () => ohlcBase(shapeHlc());
