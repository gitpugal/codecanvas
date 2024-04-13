'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('@rollup/plugin-typescript');
var dts = require('rollup-plugin-dts');
var json = require('@rollup/plugin-json');
var terser = require('@rollup/plugin-terser');
var peerDepsExternal = require('rollup-plugin-peer-deps-external');
var scss = require('rollup-plugin-scss');
var postcss = require('rollup-plugin-postcss');
var cssnano = require('cssnano');
var copy = require('rollup-plugin-copy');
var CleanCSS = require('clean-css');

const packageJson = require("./package.json");

var rollup_config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "esm",
        sourcemap: true,
      },
      {
        file: packageJson.main.replace(/\.js$/, ".min.js"),
        format: "esm",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.scss', '.css'],
      }),
      commonjs(),
      json(),
      typescript(),
      terser(),
      scss({ output: 'dist/components/style.css' }),  // Output compiled CSS to a file
      postcss({
        plugins: [cssnano()],  // Use cssnano for minification
        extract: true,  // Extract the minified CSS to a separate file
        minimize: true,
        sourceMap: true,
        modules: true,
      }),
      copy({
        targets: [
          { src: 'src/components/**/*.css', dest: 'dist/components' },
        ],
      }),
      copy({
        targets: [
          {
            src: 'src/components/**/*.css',
            dest: 'dist/components/css',
            transform: (contents) => new CleanCSS().minify(contents).styles
          }
        ]
      })
    ],
  },
  {
    input: "dist/cjs/types/src/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts.default()],
  },
];

exports.default = rollup_config;
