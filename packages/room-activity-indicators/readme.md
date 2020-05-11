# Room Activity Indicators plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/room-activity-indicators/rai.png" />

## Overview
This plugin implements [XEP-xxxx: Room Activity Indicators](https://matthewwild.co.uk/uploads/room_activity_indicators.html).
It provides a lightweight mechanism for the client to display an indication to the user that there are new messages in a room since the last time the user was joined there.

## Install
see https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## How to use
It is to be used by a developer for listening for an event called "chatRoomActivityIndicators" for each MUC. The event will have a single string parameter representing the jid of the MUC room.

```
_converse.api.listen.on('chatRoomActivityIndicators', function (jid) {
    console.debug('new messages', jid);
}
```

The plugin can also trigger a browser Notification to indicate room activity. A Converse setting called **rai_notification** can be used to enable/disable the notification and another setting called **rai_notification_label** can be used to set the notification title/label.
When the notification is clicked or closed, the Converse chatroom will be opened.

