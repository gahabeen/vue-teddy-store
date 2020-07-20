import commonjs from '@rollup/plugin-commonjs' // Convert CommonJS modules to ES6
import buble from '@rollup/plugin-buble' // Transpile/polyfill with reasonable browser support
import autoExternal from 'rollup-plugin-auto-external'
import vue from 'rollup-plugin-vue' // Handle .vue SFC files
// import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: [
    {
      name: 'VueTeddyStore',
      sourcemap: true,
    },
  ],
  plugins: [
    commonjs(),
    autoExternal(),
    vue({
      compileTemplate: true,
    }),
    buble({
      objectAssign: 'Object.assign',
      transforms: {
        dangerousTaggedTemplateString: true,
        forOf: false,
      },
    }),
    // terser(),
  ],
}
