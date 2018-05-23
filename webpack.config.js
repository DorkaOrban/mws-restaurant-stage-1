var path = require('path');
module.exports = {
  entry: ["./css/styles.css", "./css/mobilescreen.css"],
    output: {
        path:__dirname+ '/dist2/',
        filename: "bundle_main.css",
        publicPath: '/'
    },
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [ 
              {
                loader: "css-loader",
                options: {
                    minimize: true || {/* CSSNano Options */},
                    includePaths: [
                        path.resolve("./css")
                    ]
                }
              }
            ]
          }
      ]
    }
  }

// module.exports = {
//     entry: ["./js/main.js", "./js/common.js"],
//     output: {
//         path:__dirname+ '/dist/',
//         filename: "bundle_main.js",
//         publicPath: '/'
//     },
//     devServer: {
//         inline: false,
//         contentBase: "./dist",
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js?$/,
//                 exclude:/(node_modules)/,
//                 loader: 'babel-loader',
//                 query: {
//                     presets: ['es2015']
//                 }
//             }
//         ]
//     }
// };
// module.exports = {
//     entry: "./js/dbhelper.js",
//     output: {
//         path:__dirname+ '/dist/',
//         filename: "bundle_dbhelper.js",
//         publicPath: '/'
//     },
//     devServer: {
//         inline: false,
//         contentBase: "./dist",
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js?$/,
//                 exclude:/(node_modules)/,
//                 loader: 'babel-loader',
//                 query: {
//                     presets: ['es2015']
//                 }
//             } 
//         ]
//     }
// };
 
// webpack.config.js
// const MinifyPlugin = require("babel-minify-webpack-plugin");
// module.exports = {
// entry: ["./js/main.js", "./js/restaurant_info.js"],
//   output: {
//             path:__dirname+ '/dist/',
//             filename: "bundle_db_res.js",
//             publicPath: '/'
//         },
//   module: {
//       rules: [{
//           test: /\.js?$/,
//           loader: 'babel-loader',
//           query: {
//             presets: ['es2015']
//           }
//       }]

//     }
// }
