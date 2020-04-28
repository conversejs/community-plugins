import jszip from "jszip";
import JSZipUtils from "jszip-utils";
import { saveAs } from 'file-saver';

import "./download_dialog.scss";

const URL_REGEX = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

const plugin = {
    toggle_download_dialog (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.chatview.downloadAttachements();
    },

    initialize () {
        const { dayjs, html, CustomElement } = converse.env;
        const { _converse } = this;
        const { __, api } = _converse;
        const download_view = document.createElement("converse-download-view");

        api.settings.extend({
            'allowed_download_servers': [] // list for addresses that are considered inside the download-dialog
        });

        api.listen.on('connected', () => {
            if (api.settings.get('allowed_download_servers') < 1 ) {
                api.settings.get('allowed_download_servers').push(_converse.domain);
            }
        });

        api.listen.on('getToolbarButtons', (context, buttons) => {
            const i18n_start_download_dialog = __('Start Download-Dialog');
            const icon_path = "M464,128H272L208,64H48A48,48,0,0,0,0,112V400a48,48,0,0,0,48,48H464a48,48,0,0,0,48-48V176A48,48,0,0,0,464,128ZM364.44,283.36,268,379.06a17.05,17.05,0,0,1-24,0l-96.42-95.7A16,16,0,0,1,158.81,256H224V208a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16v48h65.18A16,16,0,0,1,364.44,283.36Z";
            const icon_viewbox = "0 0 512 512";
            buttons.push(html`
                <button title="${i18n_start_download_dialog}" @click=${this.toggle_download_dialog} .chatview=${this.chatview}">
                    <converse-plugin-icon class="fa" size="1em">
                        <svg style="width: 1em; height: 1em;"><svg viewBox="${icon_viewbox}"><path d="${icon_path}"></path></svg></svg>
                    </converse-plugin-icon>
                </button>`
            );
            return buttons;
        });

        api.listen.on('initialized', () =>
            document.body.querySelector('#conversejs').insertAdjacentElement('beforeend', download_view)
        );

        function downloadAttachements () {
            function getFileType (str) {
                if (str.lastIndexOf('.') < 0)
                    return '';
                return str.substr(str.lastIndexOf('.'));
            }

            function stripFileType (str) {
                if (str.lastIndexOf('.') < 0)
                    return str;
                return str.substr(0, str.lastIndexOf('.'));
            }

            const downloadables = [];
            this.model.messages.forEach(message => {
                const body = message.get('message');
                if (body) {
                    const m = body.match(URL_REGEX);
                    if (m && api.settings.get('allowed_download_servers').some(server => body.includes(server))) {
                        const pathname = m[4];
                        const filename = pathname.substr(pathname.lastIndexOf('/') + 1);
                        const timestamp = dayjs(message.get('time')).format('YYYYMMDD_HHmm');
                        downloadables.push({
                            author: message.get('from'),
                            link: body,
                            time: dayjs(message.get('time')).subtract((new Date()).getTimezoneOffset(), "m"),
                            timestamp: timestamp,
                            filename: timestamp + '_' + stripFileType(filename),
                            type: getFileType(filename),
                            checked: true
                        });
                    }
                }
            });

            if (downloadables.length > 0) {
                const chat_name = this.model.attributes.name === undefined ? this.model.attributes.user_id : this.model.attributes.name;
                download_view.zipfileName = "conversejs_" + dayjs(Date.now()).format("YYYYMMDD_HHmm") + '_' + chat_name;
                download_view.downloadables = downloadables;
                download_view.inProgress = false;
                download_view.hidden = false;
            } else {
                alert(__("There are no files to download."));
            }
        }
        Object.assign(_converse.ChatBoxView.prototype, {downloadAttachements});

        class MultimediaDownloadView extends CustomElement {

            static get properties() {
                return {
                    zipfileName: {type: String},
                    downloadables: {type: Array},
                    inProgress: {type: Boolean},
                    hidden: {type: Boolean}
                };
            }

            constructor() {
                super();
                this.zipfileName = '';
                this.downloadables = [];
                this.inProgress = false;
                this.hidden = true;
            }

            render () {
                if (!this.hidden) {
                    return html`
                        <div class="dark-background-full">
                            ${this.inProgress ? MultimediaDownloadView.render_loading_screen() : this.render_download_table()}
                        </div>
                    `;
                }
            }

            render_download_table() {
                const timestampCaption = 'Timestamp';
                const userCaption = 'User';
                const fileCaption = 'File';
                const filenameCaption = 'Filename';
                const chatCaption = 'Attachements from the Chat';
                const zipfilePlaceholder = "Please enter the name of the zip file.";
                const downloadButtonCaption = "Download attachements";
                return html`
                    <div class="download-table">
                            <a class="close-popup fa fa-times" @click="${() => {this.hidden = true;}}" style="float:right; font-size: 20px;"></a>
                            <div class="attachement-header">
                                </br>
                                <span class="download-attachements-header">${__(chatCaption)}</span>
                                </br>
                            </div>
                            <div class="attachements-content" style="display: block">
                                <input class="zipfile-name-input" type="text" style="float: left;" .value="${this.zipfileName}" @change="${(e) => {this.zipfileName = e.target.value;}}" placeholder="${__(zipfilePlaceholder)}"><span style="display: block; margin-top: 15px; float: left;">.zip</span>
                                <div class="scrollbar-div">
                                    <table style="width:100%" border="1">
                                        <thead class="download-table-head">
                                            <tr>
                                                <th><input type="checkbox" @click="${(e) => this.downloadables.forEach((i) => {i.checked = e.target.checked; this.requestUpdate();})}" checked></input></th>
                                                <th>${__(timestampCaption)}</th>
                                                <th>${__(userCaption)}</th>
                                                <th>${__(fileCaption)}</th>
                                                <th>${__(filenameCaption)}</th>
                                            </tr>
                                        </thead>
                                        <tbody class="download-table-body">
                                            ${this.downloadables.map(o => MultimediaDownloadView.render_downloadTableRow(o))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="attachements-footer">
                                <input type="button" class="download-files-button" value="${__(downloadButtonCaption)}" @click=${this.downloadAllFiles}></button>
                            </div>
                        </div>
                    `;
            }

            static render_loading_screen() {
                const loading_screen_title = 'Download in Progress...';
                return html`
                    <div class="loading-screen">
                        <div class="loading-screen-text">
                            <h1 style="font-size: 30px;">${__(loading_screen_title)}</h1>
                            <span class="spinner fa fa-spinner centered"></span>
                        </div>
                    </div>
                `;
            }

            static render_image (o) {
                return html`
                    <td class="download-link-column" align="center">
                        <a target="_blank" rel="noopener" href="${o.link}" >
                            <img class="chat-image" src="${o.link}" alt="Image not found: ${o.filename}${o.type}">
                        </a>
                    </td>
                    `;
            }

            static render_audio (o) {
                return html`
                    <td class="download-link-column" align="center">
                        <audio controls style="max-width: 90%; max-height: 90%px;">
                            <source src="${o.link}" type="audio/mpeg">
                        </audio>
                    </td>
                `;
            }

            static render_video (o) {
                return html`
                    <td class="download-link-column" align="center">
                        <video controls style="max-width: 90%; max-height: 90%px;">
                            <source src="${o.link}" type="video/mp4">
                        </video>
                    </td>
                `;
            }

           static render_other (o) {
                return html`
                    <td class="download-link-column" align="center">
                        <a target="_blank" rel="noopener" href="${o.link}">${o.filename}${o.type}</a>
                    </td>
                `;
            }

            static render_file (o) {
                if (o.type === '.jpg' || o.type === '.jpeg' || o.type === '.png' || o.type === '.svg') {
                    return MultimediaDownloadView.render_image(o);
                } else if (o.type === '.mp3' || o.type === '.m4a' || o.type === '.ogg') {
                    return MultimediaDownloadView.render_audio(o);
                } else if (o.type === '.mp4') {
                    return MultimediaDownloadView.render_video(o);
                } else {
                    return MultimediaDownloadView.render_other(o);
                }
            }

            static render_downloadTableRow (o) {
                return html`
                    <tr>
                        <td class="download-checkbox-column" align="center">
                            <input type="checkbox" class="checkbox-for-download" .checked="${o.checked}" @click="${(e) => {o.checked=e.target.checked}}">
                        </td>
                        <td class="download-timestamp-column" align="center">${o.timestamp}</td>
                        <td class="download-author-column" align="center">${o.author}</td>
                        ${MultimediaDownloadView.render_file(o)}
                        <td class="download-filename-column"><input class="download-file-input" type="text" .value="${o.filename}" @change="${(e) => {o.filename=e.target.value}}"><span style="display: block; margin-top: 5px; float: left;">${o.type}</span></td>
                    </tr>
                `;
            }

            downloadAllFiles () {
                const selected = this.downloadables.filter(item => item.checked);

                if (selected.length === 0) {
                    alert(__("No files for Download selected."));
                    return;
                }

                // checking for duplicate filenames
                selected.forEach(item1 => {
                    let duplicate_counter = 0;
                    selected.forEach(item2 => {
                        if((item1.filename + item1.type) ===
                            (item2.filename + item2.type) &&
                            (item1 !== item2))
                        {
                            duplicate_counter++;
                            item1.filename = item1.filename + '(' + duplicate_counter + ')';
                        }
                    });
                });

                this.inProgress = true;

                const zip = new jszip();
                let i = 0;

                selected.forEach(item => {
                    JSZipUtils.getBinaryContent(item.link, (err, data) => {
                        if (err || data.byteLength === 0) {
                            zip.file(item.filename + __("_ERROR.txt"), __("The file ") + item.link + __(" could not be downloaded.")+"\n");
                        } else {
                            zip.file(item.filename + item.type, data, {binary: true, date: new Date(item.time)});
                        }
                        i++;

                        if (i === selected.length) {
                            zip.generateAsync({type: "blob"}).then( content => {
                                saveAs(content, this.zipfileName + ".zip");
                                this.hidden = true;
                            });
                        }
                    });
                });
            }
        }
        window.customElements.define('converse-download-view', MultimediaDownloadView);
    }
};

const converse = window.converse;
if (typeof converse === "undefined") {
    window.addEventListener(
        'converse-loaded',
        () => converse.plugins.add("download-dialog", plugin)
    );
} else {
    converse.plugins.add("download-dialog", plugin);
}
