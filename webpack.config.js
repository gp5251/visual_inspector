const webpack               = require('webpack');
const path                  = require('path');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const VueLoaderPlugin       = require('vue-loader/lib/plugin');
const UglifyJsPlugin        = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const isProd = process.env.NODE_ENV == 'production';

let config = {
    entry: {
        popup: './popup.js',
        content: './content.js'
    },

    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
    },

    externals: {
        "vue": "Vue"
    },

    resolve: {
        extensions: ['.js', '.vue'],
    },

    stats: {
        maxModules: 5,
        timings: true
    },

    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename:'css/[name].[contenthash].css'
        }),
        new webpack.DefinePlugin({
            "process.env": {
                DEVKIT_STAGE: JSON.stringify('production')
            }
        })
    ],

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
            }],
        }, {
            test: /\.vue$/,
            exclude: /node_modules/,
            use: [{
                loader: 'vue-loader'
            }]
        },{
            test: /\.(less|css)$/,
            use: [
                'vue-style-loader',
                'css-loader',
                'postcss-loader',
                'less-loader'
            ],
        },{
            test: /\.html$/,
            use: ['html-loader']
        },{
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },{
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader'
            ]
        }]
    }
};

if (isProd) {
    config.mode = 'production';
    config.optimization = {
        minimizer:[
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false
            }),
            new OptimizeCSSAssetsPlugin()
        ]
    }
    // config.devtool = 'source-map';
} else {
    config.mode = 'development';
    config.devtool = 'cheap-eval-source-map';
}

module.exports = config;
