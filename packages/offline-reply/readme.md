# Offline Reply plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/packages/offline-reply/offline-reply.png?raw=true" />

## Overview
This plugin allows an offline user to recieve and reply to a peer to peer (P2P) message sent using web push notification. 

## Install
see https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## How to use
If an offline user has accepted to recieve notifications and stored the web push notification subscription as a PEP event, then the offline message icon will appear on the toolbar.
Any messages typed will be sent to the XMPP server to to be action as offline messages as usual. This plugin will send the message directly to the offline user using the web push notification protocol. 
The recieving user can reply inline or open ConverseJS to have a full blown chat conversation.

## Warning
This plugin is experimental and was created to explore peer-to-peer web push notifications across the different browser platforms. In order to reply a message, user credentials are included in the encrypted web push message. Use at own risk.
