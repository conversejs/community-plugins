# muc-presence-probe

A [converse.js](https://conversejs.org) plugin which sends out `<presence>`
stanzas of type `probe` whenever a message from an unknown author (i.e. one for
which we don't have a [ChatRoomOccupant](https://conversejs.org/docs/html/api/-_converse.ChatRoomOccupant.html))
is received.

The goal of a presence probe is to fetch presence-related information (such as
[XEP-317 Hats](https://xmpp.org/extensions/xep-0317.html).

A supporting XMPP server will respond to a probe with the probed user's
presence information.

MUC presence probes are described in [XEP-0045 section 17.3](https://xmpp.org/extensions/xep-0045.html#bizrules-presence).

Generally, this plugin will only make sense when you've disabled presences in a
MUC, but stil want to fetch presence-related metadata for message authors.
