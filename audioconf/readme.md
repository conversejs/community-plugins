# Audio Conference plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/audioconf/audioconf.png" />

## Overview
This plugin adds an audio conference feature a chat or groupchat. Both SIP and XMPP protocols are supported and a server-side conference bridge is required. For SIP, a PBX like Asterisk or FreeSWITCh can be used and for XMPP, a Colibri media server like Jitsi Videobridge is needed.


## Install
See https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## Configure
To configure, edit the converse settings and modify the click2_dial object. See demo.html for an example

```
converse.initialize({
    authentication: 'login',
    auto_away: 300,
    auto_reconnect: true,
    bosh_service_url: 'https://conversejs.org/http-bind/', // Please use this connection manager only for testing purposes
    message_archiving: 'always',
    view_mode: 'fullscreen',
    click2_dial: {
        custom_button_color: "orange",
        custom_frame_color: "black",
        dial_pad: "true",
        did: "3001",
        display_button: "false",
        div_css_class_name: "btn-style-round-a",
        draggable: "true",
        incompatible_browser_configuration: "hide_widget",
        placement: "bottom-right",
        rating: "false",
        ringback: "true",
        server_url: "./audioconf",
        show_branding: "false",
        show_frame: "true",
        text: "Ask",
        use_default_button_css: "true",
        protocol: "xmpp",
        xmpp: {domain: "pade.chat", server: "https://pade.chat:7443/http-bind/"},
        sip: {domain: "192.168.1.251", server: "wss://desktop-545pc5b:7443/sip/proxy?url=ws://192.168.1.251:5066", register: false, caller_uri: "sip:1002@192.168.1.251", authorization_user: "1002", password: "1234"}        
    },
    whitelisted_plugins: ["content", "canned", "info", "screencast", "vmsg", "directory", "search", "jitsimeet", "audioconf", "http-auth", "converse-download-dialog", "fastpath"]
});
```

Default setting will use the public meet.ji.si service to provide an XMPP (colibri) type audio conference. To have a SIP based audio conference with Asterisk or FreeSWITCH, change the protocol value to "sip" and edit the sip object accordingly.

## How to use
Click on the telephone icon on the conversation toolbar to display the modal form
