# Location plugin for converse.js

<img src="https://github.com/conversejs/community-plugins/blob/master/packages/mastodon/mastodon.png?raw=true" />

## Overview
This plugin implements [XEP-XXXX](https://igniterealtime.github.io/openfire-pade-plugin/xep/mastodon-api-over-xmpp.html) - This specification defines a protocol extension for communicating in-band with a Mastodon API server over XMPP.

## Install
see https://m.conversejs.org/docs/html/plugin_development.html on how to install this plugin

## Configure
To configure, edit the converse settings and modify the mastodon object attributes. See index.html for an example

```
converse.initialize({
    ....
	mastodon: {
		url: "https://toot.igniterealtime.org", 
		token: "",
		toolbar: true,
		limit: 25,	
		check: 15,	
		title: "Mastodon Feed"
	},
    ....
});
```

Default setting will use the public toot.igniterealtime.org service.

## How to use
Click on the arrow icon to publish your geo mastodon
