(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var _converse = null, Strophe, $iq, $msg, $pres, $build, b64_sha1, dayjs, html, _, __, Model, BootstrapModal, offline_reply_label;

    converse.plugins.add("offline-reply", {

        dependencies: [],

        initialize: function () {
            _converse = this._converse;

            Strophe = converse.env.Strophe;
            $iq = converse.env.$iq;
            $msg = converse.env.$msg;
            $pres = converse.env.$pres;
            $build = converse.env.$build;
            b64_sha1 = converse.env.b64_sha1;
            Model = converse.env.Model;
            BootstrapModal = converse.env.BootstrapModal;
            _ = converse.env._;
            __ = _converse.__;
            dayjs = converse.env.dayjs;
            html = converse.env.html;

            offline_reply_label = __('This contact will recieve offline messages');

            _converse.api.listen.on('addClientFeatures', () =>
            {
                console.debug("addClientFeatures");
                _converse.api.disco.own.features.add("urn:xmpp:json:0+notify")
            })

            _converse.api.listen.on('connected', function()
            {
                const bosh = _converse.api.settings.get("bosh_service_url");
                navigator.serviceWorker.controller?.postMessage({jid: _converse.connection.jid, password: _converse.connection.pass, bosh: bosh})
                listenForOfflineReply();
            });

            _converse.api.listen.on('messageSend', function(data)
            {
                const jid = data.get('jid');
                const contact = _converse.presences.findWhere({'jid': jid});
                console.debug("getToolbarButtons", jid, contact?.get("show"));

                if (contact?.get("show") == "offline")
                {
                    if (window.WebPushLib.selfSubscriptions[jid])
                    {
                        const secret = window.WebPushLib.selfSubscriptions[jid];
                        console.debug("messageSend offline message", secret, data.get('message'));

                        const fullname = _converse.xmppstatus.vcard.get('fullname') || _converse.bare_jid;
                        const image = _converse.xmppstatus.vcard.get('image');
                        const image_type = _converse.xmppstatus.vcard.get('image_type');

                        let avatar = null;
                        if (image && image_type)
                        {
                            avatar = "data:" + image_type + ";base64," + _converse.xmppstatus.vcard.get('image');
                        }

                        const payload = {msgBody: data.get('message'), msgFrom: _converse.bare_jid, msgType: 'chat', avatar: avatar, fullname: fullname};
                        window.WebPushLib.setVapidDetails('xmpp:' + _converse.bare_jid, secret.publicKey, secret.privateKey);

                        window.WebPushLib.sendNotification(secret.subscription, JSON.stringify(payload), {TTL: 60}).then(response => {
                            console.debug("Web Push Notification is sended!", response)
                        }).catch(e => {
                            console.error('Failed to notify ' + jid, e)
                        })
                    }
                }
            });

            _converse.api.listen.on('getToolbarButtons', function(toolbar_el, buttons)
            {
                const jid = toolbar_el.model.get("jid");
                const contact = _converse.presences.findWhere({'jid': jid});

                console.debug("getToolbarButtons", jid, contact?.get("show"));

                if (contact?.get("show") == "offline" && window.WebPushLib.selfSecret)
                {
                    let color = "fill:var(--chat-toolbar-btn-color);";
                    if (toolbar_el.model.get("type") == "chatroom") color = "fill:var(--muc-toolbar-btn-color);";

                    buttons.push(html`
                        <button class="plugin-offline-reply" title="${offline_reply_label}" @click=${performClick}/>
                            <svg data-jid="${jid}" style="width:18px; height:18px; ${color}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g><path d="M 27.91,11.79c 0.176,0.792, 0.278,1.606, 0.278,2.442c0,6.456-5.48,11.838-12.696,12.994 c 1.526,0.616, 3.236,0.976, 5.058,0.976c 1.718,0, 3.34-0.316, 4.804-0.866c 1.854,0.632, 3.878,0.796, 5.552,0.796 c-0.87-1.044-1.474-2.068-1.906-2.968C 30.856,23.508, 32,21.314, 32,18.898C 32,16.042, 30.406,13.496, 27.91,11.79zM 25.188,14.232C 25.188,8.582, 19.55,4, 12.594,4S0,8.582,0,14.232c0,2.948, 1.542,5.596, 3.998,7.464 c-0.462,1.192-1.244,2.75-2.57,4.344c 2.516,0, 5.756-0.33, 8.25-1.862c 0.938,0.182, 1.912,0.288, 2.916,0.288 C 19.55,24.464, 25.188,19.884, 25.188,14.232z"></path></g></svg>
                        </button>
                    `);
                }

                return buttons;
            });

            console.debug("offline-reply plugin is ready");
        }
    });

    function performClick(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();
    }

    function publishOfflineReply(json)
    {
        console.debug("publishOfflineReply", json);

        const stanza = $iq({type: 'set'}).c('pubsub', {xmlns: Strophe.NS.PUBSUB}).c('publish', {node: "urn:xmpp:json:0"}).c('item', {'id': 'current'}).c('json', {xmlns: "urn:xmpp:json:0"}).t(JSON.stringify(json)).up().up().up().c('publish-options').c('x', {'xmlns': Strophe.NS.XFORM, 'type': 'submit'}).c('field', {'var': 'FORM_TYPE', 'type': 'hidden'}).c('value').t('http://jabber.org/protocol/pubsub#publish-options').up().up().c('field', {'var': 'pubsub#persist_items'}).c('value').t('true').up().up().c('field', {'var': 'pubsub#access_model'}).c('value').t('open');

        _converse.connection.sendIQ(stanza, function(result)
        {
            console.debug("publishOfflineReply ok", result);

        }, function(error){
            console.error("publishOfflineReply", error);
        });
    }

    function handlePubSub(stanza)
    {
        const from = stanza.getAttribute("from");
        const handleElement = stanza.querySelector('json');
        console.debug('handlePubSub', from, handleElement);

        if (handleElement)
        {
            const json = handleElement.innerHTML;
            window.WebPushLib.selfSubscriptions[from] = JSON.parse(json);
        }
    }

    function listenForOfflineReply()
    {
        console.debug("listenForOfflineReply");

        if (window.WebPushLib && window.WebPushLib.selfSecret)
        {
            publishOfflineReply(window.WebPushLib.selfSecret);
        }

        _converse.connection.addHandler(function(message)
        {
            handlePubSub(message);
            return true;

        }, "http://jabber.org/protocol/pubsub#event", 'message');


        if ('serviceWorker' in navigator && 'PushManager' in window) navigator.serviceWorker.onmessage = function(event)
        {
            console.debug("Broadcasted from service worker : ", event.data);

            if (event.data.msgFrom)     // notification
            {
                if (event.data.msgType == "chat") _converse.api.chats.open(event.data.msgFrom);
                else
                if (event.data.msgType == "room") _converse.api.rooms.open(event.data.msgFrom);
            }
            else

            if (event.data.options)    // subscription renewal.
            {
                makeSubscription(function(err, subscription, keys)
                {
                    if (!err) handleSubscription(subscription, keys);
                })
            }
        }
    }
}));