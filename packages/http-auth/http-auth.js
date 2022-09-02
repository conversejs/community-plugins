/**
 * @module converse-http-auth
 * @description
 * Converse.js plugin which add support verification of an HTTP request via XMPP.
 * as specified in XEP-0070 Verifying HTTP Requests via XMPP
 * Author: Arnaud Joset
 */


const plugin = {
    dependencies: [],
    initialize() {

        const { _converse } = this;
        const { api, log } = _converse;

        api.settings.extend({
            'initialize_message': 'Initializing http-auth!',
            'hidden': [],
        });
        _converse.api.listen.on('connected', startListeners);

        function startListeners() {
            _converse.api.listen.stanza('message', { ns: "http://jabber.org/protocol/http-auth" }, stanzaHandler);
            _converse.api.listen.stanza('iq', { ns: "http://jabber.org/protocol/http-auth" }, stanzaHandler);

        }
        api.listen.on('chatBoxInsertedIntoDOM', model => {
            if (_converse.settings.hidden.includes(model.model.id)) {
                // Prevent the forbidden chatbox to be displayed
                console.info("Hiding ", model.model.id, " chatBox");
                model._removeElement()
            }
        });

        BootstrapModal = converse.env.BootstrapModal;
        __ = _converse.__;
        html = converse.env.html;
        Model = converse.env.Model;
        const httpAuthDialog = BootstrapModal.extend({
            id: "plugin-http-auth",
            events: {
                'click .btn-acceptAuth': 'acceptAuth',
                'click .btn-refuseAuth': 'refuseAuth',
            },

            initialize() {
                BootstrapModal.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model, 'change', this.render);
            },

            toHTML() {
                const httpAuthData = this.model.attributes.data;
                const title = __('Confirmation of Authentication');
                const question = __('The following platform needs to validate your identity, do you agree ?');
                const fromJid = httpAuthData.from;
                const vc = __('Validation Code : ');
                const id = httpAuthData.id;
                const accept = __('Accept');
                const refuse = __('Refuse');
                return html`<div id="httpAuth"> <div class="modal-dialog"> <div class="modal-content">
                            <div class="modal-header">
                            <h2 class="modal-title">${title}</h2>
                            <button type="button" class="close" data-dismiss="modal">&times;</button></div>
                            <div class="modal-body" style="text-align:center">${question}</br>
                            <strong>${fromJid}</strong>
                            </br>${vc}</br>
                            <strong>${id}</strong></div>
                            <div class="modal-footer" style="text-align:center">
                            <button type="button" class="btn btn-success btn-acceptAuth" data-dismiss="modal">${accept}</button>
                            <button type="button" class="btn btn-danger btn-refuseAuth" data-dismiss="modal">${refuse}</button>
                            </div></div></div>`;
            },

            buildResponse(responseType) {
                const httpAuthData = this.model.attributes.data;
                let stanzaType;
                let response;
                if (httpAuthData.stanzaType === 'message') {
                    stanzaType = responseType === 'refuse' ? 'error' : 'normal';
                    response = converse.env.$msg({
                        from: httpAuthData.to, // inverse from and to
                        to: httpAuthData.from, // inverse from and to
                        type: stanzaType,
                    });
                    response.c('thread').t(httpAuthData['thread']).up();
                } else {
                    stanzaType = responseType === 'refuse' ? 'error' : 'result';
                    response = converse.env.$iq({
                        from: httpAuthData.to,  // inverse from and to
                        to: httpAuthData.from, // inverse from and to
                        id: httpAuthData.iqId,
                        type: stanzaType,
                    });
                };
                response.c('confirm', {
                    'xmlns': 'http://jabber.org/protocol/http-auth',
                    'id': httpAuthData['id'], 'method': httpAuthData['method'],
                    'url': httpAuthData['url']
                }).up();
                if (responseType === 'refuse') {
                    response.c('error', { 'code': '401', 'type': 'auth' });
                    response.c('not-authorized', { 'xmlns': 'urn:ietf:params:xml:xmpp-stanzas' });
                }
                _converse.api.send(response);
            },
            acceptAuth() {
                this.buildResponse('accept');
            },
            refuseAuth() {
                this.buildResponse('refuse');
            },
        });

        function stanzaHandler(stanza) {
            if (stanza.localName === 'message' || stanza.localName === 'iq') {
                let confirm = stanza.getElementsByTagName('confirm');
                if (confirm.length > 0) {
                    confirm = confirm[0];
                    const httpAuthData = {
                        xmlns: confirm.getAttribute('xmlns'),
                        method: confirm.getAttribute('method'),
                        id: confirm.getAttribute('id'),
                        iqId:stanza.getAttribute('id'),
                        url: confirm.getAttribute('url'),
                        from: stanza.getAttribute('from'),
                        to: stanza.getAttribute('to'),
                        confirm: confirm,
                        message: stanza,
                        stanzaType: stanza.localName
                    };
                    if (stanza.localName === 'message') {
                        httpAuthData['thread'] = stanza.getElementsByTagName('thread')[0].textContent;
                    }
                    const confirmDialog = new httpAuthDialog({ 'model': new Model({ view: _converse.rosterview, data: httpAuthData }) });
                    confirmDialog.show();
                }
            }
            return true;
        };
        console.info("http-auth plugin is ready");

    },
}

if (typeof converse === "undefined") {
    window.addEventListener(
        'converse-loaded',
        () => converse.plugins.add("http-auth", plugin)
    );
} else {
    converse.plugins.add("http-auth", plugin);
}
