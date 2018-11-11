const webpack               = require('webpack');
const path                  = require('path');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const VueLoaderPlugin       = require('vue-loader/lib/plugin');
const UglifyJsPlugin        = require("uglifyjs-webpack-plugin");
const ZipPlugin             = require('zip-webpack-plugin');
const CopyWebpackPlugin     = require('copy-webpack-plugin');
const isProd                = process.env.NODE_ENV === 'production';

let config = {
    entry: {
        popup: './popup.js',
        content: './content.js'
    },

    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
    },

    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            vue: `vue/dist/vue${isProd ? '.min' : ''}.js`
        }
    },

    stats: {
        maxModules: 5,
        timings: true,
        modules: false,
        entrypoints: false
    },

    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename:'[name].css'
        }),
        new CopyWebpackPlugin(['./copy']),
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
                // 'vue-style-loader',
                MiniCssExtractPlugin.loader,
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
    config.plugins.push(new ZipPlugin({ path: '../', filename: 'VisualInspector.zip' }));
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
} else {
    config.mode = 'development';
    config.devtool = 'cheap-eval-source-map';
}

module.exports = config;
