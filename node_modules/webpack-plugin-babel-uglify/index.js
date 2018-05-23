const fs = require('fs')
const babel = require('babel-core')
const UglifyJS = require('uglify-js')

const defaultPreset = 'babel-preset-env'

function BabelUglifyPlugin(babelOpts) {
  this.babelOpts = (
    babelOpts === true ? {} :
    typeof babelOpts === 'object' ? babelOpts :
    {
      presets: [defaultPreset],
      sourceMaps: true,
    }
  )
}

BabelUglifyPlugin.prototype.apply = function(compiler) {
  const {babelOpts} = this

  compiler.hooks.afterEmit.tapAsync('WebpackPluginBabelUglify', (compilation, callback) => {
    const {assets} = compilation

    for (const assetName in assets) {
      const asset = assets[assetName]

      if (asset.emitted && assetName.endsWith('.js')) {
        // try get sourceMap
        let inputSourceMap
        try {
          inputSourceMap = JSON.parse(fs.readFileSync(asset.existsAt + '.map'))
        }
        catch(_) {}

        const babelOptsForAsset = Object.assign({inputSourceMap}, babelOpts)
        
        babel.transformFile(asset.existsAt, babelOptsForAsset, (e, transpiled) => {
          if (e) return callback(e)

          const uglifyOpts = transpiled.map ? {
            sourceMap: {
              content: transpiled.map,
              url: assetName + '.map'
            }
          } : {}

          const minified = UglifyJS.minify(transpiled.code, uglifyOpts)

          if (minified.error) return callback(minified.error)

          fs.writeFileSync(asset.existsAt, minified.code)

          if (minified.map) {
            fs.writeFileSync(asset.existsAt + '.map', minified.map)
          }

          callback()
        })
      }
    }
  })
}

module.exports = BabelUglifyPlugin