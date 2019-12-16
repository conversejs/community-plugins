# Jitsi Meet plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/jitsimeet/jitsimeet.png?raw=true" />
<img src="https://github.com/conversejs/community-plugins/blob/master/jitsimeet/jitsimeet2.png?raw=true" />

## Overview
This plugin uses a hosted Jitsi-Meet service to deliver an audio/video conferencing user experience.

## Install
see https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## Configure
To configure, edit the converse settings and modify all the jitsimeet_  values. See demo.html for an example

```
converse.initialize({
    authentication: 'login',
    auto_away: 300,
    auto_reconnect: true,
    bosh_service_url: 'https://conversejs.org/http-bind/', // Please use this connection manager only for testing purposes
    message_archiving: 'always',
    view_mode: 'fullscreen',
    jitsimeet_modal: false,
    jitsimeet_invitation: 'Please join meeting at',
    jitsimeet_confirm: 'Meeting?',
    jitsimeet_url: 'https://meet.jit.si',
    whitelisted_plugins: ["content", "canned", "info", "screencast", "vmsg", "directory", "search", "jitsimeet", "audioconf", "http-auth", "converse-download-dialog", "fastpath"]
});
```

Default setting will use the public meet.ji.si service.

## How to use
Click on the video icon on the conversation toolbar to turn a chat or groupchat into an audio/video conference
