# Converse.js Community Plugins

This repo contains community contributed plugins, not included in the core of Converse.js.

## Creating a plugin

To create a new plugin, use [generator-converse](https://github.com/conversejs/generator-conversejs),
which is a [Yeoman](http://yeoman.io/) generator.

Install Yeoman and the generator:

    npm install -g yo generator-conversejs

Then, to create a new plugin, run the following:

    $ yo conversejs converse-pluginname

Where `pluginname` should be the name of your plugin.

## Adding a plugin to the repo here for general use

Simple raise a PR with your new plugin. Please make sure you do the following first

- Create a subfolder for your plugin and copy all your files in there. Please include at least a screenshot of the plugin working in converse.
- Edit demo.html and add your plugin to the demo page and make sure it works.
