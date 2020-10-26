import * as path from "path";

import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import external from "@yelo/rollup-node-external";

export default {
  input: path.join(__dirname, "src", "index.ts"),
  output: {
    file: path.join(__dirname, "dist", `index.js`),
    format: "cjs",
    sourcemap: true,
  },
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
      include: ["./src/**"],
    }),
    json(),
  ],
};
