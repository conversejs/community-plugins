(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var SearchDialog = null;
    var searchDialog = null;
    var _converse, dayjs;

    converse.plugins.add("search", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;
            dayjs = converse.env.dayjs;

            SearchDialog = _converse.BootstrapModal.extend({
                initialize() {
                    _converse.BootstrapModal.prototype.initialize.apply(this, arguments);
                    this.model.on('change', this.render, this);
                },
                toHTML() {
                  return '<div class="modal" id="myModal"> <div class="modal-dialog modal-xl"> <div class="modal-content">' +
                         '<div class="modal-header"><h1 class="modal-title">Search</h1><button type="button" class="close" data-dismiss="modal">&times;</button></div>' +
                         '<div class="modal-body">' +
                         '<input id="pade-search-keywords" class="form-control" type="text" placeholder="Type a query and press [Enter] to search" ><p/><div id="pade-search-results"></div>' +
                         '</div>' +
                         '<div class="modal-footer">' +
                         (_converse.api.settings.get('search_pdf') ? '<button type="button" class="btn btn-success btn-pdf">PDF</button>' : '') +
                         '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button> </div>' +
                         '</div>' +
                         '</div> </div> </div>';
                },
                afterRender() {
                  var that = this;
                  this.el.addEventListener('shown.bs.modal', function()
                  {
                      if (that.model.get("keyword"))
                      {
                          that.el.querySelector('#pade-search-keywords').style.display = "none";
                          that.doSearch();
                      }
                      else {
                        that.el.querySelector('#pade-search-keywords').focus();
                      }

                  }, false);
                },
                events: {
                    'click .btn-pdf': 'doPDF',
                    'keyup #pade-search-keywords': 'keyUp'
                },

                keyUp(ev) {
                    if (ev.key === "Enter")
                    {
                        var keyword = this.el.querySelector("#pade-search-keywords").value.trim();
                        this.model.set("keyword", keyword)
                        this.doSearch();
                    }
                },
                doPDF() {
                    const margins = {
                      top: 70,
                      bottom: 40,
                      left: 30,
                      width: 550
                    };
                    const pdf = new jsPDF('p','pt','a4');

                    pdf.autoTable({
                        head: [['Date', 'Person', 'Message']],
                        body: this.model.get("pdf_body"),
                        columnStyles: {
                            0: {cellWidth: 100},
                            1: {cellWidth: 100},
                            2: {cellWidth: 300}
                        }
                    })

                    const view = this.model.get("view");
                    const roomLabel = view.model.getDisplayName() || view.model.get("jid");
                    pdf.save(roomLabel + '.pdf')
                },
                doSearch() {
                    var view = this.model.get("view");
                    var jid = view.model.get("jid");
                    var type = view.model.get("type");
                    var groupchat = view.model.get("type") == "chatroom";
                    var method = _converse.api.settings.get("search_method");

                    var that = this;
                    var keyword = that.model.get("keyword");
                    var searchRegExp = undefined;
                    var tagRegExp = undefined;
                    var pdf_body = [];

                    console.debug("doSearch", keyword, jid);

                    if (keyword != "")
                    {
                        searchRegExp = new RegExp('^(.*)(\s?' + keyword + ')', 'i');
                        tagRegExp = new RegExp("(\\b" + keyword + "\\b)", "im");
                    }
                    var searchResults = that.el.querySelector("#pade-search-results");
                    searchResults.innerHTML = "No Match";
                    var html = "<table style='margin-left: 15px'><tr><th>Date</th><th>Person</th><th>Message</th></tr>";

                    if (method == "mam")
                    {
                        _converse.api.archive.query({before: '', max: 999, 'groupchat': groupchat, 'with': jid}).then(function(result)
                        {
                            const messages = result.messages;

                            for (var i=0; i<messages.length; i++)
                            {
                                if (messages[i].querySelector('body'))
                                {
                                    var body = messages[i].querySelector('body').innerHTML;
                                    var delay = messages[i].querySelector('forwarded').querySelector('delay');
                                    var from = messages[i].querySelector('forwarded').querySelector('message').getAttribute('from');
                                    var time = delay ? delay.getAttribute('stamp') : dayjs().format();
                                    var pretty_time = dayjs(time).format('MMM DD HH:mm:ss');
                                    var pretty_from = type === "chatroom" ? from.split("/")[1] : from.split("@")[0];
                                    if (!searchRegExp || searchRegExp.test(body)) pdf_body.push([pretty_time, pretty_from, body]);

                                    html =  html + makeHtml(searchRegExp, tagRegExp, body, pretty_time, pretty_from);
                                }
                            }

                            html =  html + "</table>";
                            searchResults.innerHTML = html;
                            that.model.set("pdf_body", pdf_body);
                        });
                    }
                    else {
                        var messages = view.model.messages.models;

                        for (var i=0; i<messages.length; i++)
                        {
                            var body = messages[i].get('message');
                            var from = messages[i].get('from');
                            var pretty_time = dayjs(messages[i].get('time')).format('MMM DD HH:mm:ss');
                            var pretty_from = from;
                            if (from) pretty_from =  messages[i].get('type') === "groupchat" ? from.split("/")[1] : from.split("@")[0];
                            if (!searchRegExp || searchRegExp.test(body)) pdf_body.push([pretty_time, pretty_from, body]);

                            html =  html + makeHtml(searchRegExp, tagRegExp, body, pretty_time, pretty_from);
                        }

                        html =  html + "</table>";
                        searchResults.innerHTML = html;
                        that.model.set("pdf_body", pdf_body);
                    }
                }
            });

            _converse.api.settings.update({
                search_pdf: false,
                search_method: 'mam'         // use values mam or local
            });

            _converse.api.listen.on('renderToolbar', function(view)
            {
                const id = view.model.get("box_id");
                const search = addToolbarItem(view, id, "pade-search-" + id, '<a class="plugin-search fa fa-search" title="Search conversations for keywords"></a>');

                if (search) search.addEventListener('click', function(evt)
                {
                    evt.stopPropagation();

                    searchDialog = new SearchDialog({ 'model': new converse.env.Backbone.Model({view: view}) });
                    searchDialog.show();
                }, false);
            });

            console.log("search plugin is ready");
        },

        'overrides': {
            ChatBoxView: {
                parseMessageForCommands: function(text) {
                    console.debug('search - parseMessageForCommands', text);

                    const match = text.replace(/^\s*/, "").match(/^\/(.*?)(?: (.*))?$/) || [false, '', ''];
                    const command = match[1].toLowerCase();

                    if (command === "search")
                    {
                        searchDialog = new SearchDialog({ 'model': new converse.env.Backbone.Model({view: view, keyword: match[2]}) });
                        searchDialog.show();
                        return true;
                    }
                    else

                    return this.__super__.parseMessageForCommands.apply(this, arguments);
                }
            }
        }
    });

    function makeHtml(searchRegExp, tagRegExp, body, pretty_time, pretty_from)
    {
        let html = "";

        if (!searchRegExp || searchRegExp.test(body))
        {
            var tagged = tagRegExp ? body.replace(tagRegExp, "<span style=background-color:#FF9;color:#555;>$1</span>") : body;
            html = html + "<tr><td>" + pretty_time + "</td><td>" + pretty_from + "</td><td>" + tagged + "</td></tr>";
        }
        return html;
    }

    function newElement (el, id, html, className)
    {
        var ele = document.createElement(el);
        if (id) ele.id = id;
        if (html) ele.innerHTML = html;
        if (className) ele.classList.add(className);
        document.body.appendChild(ele);
        return ele;
    }

    function addToolbarItem (view, id, label, html)
    {
        let placeHolder = view.el.querySelector('#place-holder');

        if (!placeHolder)
        {
            const toolbar = view.el.querySelector('.chat-toolbar');
            toolbar.appendChild(newElement('li', 'place-holder'));
            placeHolder = view.el.querySelector('#place-holder');
        }
        var newEle = newElement('li', label, html);
        placeHolder.insertAdjacentElement('afterEnd', newEle);
        return newEle;
    }

}));
