(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    let __, html, _converse;

    converse.plugins.add("toolbar-utilities", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;
            __ = _converse.__;
            html = converse.env.html;

            _converse.api.listen.on('getToolbarButtons', function(toolbar_el, buttons)
            {
                console.debug("getToolbarButtons", toolbar_el.model.get("jid"));

                buttons.push(html`
                    <button class="toolbar-utilities-scroll" title="${__('Scroll to the bottom')}" @click=${scrollToBottom} .chatview=${this.chatview}/>
                        <converse-icon class="fa fa-angle-double-down" size="1em"></converse-icon>
                    </button>
                `);

                buttons.push(html`
                    <button class="toolbar-utilities-thrash" title="${__('Trash chat history')}" @click=${trashHistory} .chatview=${this.chatview}/>
                        <converse-icon class="far fa-trash-alt" size="1em"></converse-icon>
                    </button>
                `);

                buttons.push(html`
                    <button class="toolbar-utilities-refresh" title="${__('Refresh chat history')}" @click=${refreshHistory} .chatview=${this.chatview}/>
                        <converse-icon class="fa fa-sync" size="1em"></converse-icon>
                    </button>
                `);

                return buttons;
            });

        }
    });

    function refreshHistory(ev)
    {
        const openChatbox = function(view)
        {
            let jid = view.model.get("jid");
            let type = view.model.get("type");

            console.debug("openChatbox", jid, type);

            if (jid)
            {
                if (type == "chatbox") _converse.api.chats.open(jid, {'bring_to_foreground': true}, true);
                else
                if (type == "chatroom") _converse.api.rooms.open(jid, {'bring_to_foreground': true}, true);
            }
        }

        ev.stopPropagation();
        ev.preventDefault();

        const view = this.chatview;

        if (view)
        {
            view.close();
            setTimeout(function() { openChatbox(view) });
        }
    }

    function trashHistory(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();

        this.chatview.clearMessages();
    }

    function scrollToBottom(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();

        this.chatview.viewUnreadMessages();
    }

}));
