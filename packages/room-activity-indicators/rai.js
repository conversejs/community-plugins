(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var raiDialog = null,
        _converse = null;

    converse.plugins.add("rai", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;

            _converse.api.settings.update({
                rai_notification: true,
                rai_notification_label: "Room Activity Indicator"
            });

            _converse.api.listen.on('connected', function () {
                setupRoomActivityIndicators(function (supported) {
                    if (supported) listenForRoomActivityIndicators();
                });
            });

            _converse.on('message', function (data)
            {
                var chatbox = data.chatbox;
                var message = data.stanza;
                var history = message.querySelector('forwarded');
                var body = message.querySelector('body');

                if (!history && body && chatbox)
                {
                    if (chatbox.get("type") == "chatroom" && chatbox.get("num_unread_general"))
                    {
                        doNotification(chatbox.get("jid"));
                    }
                }
            });
        }
    });

    function setupRoomActivityIndicators(callback)
    {
        try {
            const id = Math.random().toString(36).substr(2, 9);
            const to = "conference." + _converse.domain;
            _converse.connection.send(converse.env.$pres({
                to: to,
                id: id
            }).c('rai', {
                'xmlns': "xmpp:prosody.im/protocol/rai"
            }));

            if (callback) callback(true);
        } catch (e) {
            if (callback) callback(false);
        }
    }

    function listenForRoomActivityIndicators()
    {
        console.debug("listenForRoomActivityIndicators");

        _converse.connection.addHandler(function (message) {

            message.querySelectorAll('activity').forEach(function (activity)
            {
                console.debug("listenForRoomActivityIndicators - activity", activity);

                if (activity && activity.getAttribute("xmlns") == "xmpp:prosody.im/protocol/rai")
                {
                    const jid = activity.innerHTML;
                    doNotification(jid);
                }
            });

            const subject = message.querySelector('subject');
            const body = message.querySelector('body');
            if (subject && !body) sendMarker(message.getAttribute('from'), message.getAttribute('id'), 'received');

            return true;

        }, null, 'message', 'groupchat');
    }

    function doNotification(jid)
    {
        console.debug("doNotification", jid);

        _converse.api.trigger('chatRoomActivityIndicators', jid);

        if (_converse.api.settings.get("rai_notification"))
        {
            notifyText(_converse.api.settings.get("rai_notification_label"), jid, null, function (notificationId, buttonIndex) {
                _converse.api.rooms.open(jid);
            });
        }
    }

    function sendMarker(to_jid, id, type)
    {
        console.debug("sendMarker", to_jid, id, type);

        const stanza = converse.env.$msg({
          'from': _converse.connection.jid,
          'id': Math.random().toString(36).substr(2,9),
          'to': to_jid,
          'type': 'chat'
        }).c(type, {
          'xmlns': converse.env.Strophe.NS.MARKERS,
          'id': id
        });

        _converse.api.send(stanza);
    }

    function notifyText(message, title, notifyId, callback)
    {
        if (!notifyId) notifyId = Math.random().toString(36).substr(2, 9);

        console.debug("notifyText", message, title, notifyId);

        var prompt = new Notification(title, {
            body: message,
            requireInteraction: true
        });

        prompt.onclick = function (event) {
            event.preventDefault();
            if (callback) callback(notifyId, 0);
        }

        prompt.onclose = function (event) {
            event.preventDefault();
            if (callback) callback(notifyId, 1);
        }
    }
}));