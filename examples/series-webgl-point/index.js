const data = fc.randomGeometricBrownianMotion().steps(1e6)(1);

const extent = fc.extentLinear();

const xScale = d3.scaleLinear().domain([0, data.length - 1]);

const yScale = d3.scaleLinear().domain(extent(data));

const container = document.querySelector('d3fc-canvas');

const gl = d3
    .select(container)
    .select('canvas')
    .node()
    .getContext('webgl');

const series = fc
    .seriesWebglPoint()
    .xScale(xScale)
    .yScale(yScale)
    .context(gl)
    .crossValue((d, i) => i)
    .mainValue(d => d)
    .defined(() => true)
    .equals((previousData, data) => previousData.length > 0);

const pixels = new Uint8Array(
    gl.drawingBufferWidth * gl.drawingBufferHeight * 4
);
let frame = 0;

d3.select(container)
    .on('click', () => {
        const domain = xScale.domain();
        const max = Math.round(domain[1] / 2);
        xScale.domain([0, max]);
        container.requestRedraw();
    })
    .on('measure', () => {
        const { width, height } = event.detail;
        xScale.range([0, width]);
        yScale.range([height, 0]);
    })
    .on('draw', () => {
        performance.mark(`draw-start-${frame}`);
        series(data);
        // Force GPU to complete rendering to allow accurate performance measurements to be taken
        gl.readPixels(
            0,
            0,
            gl.drawingBufferWidth,
            gl.drawingBufferHeight,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );
        performance.measure(`draw-duration-${frame}`, `draw-start-${frame}`);
        frame++;
    });

container.requestRedraw();
