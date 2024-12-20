import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const devMode = process.env.BUILD === 'dev';

let d3fcPkg = require('./package.json');

/**
 * Provides a method for building d3fc, or for testing code live 
 * by providing the 'dev' environment variable.
 * 
 * Command line options for use with 'dev':
 * 
 * --configOpen='foo.html'  
 *      Starts debugging at /examples/foo.html. If omitted, defaults to index.html
 * 
 * --configPkg='d3fc-bar'
 *      Starts debugging for the package /packages/d3fc-bar. If omitted defaults to d3fc
 * 
 * --port=1234
 *      Starts debugging with host on port 1234. If omitted defaults to 8080
 */
export default commandLineArgs => {
    let devPage = commandLineArgs.configOpen || 'index.html';
    const devPkg = commandLineArgs.configPkg || 'd3fc';
    const devPort = commandLineArgs.configPort || 8080;

    devPage = devPage.endsWith('.html') ? devPage : devPage + '.html';

    process.env.env = commandLineArgs.configEnv || 'dev';
    const shouldMinify = process.env.env === 'prod';
    const formats = process.env.BUILD !== undefined ? ['umd'] : ['umd', 'es'];

    const _plugins = [
        babel({ cwd: '../..' }),
        nodeResolve()
        ];

    if (shouldMinify) {
        _plugins.push(terser({ output: { comments: false } }));
    }
    let plugins = () => _plugins;

    const devPlugins = () => plugins().concat([
        serve({
            contentBase: '../..',
            open: true,
            openPage: `/examples/simple-chart/${devPage}`,
            host: 'localhost',
            port: devPort
        }),
        livereload({
            watch: ['build', `../${devPkg}/examples`]
        })
    ]);

    return formats.map((format) => ({
        input: 'index.js',
        plugins: devMode ? devPlugins() : plugins(),
        external: (key) => key.indexOf('d3-') === 0,
        output: {
            file: `build/${d3fcPkg.name}${shouldMinify ? '.min' : ''}.${format === 'es' ? 'mjs' : 'js'}`,
            format,
            ...(format === 'umd' && { name: 'fc' }),
            globals: (key) => {
                if (key.indexOf('d3-') === 0) {
                    return 'd3';
                }
            },
        },
        // There are circular dependencies in d3, https://github.com/d3/d3-interpolate/issues/58
        // Don't pollute the build with other modules errors
        onwarn: (warning, rollupWarn) => {
            if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.indexOf('d3-') !== -1) {
                return;
            }

            rollupWarn(warning);
        }
    }));
};
