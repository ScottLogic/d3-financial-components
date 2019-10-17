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
