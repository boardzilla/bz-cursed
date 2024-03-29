import * as esbuild from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'

const env = process.env.NODE_ENV || "development"
const minify = env === "production"
const sourcemap = env === "production" ? false : "inline"

await esbuild.build({
  format: 'iife',
  assetNames: 'assets/[name]-[hash]',
  loader: {
    '.jpg': 'file',
    '.png': 'file',
    '.svg': 'file',
    '.webp': 'file',
    '.otf': 'file',
    '.scss': 'css',
    '.ogg': 'dataurl',
  },
  keepNames: true,
  sourcemap,
  sourceRoot: "src/ui",
  outfile: 'build/ui/index.js',
  entryPoints: ['./src/ui/'],
  bundle: true,
  minify,
  plugins: [sassPlugin()]
})
