import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const _dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(_dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      // name: 'index',
      // fileName: 'index',
      fileName: fmt => `index.${fmt}.js`,
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
      plugins: [
        typescript({
          tsconfig: resolve(_dirname, 'tsconfig.build.json'),
          declarationDir: resolve(_dirname, 'dist'),
          noEmitOnError: true,
          sourceMap: false,
        }),
      ],
    },
  },
});
