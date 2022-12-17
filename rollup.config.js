import typescript from '@rollup/plugin-typescript';

export default {
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
};
