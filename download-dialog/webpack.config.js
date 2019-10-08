/* global __dirname, module, process */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist'), // Output path for generated bundles
        chunkFilename: '[id].js',
        filename: "converse-download-dialog.js"
    },
    entry: path.resolve(__dirname, 'src/converse-download-dialog.js'),
    externals: [{
        "window": "window",
        "converse": "converse",
    }],
    watchOptions: {
        ignored: [/dist/, /spec/, /.*\~/]
    },
    module: {
        rules: [
        {
            test: path.resolve(__dirname, "node_modules/backbone.vdomview/backbone.vdomview"),
            use: 'imports-loader?backbone.nativeview'
        },
        {
            test: path.resolve(__dirname, "node_modules/xss/dist/xss"),
            use: "exports-loader?filterXSS,filterCSS"
        },
        {
            test: /\.(html|svg)$/,
            exclude: /node_modules/,
            use: [{
                loader: 'lodash-template-webpack-loader',
                options: {
                    "escape": /\{\{\{([\s\S]+?)\}\}\}/g,
                    "evaluate": /\{\[([\s\S]+?)\]\}/g,
                    "interpolate": /\{\{([\s\S]+?)\}\}/g,
                    // By default, template places the values from your data in the
                    // local scope via the with statement. However, you can specify
                    // a single variable name with the variable setting. This can
                    // significantly improve the speed at which a template is able
                    // to render.
                    "variable": 'o',
                    "prependFilenameComment": __dirname
                }
            }]
        }, {
            test: /LC_MESSAGES\/converse.po$/,
            type: "json",
            use: [
            {
                loader: 'po-loader',
                options: {
                    'format': 'jed',
                    'domain': 'converse'
                }
            }
            ]
        }, {
            test: /webfonts\/.*\.(woff(2)?|ttf|eot|truetype|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
            {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'webfonts/'
                }
            }
            ]
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.resolve(__dirname, 'node_modules/'),
                        ],
                        sourceMap: true
                    }
                }
            ]
        }, {
            test: /\.js$/,
            exclude: /(node_modules|spec|mockup)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ["@babel/preset-env", {
                            "targets": {
                                "browsers": [">1%", "not ie 11", "not op_mini all"]
                            }
                        }]
                    ],
                    plugins: ['@babel/plugin-syntax-dynamic-import']
                }
            }
        }, {
            test: /bootstrap\.native/,
            use: {
                loader: 'bootstrap.native-loader',
                options: {
                    bs_version: 4,
                    ignore: ['carousel', 'scrollspy']
                }
            }
        }],
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            path.join(__dirname, 'node_modules'),
            path.join(__dirname, 'node_modules/@converse/'),
            path.resolve(__dirname, "src")
        ],
        alias: {
            "jszip":                    path.resolve(__dirname, "node_modules/jszip/dist/jszip"),
            "jszip_utils":              path.resolve(__dirname, "node_modules/jszip-utils/dist/jszip-utils"),
            "FileSaver":                path.resolve(__dirname, "node_modules/file-saver")
        }
    }
}
