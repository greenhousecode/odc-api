import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import external from '@yelo/rollup-node-external';

import pkg from './package.json';

export default {
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: external(),
  treeshake: true,
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
    }),
    commonjs({
      include: ['./src/**'],
    }),
    json(),
  ],
};
