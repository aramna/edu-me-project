var webpack = require('webpack');
var path = require('path');

module.exports = {

    entry: [
        './src/index.js',
        'webpack-dev-server/client?http://0.0.0.0:4000',
    ],

    output: {
        path: '/',
        filename: 'bundle.js'
    },

    devServer_port: 4000,

    devServer: {
        hot: true,
        filename: 'bundle.js',
        publicPath: '/',
        historyApiFallback: true,
        contentBase: './public',
        proxy: {
            "*": "http://localhost:3000"
        },
        overlay: {
            errors: true,
            warnings: true
        },
        stats: {
            // Config for minimal console.log mess.
            assets: false,
            colors: true,
            version: false,
            hash: false,
            timings: false,
            chunks: false,
            chunkModules: false
        }
    },


    plugins: [
        // OccurenceOrderPlugin is needed for webpack 1.x only
        new webpack.HotModuleReplacementPlugin(),
    ],

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot', 'babel?' + JSON.stringify({
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                })],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                loader: 'style!css-loader'
            },
            {
                test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader'
            }
        ]
    },

    resolve: {
        root: path.resolve('./src')
    }


};

//
