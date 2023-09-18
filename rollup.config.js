import typescript from '@rollup/plugin-typescript';
import { dts } from "rollup-plugin-dts";

export default [{
  input: 'src/index.ts',
  strictDeprecations: true,
  output: [
    {
      format: 'cjs',
      file: 'dist/index.cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      format: 'es',
      file: 'dist/index.esm.js',
      sourcemap: true,
    },
  ],
  plugins: [typescript({ sourceMap: true })],
}, {
  input: 'src/types.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
}];
