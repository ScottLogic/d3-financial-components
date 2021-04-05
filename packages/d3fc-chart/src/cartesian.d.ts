import { TStore } from './store'

type Functor<T> = ((...args: any[]) => T);
type TypeOrFunctor<T> = T | Functor<T>;

type XOrient = 'top' | 'bottom' | 'none';
type YOrient = 'left' | 'right' | 'none';

type WebglSeries = any; // Todo: Replace with import from d3fc-series
type CanvasSeries = any; // Todo: Replace with import from d3fc-series
type SVGSeries = any; // Todo: Replace with import from d3fc-series
type DataJoin = any; // Todo: External 
type Axis = any; // Todo: Not specific enough

type Decorator = (container: DataJoin, data: any, index: number) => void

type XAxisStore = TStore<'xTickFormat' | 'xTicks' | 'xTickArguments' | 'xTickSize' | 'xTickSizeInner' | 'xTickSizeOuter' | 'xTickValues' | 'xTickPadding' | 'xTickCenterLabel'>;
type YAxisStore = TStore<'yTickFormat' | 'yTicks' | 'yTickArguments' | 'yTickSize' | 'yTickSizeInner' | 'yTickSizeOuter' | 'yTickValues' | 'yTickPadding' | 'yTickCenterLabel'>;

type GetterSetter<TThis, TValue, TSetValue> = {
    (): TValue
    (value: TSetValue): TThis,
}

type CartesianChartScale<Scale, XScale, YScale, Prefix extends string> = {
    [Property in keyof Scale as `${Prefix}${Capitalize<string & Property>}`]: Scale[Property] extends GetterSetter<any, infer U, infer V>
    ? GetterSetter<CartesianChart<XScale, YScale>, U, V>
    : Scale[Property]
}


export type CartesianChartArgs<XScale, YScale> = [xScale: XScale, yScale?: YScale] | [{
    xScale?: XScale,
    yScale?: YScale,
    xAxis: {
        [key in XOrient]: Axis
    },
    yAxis: {
        [key in YOrient]: Axis
    }
}]

type TCartesianChart = typeof Cartesian;

export type CartesianChart<XScale, YScale> = {
    (selection: any): void;

    xOrient(): Functor<XOrient>;
    xOrient(orient: XOrient): CartesianChart<XScale, YScale>;

    yOrient(): Functor<YOrient>;
    yOrient(orient: YOrient): CartesianChart<XScale, YScale>;

    xDecorate(): Decorator;
    xDecorate(decorate: Decorator): CartesianChart<XScale, YScale>;

    yDecorate(): Decorator;
    yDecorate(decorate: Decorator): CartesianChart<XScale, YScale>;

    chartLabel(): Functor<string>;
    chartLabel(label: TypeOrFunctor<string>): CartesianChart<XScale, YScale>;

    xLabel(): Functor<string>;
    xLabel(label: TypeOrFunctor<string>): CartesianChart<XScale, YScale>;

    yLabel(): Functor<string>;
    yLabel(label: TypeOrFunctor<string>): CartesianChart<XScale, YScale>;

    xAxisHeight(): Functor<string>;
    xAxisHeight(height: TypeOrFunctor<string>): CartesianChart<XScale, YScale>;

    yAxisWidth(): Functor<string>;
    yAxisWidth(height: TypeOrFunctor<string>): CartesianChart<XScale, YScale>;

    webglPlotArea(): WebglSeries;
    webglPlotArea(plotArea: WebglSeries): CartesianChart<XScale, YScale>;

    canvasPlotArea(): CanvasSeries;
    canvasPlotArea(plotArea: CanvasSeries): CartesianChart<XScale, YScale>;

    svgPlotArea(): SVGSeries;
    svgPlotArea(plotArea: SVGSeries): CartesianChart<XScale, YScale>;

    decorate(): Decorator;
    decorate(decorate: Decorator): CartesianChart<XScale, YScale>;

    useDevicePixelRatio(): boolean;
    useDevicePixelRatio(useDevicePixelRatio: boolean): CartesianChart<XScale, YScale>;
}
    & XAxisStore
    & YAxisStore
    & CartesianChartScale<XScale, XScale, YScale, 'x'>
    & CartesianChartScale<YScale, XScale, YScale, 'y'>

export default function Cartesian<XScale, YScale>(...args: CartesianChartArgs<XScale, YScale>): CartesianChart<XScale, YScale>
