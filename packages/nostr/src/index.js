import 'converse.js/src/index.js';
import { converse } from '@converse/headless/core.js';
import './modals/add-contact.js';

converse.plugins.add("nostr", {
    dependencies: ['converse-status', 'converse-rosterview'],

    // Converse.js's plugin mechanism will call the initialize
    // method on any plugin (if it exists) as soon as all the plugin
    // have been loaded.
    initialize () {
        console.log("The nostr plugin is being initialized");
    }
});

window.converse = converse;

const ev = new CustomEvent('converse-loaded', {'detail': { converse }});
window.dispatchEvent(ev);

export default converse;
