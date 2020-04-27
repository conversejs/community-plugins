(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var raiDialog = null, _converse = null;

    converse.plugins.add("rai", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;

            _converse.api.settings.update({
                rai_notification: true,
                rai_notification_label: "Room Activity Indicator"
            });

            _converse.api.listen.on('connected', function()
            {
                setupRoomActivityIndicators(function(supported)
                {
                    console.debug("rai discover", supported);
                    if (supported) listenForRoomActivityIndicators();
                });
            });

            console.log("rai plugin is ready");
        }
    });

    function setupRoomActivityIndicators(callback)
    {
        try {
            const id = Math.random().toString(36).substr(2,9);
            const to =  "conference." + _converse.domain;
            _converse.connection.send(converse.env.$pres({to: to, id: id}).c('rai', {'xmlns': "xmpp:prosody.im/protocol/rai"}));

            if (callback) callback(true);
        } catch (e) {
            console.error("setupRoomActivityIndicators", e);
            if (callback) callback(false);
        }
    }

    function listenForRoomActivityIndicators()
    {
        console.debug("listenForRoomActivityIndicators");

        _converse.connection.addHandler(function(message)
        {
            console.debug("listenForRoomActivityIndicators - addHandler", message);

            message.querySelectorAll('activity').forEach(function(activity)
            {
                if (activity) {
                    const jid = activity.innerHTML;
                    _converse.api.trigger('chatRoomActivityIndicators', jid);

                    if (_converse.api.settings.get("rai_notification"))
                    {
                        notifyText(_converse.api.settings.get("rai_notification_label"), jid, null, function(notificationId, buttonIndex)
                        {
                            console.debug("listenForRoomActivityIndicators callback", notificationId, buttonIndex);
                            _converse.api.rooms.open(jid);
                        });
                    }
                }
            });

            return true;

        }, "xmpp:prosody.im/protocol/rai", 'message');
    }

    function notifyText(message, title, notifyId, callback)
    {
        console.debug("notifyText", title, message, notifyId);

        if (!notifyId) notifyId = Math.random().toString(36).substr(2,9);

        var prompt = new Notification(title,
        {
            body: message,
            requireInteraction: true
        });

        prompt.onclick = function(event)
        {
            event.preventDefault();
            if (callback) callback(notifyId, 0);
        }

        prompt.onclose = function(event)
        {
            event.preventDefault();
            if (callback) callback(notifyId, 1);
        }
    }
}));
