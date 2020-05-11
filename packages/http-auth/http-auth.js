/**

 * @module converse-http-auth
 * @description
 * Converse.js plugin which add support verification of an HTTP request via XMPP.
 * as specified in XEP-0070 Verifying HTTP Requests via XMPP
 * Author: Arnaud Joset
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    'use strict';
    // Commonly used utilities and variables can be found under the "env"
    // namespace of the "converse" global.
    let $msg, $iq;

    // The following line registers your plugin.
    converse.plugins.add("http-auth", {
        dependencies: [],
        // https://xmpp.org/extensions/xep-0070.html
        initialize: function () {
            const _converse = this._converse;

            $iq = converse.env.$iq,
            $msg = converse.env.$msg;

            const nsHttpAuth = "http://jabber.org/protocol/http-auth";
            var options = {
                ns: nsHttpAuth,
            };

            _converse.api.settings.update({
            'hidden': [],
            });

            _converse.api.listen.on('connected', startListeners);
            function startListeners() {
                // hide the chaboxes of auth request. Any jid provided will work
                _converse.hidden.forEach(function (item, index) {
                _converse.chatboxviews.getAll()[item].hide();
                });
                _converse.api.listen.stanza('message', options, stanzaHandler);
                _converse.api.listen.stanza('iq', options, stanzaHandler);
                return true;
            }

            var httpAuthDialog = _converse.BootstrapModal.extend({

                events: {
                  'click .btn-acceptAuth': 'acceptAuth',
                  'click .btn-refuseAuth': 'refuseAuth',
                },

                initialize(httpAuthData) {
                    var self = this;
                    self.httpAuthData = httpAuthData;
                    _converse.BootstrapModal.prototype.initialize.apply(this, arguments);
                },
                toHTML() {
                    var self = this;
                    const __ = _converse.__;
                    var title = __('Confirmation of Authentication');
                    var question = __('The following platform needs to validate your identity, do you agree ?');
                    var vc = __('Validation Code : ');
                    var accept = __('Accept');
                    var refuse = __('Refuse');
                    var dialog = '<div class="modal" id="httpAuth"> <div class="modal-dialog"> <div class="modal-content">' +
                                '<div class="modal-header">' +
                                '<h2 class="modal-title">{title}</h2>' +
                                '<button type="button" class="close" data-dismiss="modal">&times;</button></div>' +
                                '<div class="modal-body" style="text-align:center">{question}</br>' +
                                '<strong>{from}</strong>' +
                                '</br>{vc}</br>' +
                                '<strong>{id}</strong></div>' +
                                '<div class="modal-footer" style="text-align:center">' +
                                '<button type="button" class="btn btn-success btn-acceptAuth" data-dismiss="modal">{accept}</button>' +
                                '<button type="button" class="btn btn-danger btn-refuseAuth" data-dismiss="modal">{refuse}</button>' +
                                '</div></div></div>';
                    dialog = dialog.replace("{from}", self.httpAuthData.from).replace("{id}", self.httpAuthData.id);
                    dialog = dialog.replace("{title}", title).replace("{question}", question).replace("{vc}", vc);
                    dialog = dialog.replace("{accept}", accept).replace("{refuse}", refuse);
                    return dialog;
                },

                buildResponse(responseType) {
                    var self = this;
                    var response = self.httpAuthData['response'];
                    var iqType = 'get';
                    response.c('confirm', {'xmlns': 'http://jabber.org/protocol/http-auth',
                            'id': self.httpAuthData['id'], 'method': self.httpAuthData['method'],
                            'url': self.httpAuthData['url']}).up();
                    if (responseType === 'refuse') {
                        response.c('error', {'code': '401', 'type': 'auth'});
                        response.c('not-authorized', {'xmlns': 'urn:ietf:params:xml:xmpp-stanzas'});
                        iqType = 'error';
                      }
                    if (self.httpAuthData['stanzaType'] === 'iq') {
                        response = response.attrs({type: iqType});
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
                    var confirm = stanza.getElementsByTagName('confirm');
                    if (confirm.length > 0) {
                        confirm = confirm[0];
                        var httpAuthData = {
                            xmlns: confirm.getAttribute('xmlns'),
                            method: confirm.getAttribute('method'),
                            id: confirm.getAttribute('id'),
                            url: confirm.getAttribute('url'),
                            from: stanza.getAttribute('from'),
                            to: stanza.getAttribute('to'),
                            confirm: confirm,
                            message: stanza,
                            stanzaType: stanza.localName
                        };
                        // hide the chaboxes of auth request
                        try {
                        _converse.chatboxviews.getAll()[stanza.getAttribute('from')].hide();
                        }
                        catch (error) {
                            //pass
                        }
                        var httpAuthMessage;
                        if (stanza.localName === 'message') {
                          httpAuthMessage = $msg({
                            from: _converse.jid,
                            to: stanza.getAttribute('from'),
                            });
                            var thread = stanza.getElementsByTagName('thread')[0].textContent;
                            httpAuthMessage.c('thread').t(thread).up();
                            httpAuthData['response'] = httpAuthMessage;
                        } else {
                          httpAuthMessage = $iq({
                            from: _converse.jid,
                            to: stanza.getAttribute('from'),
                            id: stanza.getAttribute('id'),
                            type: 'error',
                            });
                            httpAuthData.response = httpAuthMessage;
                        }
                        new httpAuthDialog(httpAuthData).show();
                    }
                }
                return true;
            }
            console.log("http-auth plugin is ready");
        },

    });
}));
