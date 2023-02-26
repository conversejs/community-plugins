import AddContactModal from 'converse.js/src/plugins/rosterview/modals/add-contact.js';
import tplAddContactModal from "./templates/add-contact.js";
import { __ } from 'i18n';
import api from "@converse/headless/shared/api";

export default class NostrCapableAddContactModal extends AddContactModal {

    renderModal () {
        return tplAddContactModal(this);
    }
}

api.elements.define('converse-add-contact-modal', NostrCapableAddContactModal);
