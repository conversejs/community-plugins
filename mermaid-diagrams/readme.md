# Mermaid Diagrams plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/mermaid-diagrams/mermaid-diagrams.png" />

## Overview
This plugin uses [mermaid.js](https://mermaid-js.github.io/mermaid/#/) to generation of diagrams and flowcharts from text in a similar manner as markdown
The purpose of mermaid with converse is to create a tool that aims to make diagrams and flowcharts for communication easier.

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

The text is then rendered into this and made part of the chat:

<img src="https://github.com/conversejs/community-plugins/blob/master/mermaid-diagrams/flowchat.png"/>