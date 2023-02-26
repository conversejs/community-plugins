/* global __dirname, module, process */
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

let bootstrap_ignore_modules = ['carousel', 'scrollspy', 'tooltip', 'toast'];

const BOOTSTRAP_IGNORE_MODULES = (process.env.BOOTSTRAP_IGNORE_MODULES || '').replace(/ /g, '').trim();
if (BOOTSTRAP_IGNORE_MODULES.length > 0) {
    bootstrap_ignore_modules = bootstrap_ignore_modules.concat(BOOTSTRAP_IGNORE_MODULES.split(','));
}

module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'), // Output path for generated bundles
        chunkFilename: '[name].js'
    },
    devtool: "source-map",
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/
            })
        ],
    },
    externals: [{
        "window": "window"
    }],
    watchOptions: {
        ignored: /dist/,
    },
    module: {
        rules: [
        {
            test: /LC_MESSAGES[\\/]converse.po$/,
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
            test: /webfonts[\\/].*\.(woff(2)?|ttf|eot|truetype|svg)(\?v=\d+\.\d+\.\d+)?$/,
            type: 'asset/resource',
            generator: {
                filename: '[name][ext]',
                publicPath: 'webfonts/',
                outputPath: 'webfonts/'
            }
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
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
        }, {
            test: /\.js$/,
            include: [
                /src/,
            ],
            use: {
                loader: 'babel-loader'
            }
        }],
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            'node_modules',
            path.resolve(__dirname, "../node_modules/converse.js/src/")
        ],
        alias: {
            "@converse/headless":    path.resolve(__dirname, "../node_modules/converse.js/src/headless/"),
            "./shims":               path.resolve(__dirname, "../node_modules/converse.js/src/strophe-shims.js"),
        }
    }

}
