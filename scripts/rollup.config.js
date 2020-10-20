import path from 'path'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import del from 'rollup-plugin-delete'
import typescript from '@rollup/plugin-typescript'
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
  if (type === 'esm') {
    typescriptOptions.declarationDir = `dist/`
    typescriptOptions.declaration = true
    output.entryFileNames = '[name].mjs'
    output.assetFileNames = '[name].mjs'
    delTargets = ['dist/**/*.mjs', 'dist/**/*.mjs.map', 'dist/**/*.d.ts']
    babelrc = false
  }
  if (type === 'iife') {
    output.name = pkg.name
    output.entryFileNames = '[name].browser.js'
    output.assetFileNames = '[name].browser.js'
    delTargets = ['dist/browser.js', 'dist/browser.js.map']
  }
  return {
    input: './src/main.ts',
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
      commonjs(),
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
