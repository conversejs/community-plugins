/**
 * @module converse-oauth
 * @copyright 2022, the Converse.js contributors
 * @license Mozilla Public License (MPLv2)
 */
import hello from "hellojs";

import "./styles.scss";


const plugin = {
    optional_dependencies: ['converse-register'],

    /* If you want to override some function or a Model or
     * View defined elsewhere in converse.js, then you do that under
     * the "overrides" namespace.
     */
    overrides: {
        /* For example, the private *_converse* object has a
         * method "onConnected". You can override that method as follows:
         */
        LoginPanel: {

            insertOAuthProviders () {
                const { _converse } = this.__super__;
                if (this.oauth_providers_view === undefined) {
                    this.oauth_providers_view =
                        new _converse.OAuthProvidersView({'model': _converse.oauth_providers});

                    this.oauth_providers_view.render();
                    this.el.querySelector('.buttons').insertAdjacentElement(
                        'afterend',
                        this.oauth_providers_view.el
                    );
                }
                this.oauth_providers_view.render();
            },

            render () {
                const { _converse } = this.__super__;
                const { api } = _converse;
                const result = this.__super__.render.apply(this, arguments);
                if (_converse.oauth_providers && !api.settings.get("auto_login")) {
                    this.insertOAuthProviders();
                }
                return result;
            }
        }
    },

    initialize () {
        /* The initialize function gets called as soon as the plugin is
         * loaded by converse.js's plugin machinery.
         */
        const { _converse } = this;
        const { api, __ } = _converse;
        const { Collection, Model, View, html } = converse.env;

        api.settings.extend({ 'oauth_providers': [] });


        const tpl_provider = (o, provider) => html`
            <p class="oauth-provider">
                <a @click=${o.oauthLogin} class="oauth-login" data-id="${provider.id}">
                    <i class="fa ${provider.class}"></i>${provider.login_text}
                </a>
            </p>
        `;

        const tpl_oauth_providers = html`
            <fieldset class="oauth-providers">
                ${ o.providers.map(provider => tpl_provider(o, provider)) }
            </fieldset>
        `;


        _converse.OAuthProviders = Collection.extend({
            'sync': function sync () {},

            initialize () {
                api.settings.get('oauth_providers').forEach(provider => {
                    const item = new Model(Object.assign(provider, {
                        'login_text': __('Log in with %1$s', provider.name)
                    }));
                    this.add(item, {'silent': true});
                });
            }
        });
        _converse.oauth_providers = new _converse.OAuthProviders();


        _converse.OAuthProvidersView = View.extend({
            toHTML () {
                return tpl_oauth_providers(
                    Object.assign({
                        'providers': this.model.toJSON(),
                        'oauthLogin': ev => this.oauthLogin(ev)
                    }));
            },

            async fetchOAuthProfileDataAndLogin () {
                const profile = await this.oauth_service.api('me');
                const response = this.oauth_service.getAuthResponse();
                api.user.login(
                    `${profile.name}@${this.provider.get('host')}`,
                    response.access_token
                );
            },

            async oauthLogin (ev) {
                ev.preventDefault();
                const id = ev.target.getAttribute('data-id');
                this.provider = _converse.oauth_providers.get(id);
                this.oauth_service = hello(id);

                const data = {};
                data[id] = this.provider.get('client_id');
                hello.init(data, {
                    'redirect_uri': '/redirect.html'
                });

                await this.oauth_service.login();
                this.fetchOAuthProfileDataAndLogin();
            }
        });
    }
}

let converse = window.converse;

if (typeof converse === "undefined") {
    window.addEventListener(
        'converse-loaded',
        (ev) => {
            converse = ev.detail?.converse || ev.converse;
            converse.plugins.add("converse-oauth", plugin)
        }
    );
} else {
    converse.plugins.add("converse-oauth", plugin);
}
