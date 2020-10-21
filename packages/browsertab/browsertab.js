(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    let Strophe, $iq, $msg, $pres, $build, b64_sha1, _ , __, dayjs, html, _converse;
    let tabTitle = document.title, favicon;

    converse.plugins.add("browsertab", {

        dependencies: [],

        initialize: function () {
            _converse = this._converse;

            Strophe = converse.env.Strophe;
            $iq = converse.env.$iq;
            $msg = converse.env.$msg;
            $pres = converse.env.$pres;
            $build = converse.env.$build;
            b64_sha1 = converse.env.b64_sha1;
            _ = converse.env._;
            dayjs = converse.env.dayjs;

            _converse.api.settings.extend({
                browsertab_use_title: true,
                browsertab_use_favicon: true,
                browsertab_settings: {type : 'circle', position: 'up', animation: 'none'}
            });

            _converse.on('message', function (data)
            {
                console.debug('message', data);

                var chatbox = data.chatbox;
                var message = data.stanza;
                var history = message.querySelector('forwarded');
                var body = message.querySelector('body');

                if (!history && body && chatbox)
                {
                    setActiveConversationsUread(body.innerHTML);
                }
            });

            _converse.api.listen.on('connected', function()
            {
                tabTitle = document.title;
                favicon = new Favico(_converse.api.settings.get("browsertab_settings"));
            });

            _converse.api.listen.on('chatBoxViewInitialized', function(view)
            {
                console.debug("chatBoxInitialized", view.model.get("jid"));

                view.el.querySelector('.chat-textarea').addEventListener("focus", function(evt)
                {
                    console.debug("chatBox focus", evt);
                    setUnreadCount(0);
                });

                view.el.querySelector('.chat-textarea').addEventListener("blur", function(evt)
                {
                    console.debug("chatBox blur", evt);
                    setUnreadCount(0);
                });
            });

            console.debug("browsertab plugin is ready");
        }
    });


    function setActiveConversationsUread(newMessage)
    {
        let count = 0;

        _converse.chatboxes.each(function (chatbox)
        {
            if (chatbox.get("type") == "chatbox")
            {
                count = count + chatbox.get("num_unread");
            }
            else

            if (chatbox.get("type") == "chatroom")
            {
                count = count + chatbox.get("num_unread_general");
            }
        });

        setUnreadCount(count);
    }

    function setUnreadCount(count)
    {
        console.debug("setUnreadCount", count, _converse.api.settings.get("browsertab_use_favicon"), _converse.api.settings.get("browsertab_use_title"));

        if (_converse.api.settings.get("browsertab_use_title"))
        {
            if (count == 0 || count == "0")
            {
                document.title = tabTitle;
            }
            else {
                document.title = '(' + count + ') ' + tabTitle;
            }
        }

        if (_converse.api.settings.get("browsertab_use_favicon"))
        {
            if (favicon) favicon.badge(count);
        }
    }
}));