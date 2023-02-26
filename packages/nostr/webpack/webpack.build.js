/* global __dirname, module, process */
const ASSET_PATH = process.env.ASSET_PATH || '/dist/'; // eslint-disable-line no-process-env
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require("./webpack.common.js");
const path = require('path');
const { merge }  = require("webpack-merge");

const plugins = [
    new MiniCssExtractPlugin({filename: '../dist/converse-nostr.css'}),
];

module.exports = merge(common, {
    plugins,
    entry: {
        "converse-nostr": path.resolve(__dirname, "../src/index.js"),
    },
    output: {
        publicPath: ASSET_PATH,
        filename: "[name].js",
    },
    mode: "production",
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                        sourceMap: true
                    }
                },
                {
                    loader: "postcss-loader",
                    options: { sourceMap: true }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        sassOptions: {
                            includePaths: [
                                path.resolve(__dirname, '../node_modules/'),
                                path.resolve(__dirname, '../src/')
                            ]
                        },
                        sourceMap: true
                    }
                },
            ]
        }]
    }
});
