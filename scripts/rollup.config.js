import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

var external = key =>
    key.indexOf('d3-') === 0 || key.indexOf('@d3fc/d3fc-') === 0;
var globals = function(key) {
    if (key.indexOf('d3-') === 0) {
        return 'd3';
    }
    if (key.indexOf('@d3fc/d3fc-') === 0) {
        return 'fc';
    }
};

const formats = ['umd', 'es'];

export default commandLineArgs => {
    process.env.env = commandLineArgs.configEnv || 'dev';
    const shouldMinify = process.env.env === 'prod';
    const plugins = [babel({ cwd: '../..' }), nodeResolve()];
    if (shouldMinify) {
        plugins.push(terser({ output: { comments: false } }));
    }
    const pkgInfo = require(`${process.cwd()}/package.json`);
    if (!pkgInfo) {
        throw Error(
            'Expected build to be triggered from directory containing package.json'
        );
    }
    let name = pkgInfo.name;
    if (!name) {
        throw Error('Expected package.json to contain `name` field');
    }
    name = name.replace('@d3fc/', '');
    return formats.map(format => ({
        input: 'index.js',
        plugins: plugins,
        external: external,
        output: {
            file: `build/${name}${shouldMinify ? '.min' : ''}.${
                format === 'es' ? 'mjs' : 'js'
            }`,
            format,
            globals: globals,
            extend: true,
            ...(format === 'umd' && { name: 'fc' })
        }
    }));
};
