# Room Activity Indicators plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/room-activity-indicators/rai.png" />

## Overview
This plugin implements [XEP-xxxx: Room Activity Indicators](https://matthewwild.co.uk/uploads/room_activity_indicators.html).
It provides a lightweight mechanism for the client to display an indication to the user that there are new messages in a room since the last time the user was joined there.

## Install
see https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## How to use
No UI to configure or visual component. It is to be used by a developer for listening for an event called "chatRoomActivityIndicators" for each MUC. The event will have a single object representing the Converse chatbox object.

```
_converse.api.listen.on('chatRoomActivityIndicators', function (chatbox) {
    const jid = chatbox.model.get("jid");
}
```
