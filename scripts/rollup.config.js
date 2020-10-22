import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import del from 'rollup-plugin-delete'

import pkg from '../package.json'

const generateConfig = (type) => {
  const typescriptOptions = {
    composite: false,
    declaration: false,
  }
  let babelrc = true
  let delTargets = [
    'dist/**/*.js',
    'dist/**/*.js.map',
    '!dist/browser.js',
    '!dist/browser.js.map',
  ]
  const output = {
    dir: 'dist/',
    format: type,
    entryFileNames: '[name].js',
    assetFileNames: '[name].js',
    sourcemap: true,
    exports: 'auto',
  }
  const input = new Set(['./src/main.ts', './src/time-sharing.ts'])
  if (type === 'esm') {
    typescriptOptions.declarationDir = `dist/`
    typescriptOptions.declaration = true
    output.entryFileNames = '[name].mjs'
    output.assetFileNames = '[name].mjs'
    delTargets = ['dist/**/*.mjs', 'dist/**/*.mjs.map', 'dist/**/*.d.ts']
    babelrc = false
  }
  if (type === 'iife') {
    input.delete('./src/time-sharing.ts')
    output.name = pkg.name
    output.entryFileNames = '[name].browser.js'
    output.assetFileNames = '[name].browser.js'
    delTargets = ['dist/browser.js', 'dist/browser.js.map']
  }
  return {
    input: Array.from(input),
    output,
    plugins: [
      del({
        targets: delTargets,
      }),
      alias({
        entries: [
          {
            find: '~',
            replacement: path.join(__dirname, '..', '/src'),
          },
        ],
      }),
      typescript(typescriptOptions),
      babel({
        extensions: ['.ts'],
        babelHelpers: 'bundled',
        babelrc,
      }),
    ],
    preserveModules: type !== 'iife',
  }
}

export default [
  generateConfig('esm'),
  generateConfig('cjs'),
  generateConfig('iife'),
]
