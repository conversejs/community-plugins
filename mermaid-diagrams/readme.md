# Mermaid Diagrams plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/mermaid-diagrams/mermaid-diagrams.png" />

## Overview
This plugin uses [mermaid.js](https://mermaid-js.github.io/mermaid/#/) and [abcjs](https://github.com/paulrosen/abcjs) to generation of diagrams, flowcharts and music notation from text in a similar manner as markdown
The purpose of mermaid with converse is to create a tool that aims to make it easier to create diagrams, flowcharts and music for communication.

## Install
See https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

See index.html for example usage

## How to use

Diagrams can be created in a chat through text like this in a conversation:

```
graph TD
A[Client] --> B[Load Balancer]
B --> C[Server01]
B --> D[Server02]
```

The text is then rendered into a SVG vector diagram and made part of the chat:

<img src="https://github.com/conversejs/community-plugins/blob/master/mermaid-diagrams/flowchat.png"/>

Music is produced with the ABC notation system like this
```
X:1
K:D
"Am" DDAA|BBA2|
```

The text is then rendered into music notation and made part of the chat:

<img src="https://github.com/conversejs/community-plugins/blob/master/mermaid-diagrams/music.png"/>