const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  webpack: {
    plugins: {
      // `process` isn't in this plugin's default polyfill set (only
      // legacy Node core modules are) — Cardano's crypto stack (ripemd160,
      // readable-stream, etc.) reads `process.nextTick`/`process.browser`
      // at module load time, so it has to be explicitly opted in.
      add: [new NodePolyfillPlugin({ additionalAliases: ['process'] })],
    },
    configure: (webpackConfig) => {
      // Mesh SDK's dependency chain ships ESM packages (e.g. node-stdlib-browser)
      // that omit file extensions in imports. Webpack 5 treats ESM as "fully
      // specified" by default and refuses to resolve those — relax that for
      // plain .js/.mjs modules so the polyfills webpack-5's own resolver pulls
      // in actually resolve.
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      })

      // @cardano-sdk packages (pulled in transitively via @utxos/sdk) ship
      // .map files referencing .ts sources that aren't published to npm.
      // source-map-loader can't resolve them — harmless, just noisy.
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
      ]

      // @sidan-lab/sidan-csl-rs-browser (Mesh SDK's CSL wasm) does
      // `import * as wasm from "./sidan_csl_rs_bg.wasm"`. CRA has no wasm
      // module type registered, so without this the .wasm file falls
      // through to CRA's catch-all `asset/resource` rule and gets turned
      // into a URL string instead of an instantiated module — every export
      // (e.g. `language_new_plutus_v1`) then looks missing at runtime.
      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        asyncWebAssembly: true,
      }

      const assetRule = webpackConfig.module.rules
        .find((rule) => Array.isArray(rule.oneOf))
        ?.oneOf.find((rule) => rule.type === 'asset/resource')
      if (assetRule) {
        assetRule.exclude = [...(assetRule.exclude || []), /\.wasm$/]
      }

      return webpackConfig
    },
  },
}
