(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var _converse = null;

    converse.plugins.add("mermaid", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;

            mermaid.initialize({});

            console.log("mermaid plugin is ready");
        },

        overrides: {

            MessageView: {

                renderChatMessage: async function renderChatMessage()
                {
                    await this.__super__.renderChatMessage.apply(this, arguments);

                    const msgId = this.model.get("msgid");
                    const bodyDiv = document.querySelector('div[data-msgid="' + msgId + '"] .chat-msg__text');

                    if (bodyDiv)
                    {
                        const html = bodyDiv.innerHTML;

                        if (html.startsWith("graph TD") ||
                            html.startsWith("graph TB") ||
                            html.startsWith("graph BT") ||
                            html.startsWith("graph RL") ||
                            html.startsWith("graph LR") ||
                            html.startsWith("pie") ||
                            html.startsWith("gantt") ||
                            html.startsWith("stateDiagram") ||
                            html.startsWith("classDiagram") ||
                            html.startsWith("sequenceDiagram") ||
                            html.startsWith("erDiagram")) {

                            bodyDiv.innerHTML = '<div class="mermaid">' + html.replace(/<br>/g, '\n') + '</div>';
                            window.mermaid.init(bodyDiv.querySelector(".mermaid"));
                        }
                    }
                }
            }
        }
    });
}));
