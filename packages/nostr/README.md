# @converse/nostr

This is an experimental plugin to try and implement Nostr-over-XMPP.

A corresponding server component will also be required and implemented.

## About the build process

Instead of creating a file that should be loaded in addition to the
`converse.js` script, this plugin bundles all of Converse inside it and creates a
new single file `converse-nostr.js` to be used.

The reason for this is because this plugin imports files from `converse.js` and
if we tried to build it separately, it would create a new, separate `_converse` closure
(which contains the session and connection state). We need the plugin to share
the same `_converse` closure as `converse.js`, so we need to bundle both into
one file.

Plugins that don't import files from `converse.js`, or which import such files
that don't ultimately import `_converse` don't have this problem.
