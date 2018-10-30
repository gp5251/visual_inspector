const webpack               = require('webpack');
const path                  = require('path');
// const fs                    = require('fs');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const VueLoaderPlugin       = require('vue-loader/lib/plugin');
const UglifyJsPlugin        = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// const isProd = process.env.NODE_ENV == 'production';

let config = {
    entry: {
        popup: './popup.js',
        content: './content.js'
    },

    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
        chunkFilename: '[name].js' // 通过 import() 在js代码中倒入的模块
    },

    externals: {
        "vue": "Vue"
    },

    devtool : 'source-map',

    mode : 'production',

    resolve: {
        extensions: ['.js', '.vue'],
        // alias: {
        //     vue$: isProd ? 'vue/dist/vue.runtime.js' : 'vue/dist/vue.js'
        // }
    },

    stats: {
        maxModules: 5,
    },

    optimization: {
        nodeEnv: 'production',
        minimize: true,
        minimizer:[
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin()
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    name: 'vendors',
                    // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                    // minSize: 30000,
                    minChunks: 2,
                    priority: -10,
                    // chunks: 'initial'
                }
            }
        }
    },

    plugins: [
        new webpack.HashedModuleIdsPlugin(), // id改为hash，便于缓存
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
}

module.exports = config;
