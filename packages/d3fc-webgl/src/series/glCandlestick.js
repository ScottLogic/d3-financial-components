import attributeBuilder from '../buffers/attributeBuilder';
import glScaleBase from '../scale/glScaleBase';
import programBuilder from '../program/programBuilder';
import rectShader from '../shaders/rect/shader';
import lineWidthShader from '../shaders/lineWidth';
import drawModes from '../program/drawModes';
import { rebind } from '@d3fc/d3fc-rebind';

export default () => {
    const program = programBuilder();
    let xScale = glScaleBase();
    let yScale = glScaleBase();
    const lineWidth = lineWidthShader();
    let decorate = () => {};

    const xValueAttrib = 'aXValue';
    const yValueAttrib = 'aYValue';
    const xDirectionAttrib = 'aXDirection';
    const yDirectionAttrib = 'aYDirection';
    const bandwidthAttrib = 'aBandwidth';
    const colorIndicatorAttrib = 'aColorIndicator';

    const verticesPerElement = 12;

    const draw = numElements => {
        const shaderBuilder = rectShader();
        program
            .vertexShader(shaderBuilder.vertex())
            .fragmentShader(shaderBuilder.fragment())
            .mode(drawModes.TRIANGLES);

        xScale.coordinate(0);
        xScale(program);
        yScale.coordinate(1);
        yScale(program);

        lineWidth(program);
        setColors(numElements);
        setYDirections(numElements);

        program.vertexShader().appendBody(`
        gl_Position.x += ((uLineWidth * aXDirection / 2.0) + (aBandwidth / 2.0)) / uScreen.x;
        gl_Position.y += (uLineWidth * aYDirection / 2.0) / uScreen.y;
      `);

        decorate(program);

        program(numElements * verticesPerElement);
    };

    draw.xValues = (...args) => {
        const builder = program.buffers().attribute(xValueAttrib);
        let xArray = new Float32Array(args[0].length * verticesPerElement);
        xArray = xArray.map(
            (_, i) => args[0][Math.floor(i / verticesPerElement)]
        );

        const xDirBuffer = program.buffers().attribute(xDirectionAttrib);
        let xDirArray = new Float32Array(args[0].length * verticesPerElement);
        const xDirections = [1, -1, -1, 1, 1, -1, 1, -1, -1, 1, 1, -1];
        xDirArray = xDirArray.map(
            (_, i) => xDirections[i % verticesPerElement]
        );

        if (builder) {
            builder.data(xArray);
            xDirBuffer.data(xDirArray);
        } else {
            program
                .buffers()
                .attribute(
                    xValueAttrib,
                    attributeBuilder(xArray).components(1)
                );
            program
                .buffers()
                .attribute(
                    xDirectionAttrib,
                    attributeBuilder(xDirArray).components(1)
                );
        }
        return draw;
    };

    draw.open = (...args) => {
        addToYBuffer(args[0], [6, 7, 9]);
        return draw;
    };

    draw.high = (...args) => {
        addToYBuffer(args[0], [2, 4, 5]);
        return draw;
    };

    draw.low = (...args) => {
        addToYBuffer(args[0], [0, 1, 3]);
        return draw;
    };

    draw.close = (...args) => {
        addToYBuffer(args[0], [8, 10, 11]);
        return draw;
    };

    draw.bandwidth = (...args) => {
        const builder = program.buffers().attribute(bandwidthAttrib);
        let bandwidthArray = new Float32Array(
            args[0].length * verticesPerElement
        );
        bandwidthArray = bandwidthArray.map((d, i) => {
            if ([6, 7, 8, 9, 10, 11].includes(i % verticesPerElement)) {
                const val = args[0][Math.floor(i / verticesPerElement)];
                return [6, 9, 10].includes(i % verticesPerElement) ? val : -val;
            } else {
                return d;
            }
        });

        if (builder) {
            builder.data(bandwidthArray);
        } else {
            program
                .buffers()
                .attribute(
                    bandwidthAttrib,
                    attributeBuilder(bandwidthArray).components(1)
                );
        }
        return draw;
    };

    draw.decorate = (...args) => {
        if (!args.length) {
            return decorate;
        }
        decorate = args[0];
        return draw;
    };

    draw.xScale = (...args) => {
        if (!args.length) {
            return xScale;
        }
        xScale = args[0];
        return draw;
    };

    draw.yScale = (...args) => {
        if (!args.length) {
            return yScale;
        }
        yScale = args[0];
        return draw;
    };

    const addToYBuffer = (values, indexPositions) => {
        const yValBuffer = program.buffers().attribute(yValueAttrib);
        let yArray = new Float32Array(values.length * verticesPerElement);

        if (yValBuffer) {
            const existingYValues = yValBuffer.data();
            yArray = yArray.map((_, i) =>
                indexPositions.includes(i % verticesPerElement)
                    ? values[Math.floor(i / verticesPerElement)]
                    : existingYValues[i]
            );
            yValBuffer.data(yArray);
        } else {
            yArray = yArray.map((d, i) =>
                indexPositions.includes(i % verticesPerElement)
                    ? values[Math.floor(i / verticesPerElement)]
                    : d
            );
            program
                .buffers()
                .attribute(
                    yValueAttrib,
                    attributeBuilder(yArray).components(1)
                );
        }
    };

    const setColors = numElements => {
        const colorBuffer = program.buffers().attribute(colorIndicatorAttrib);
        let colorArray = new Float32Array(numElements * verticesPerElement);
        const yValues = program
            .buffers()
            .attribute(yValueAttrib)
            .data();

        colorArray = colorArray.map((_, i) => {
            const elementStartIndex =
                Math.floor(i / verticesPerElement) * verticesPerElement;
            const openVal = yValues[elementStartIndex + 7];
            const closeVal = yValues[elementStartIndex + 8];
            return openVal < closeVal ? 1 : -1;
        });

        if (colorBuffer) {
            colorBuffer.data(colorArray);
        } else {
            program
                .buffers()
                .attribute(
                    colorIndicatorAttrib,
                    attributeBuilder(colorArray).components(1)
                );
        }
    };

    const setYDirections = numElements => {
        const yDirBuffer = program.buffers().attribute(yDirectionAttrib);
        let yDirArray = new Float32Array(numElements * verticesPerElement);
        const yValues = program
            .buffers()
            .attribute(yValueAttrib)
            .data();

        yDirArray = yDirArray.map((_, i) => {
            const elementStartIndex =
                Math.floor(i / verticesPerElement) * verticesPerElement;
            const openVal = yValues[elementStartIndex + 7];
            const closeVal = yValues[elementStartIndex + 8];
            if ([6, 7, 8, 9, 10, 11].includes(i % verticesPerElement)) {
                const openValMin = Math.min(openVal, closeVal) === openVal;
                if ([6, 7, 9].includes(i % elementStartIndex)) {
                    return openValMin ? -1 : 1;
                } else {
                    return openValMin ? 1 : -1;
                }
            } else {
                return 0;
            }
        });

        if (yDirBuffer) {
            yDirBuffer.data(yDirArray);
        } else {
            program
                .buffers()
                .attribute(
                    yDirectionAttrib,
                    attributeBuilder(yDirArray).components(1)
                );
        }
    };

    rebind(draw, program, 'context');
    rebind(draw, lineWidth, 'lineWidth');

    return draw;
};
