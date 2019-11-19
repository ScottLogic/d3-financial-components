export const circle = {
    header: `varying float vSize;`,
    body: `float distance = length(2.0 * gl_PointCoord - 1.0);
    if (distance > 1.0) {
        discard;
        return;
    }`
};

export const square = {
    header: `varying float vSize;`,
    body: `vec2 pointCoordTransform = 2.0 * gl_PointCoord - 1.0;
        float distance = max(abs(pointCoordTransform.x), abs(pointCoordTransform.y));`
};

export const triangle = {
    header: `varying float vSize;`,
    body: `vec2 pointCoordTransform = 2.0 * gl_PointCoord - 1.0;
    float topEdgesDistance = abs(pointCoordTransform.x) - ((pointCoordTransform.y - 0.6) / sqrt(3.0));
    float bottomEdgeDistance = pointCoordTransform.y + 0.5;
    float distance = max(topEdgesDistance, bottomEdgeDistance);
    if (distance > 1.0) {
        discard;
    }`
}

export const ohlc = {
    header: `varying float vColorIndicator;`,
    body: `gl_FragColor = vec4(0.4, 0.8, 0, 1);
    if (vColorIndicator < 0.0) {
        gl_FragColor = vec4(0.8, 0.4, 0, 1);
    }`
};

export const area = {
    header: `varying float vDefined;
        varying vec4 vColor;`,
    body: `if (vDefined < 0.5) {
            discard;
        }
        gl_FragColor = vec4(0.86, 0.86, 0.86, 1);
        gl_FragColor = vColor;`
}

export const pointAlias = {
    body: `gl_FragColor.a = gl_FragColor.a * (1.0 - smoothstep(vSize - 2.0, vSize, distance * vSize));`
};

export const multiColor = {
    header: `varying vec4 vColor;`,
    body: `gl_FragColor = vColor;`
};

export const seriesColor = {
    header: `uniform vec4 uColor;`,
    body: `gl_FragColor = uColor;`
};

export const pointEdge = {
    header: `uniform vec4 uEdgeColor;
             uniform float uStrokeWidth;`,
    body: `float sEdge = smoothstep(vSize - uStrokeWidth - 2.0, vSize - uStrokeWidth, distance * (vSize + uStrokeWidth));
           gl_FragColor = (uEdgeColor * sEdge) + ((1.0 - sEdge) * gl_FragColor);`
};
