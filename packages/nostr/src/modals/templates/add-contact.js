import tplAddContactModal from "converse.js/src/plugins/rosterview/modals/templates/add-contact.js";
import { __ } from 'converse.js/src/i18n';
import { getGroupsAutoCompleteList } from '@converse/headless/plugins/roster/utils.js';
import { html } from "lit";


export default (el) => {
    const i18n_add = __('Add');
    const i18n_nostr_pubkey = __('NOSTR Public Key');
    const i18n_group = __('Group');
    const i18n_nickname = __('Name');

    const navigation_tabs = [
        html`<li role="presentation" class="nav-item">
            <a class="nav-link ${el.tab !== "nostr" ? "active" : ""}"
               id="xmpp-tab"
               href="#xmpp-tabpanel"
               aria-controls="xmpp-tabpanel"
               role="tab"
               @click=${ev => el.switchTab(ev)}
               data-name="xmpp"
               data-toggle="tab">XMPP</a>
            </li>`,
        html`<li role="presentation" class="nav-item">
            <a class="nav-link ${el.tab === "nostr" ? "active" : ""}"
                id="nostr-tab"
                href="#nostr-tabpanel"
                aria-controls="nostr-tabpanel"
                role="tab"
                @click=${ev => el.switchTab(ev)}
                data-name="nostr"
                data-toggle="tab">NOSTR</a>
        </li>`
    ];

    return html`
        <ul class="nav nav-pills justify-content-center">${navigation_tabs}</ul>
        <div class="tab-content">
            <div class="tab-pane ${ el.tab !== 'nostr' ? 'active' : ''}"
                 id="profile-tabpanel"
                 role="tabpanel"
                 aria-labelledby="profile-tab">

                ${tplAddContactModal(el)}
            </div>

            <div class="tab-pane ${ el.tab === 'nostr' ? 'active' : ''}"
                 id="profile-tabpanel"
                 role="tabpanel"
                 aria-labelledby="profile-tab">

                <form class="converse-form add-xmpp-contact" @submit=${ev => el.addContactFromForm(ev)}>
                    <div class="modal-body">
                        <span class="modal-alert"></span>
                        <div class="form-group">
                            <label class="clearfix" for="pubkey">${i18n_nostr_pubkey}:</label>
                            <div>
                                <ul class="suggestion-box__results suggestion-box__results--below" hidden=""></ul>
                                <input type="text" name="pubkey" required}
                                    value="${el.model.get('pubkey') || ''}"
                                    class="form-control"/>
                                <span class="suggestion-box__additions visually-hidden" role="status" aria-live="assertive" aria-relevant="additions"></span>
                            </div>
                        </div>

                        <div class="form-group add-xmpp-contact__name">
                            <label class="clearfix" for="name">${i18n_nickname}:</label>
                            <div>
                                <ul class="suggestion-box__results suggestion-box__results--above" hidden=""></ul>
                                <input type="text" name="name" value="${el.model.get('nickname') || ''}"
                                    class="form-control"/>
                                <span class="suggestion-box__additions visually-hidden" role="status" aria-live="assertive" aria-relevant="additions"></span>
                            </div>
                        </div>
                        <div class="form-group add-xmpp-contact__group">
                            <label class="clearfix" for="name">${i18n_group}:</label>
                            <converse-autocomplete .list=${getGroupsAutoCompleteList()} name="group"></converse-autocomplete>
                        </div>
                        <button type="submit" class="btn btn-primary">${i18n_add}</button>
                    </div>
                </form>

            </div>
        </div>`;
}
