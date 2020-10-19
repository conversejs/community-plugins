# download-dialog

A [converse.js](https://conversejs.org) plugin to download files from the chat-history.

## Overview
This Plugin adds a feature to download all files in the chat-history. The user can click on a button on the chat-toolbar to open the download-dialog. The download-dialog itself is a modal view. The user can select or deselect the files he wishes to download and set the filenames. All files fill be put into a zip-file and downloaded via the browser-dialog.

<img src="download_dialog.png" />

## Configuration
What files can be downloaded will be determined by the _allowed_download_servers_-parameter. The _allowed_download_servers_-parameter takes a list of allowed download-addresses. So if "www.wikipedia.org" is defined, only files from wikipedia will be considered for the download-dialog. If no parameter is set, only files from the xmpp-domain will be considered.

## Install
See https://conversejs.org/docs/html/plugin_development.html on how to install this plugin.

## Development
The plugin uses webpack. All the code for the plugin can be found in `src/download-dialog.js`. The styles can be found in `src/download_dialog.scss`. To Build the plugin first run `npm install` and then `npx webpack`. This creates the new version of the plugin. The plugin can be found under `dist/download-dialog.js`.
