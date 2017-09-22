// rollup.config.js
// import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'build/module/index.js',
  sourceMap: true,
  external: [
    '@most/core',
    '@most/disposable',
    '@most/scheduler',
    '@most/types',
  ],
  plugins: [
    nodeResolve({
      browser: true
    }),
    // commonjs()
  ]
}
