#!/usr/bin/env node

const { build } = require('esbuild');
const { dtsPlugin } = require('esbuild-plugin-d.ts');

build({
  entryPoints: ['./src/index.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  external: ['k6'],
  format: 'cjs',
  legalComments: 'none',
  logLevel: 'info',
  target: 'node14',
  plugins: [
    dtsPlugin()
  ]
}).catch(() => process.exit(1));
