// A Converse.js plugin
//
// Note, this plugin assumes that the "converse" object is globally defined.


// Commonly used utilities and variables can be found under the "env"
// namespace of the "converse" global.
let probed_jids = [];

const plugin = {
    // Dependencies are other plugins which might be
    // overridden or relied upon, and therefore need to be loaded before
    // this plugin. They are optional because they're not required to be
    // available (in which case any overrides applicable to them will be ignored).
    //
    // It's possible to make them required by setting
    // "strict_plugin_dependencies" to true,
    // An error will then be raised if the plugin is not found.
    dependencies: ['converse-muc', 'converse-status'],

    // Converse.js's plugin mechanism will call the initialize
    // method on any plugin (if it exists) as soon as all the plugin
    // have been loaded.
    initialize () {
        const { Strophe, $iq, u } = converse.env;
        const { _converse } = this;
        const { api, log } = _converse;
        log.info("The muc-presence-probe plugin is being initialized");

        api.listen.on('messageAdded', data => {
            // Whenever we receive a message from an unknown author, we send a
            // presence probe in order to get their hats information
            const { message, chatbox } = data;
            const jid = `${chatbox.get('jid')}/${message.get('nick')}`;
            if (message.get('sender') === 'them' && !message.occupant && !probed_jids.includes(jid)) {
                api.user.presence.send('probe', jid);
                probed_jids.push(jid);
            }
        });


        api.listen.on('MAMResult', async data => {
            // Whenever we receive a batch of MAM messages, we check for
            // unknown authors and send an IQ stanza to probe for their hats in bulk.
            const { chatbox, result } = data;
            const known_nicknames = chatbox.occupants.pluck('nick');
            const muc_jid = chatbox.get('jid');
            const jids_to_probe = [...new Set(result.messages
                .filter(m => !known_nicknames.includes(m.nick))
                .map(m => `${muc_jid}/${m.nick}`)
                .filter(jid => !probed_jids.includes(jid))
            )];

            const iq = $iq({'type': 'get'}).c('query', {'xmlns': Strophe.NS.MUC_USER});
            jids_to_probe.forEach(jid => iq.c('item', { jid }));
            const old_probed_jids = probed_jids;
            probed_jids = [...probed_jids, ...jids_to_probe];

            const iq_result = await api.sendIQ(iq, null, false);
            if (iq_result === null) {
                const err_msg = "Timeout while doing a batched presence probe.";
                log.error(err_msg);
                probed_jids = old_probed_jids
            } else if (u.isErrorStanza(iq_result)) {
                log.error("Error stanza while doing a batched presence probe.");
                log.error(iq_result);
            }
        });
    }
}

let converse = window.converse;

if (typeof converse === "undefined") {
    window.addEventListener(
        'converse-loaded',
        (ev) => {
            converse = ev.converse;
            converse.plugins.add("muc-presence-probe", plugin)
        }
    );
} else {
    converse.plugins.add("muc-presence-probe", plugin);
}
