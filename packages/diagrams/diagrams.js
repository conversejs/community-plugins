(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var _converse = null, html;

    converse.plugins.add("diagrams", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;
            html = converse.env.html;

            _converse.api.listen.on('afterMessageBodyTransformed', function(model, text)
            {
               renderDiagram(model.get("body"), text, model.get("msgid"));
            });

            mermaid.initialize({});

            console.debug("diagrams plugin is ready");
        }
    });

    function renderDiagram(body, text, msgId)
    {
        //console.debug("doDiagram", body, text, msgId);

        if (!body) return;

        if (body.startsWith("graph TD") ||
            body.startsWith("graph TB") ||
            body.startsWith("graph BT") ||
            body.startsWith("graph RL") ||
            body.startsWith("graph LR") ||
            body.startsWith("pie") ||
            body.startsWith("gantt") ||
            body.startsWith("stateDiagram") ||
            body.startsWith("classDiagram") ||
            body.startsWith("sequenceDiagram") ||
            body.startsWith("erDiagram")) {

            text.addTemplateResult(0, body.length, html`<br/><div id="mermaid-${msgId}" class="mermaid">\n${body.replace(/<br>/g, '\n')}\n</div>`);

            setTimeout(function()
            {
                window.mermaid.init(document.querySelector("#mermaid-" + msgId));
            }, 500);
        }
        else

        if (body.startsWith("X:1"))
        {
            text.addTemplateResult(0, body.length, html`<div id="abc-${msgId}"></div>`);

            setTimeout(function()
            {
                ABCJS.renderAbc("abc-" + msgId, body.replace(/<br>/g, '\n'));
            }, 500);
        }
    }
}));
