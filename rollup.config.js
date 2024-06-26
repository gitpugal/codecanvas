import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import json from '@rollup/plugin-json';
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import scss from "rollup-plugin-scss";
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';  // Import cssnano for minification
import copy from 'rollup-plugin-copy';
import CleanCSS from "clean-css";
const packageJson = require("./package.json");

export default [
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
