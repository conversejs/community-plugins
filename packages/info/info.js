(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var infoDialog = null;
    var _converse = null;

    converse.plugins.add("info", {
        'dependencies': [],

        'initialize': function () {
            _converse = this._converse;

            infoDialog = _converse.BootstrapModal.extend({
                initialize() {
                    _converse.BootstrapModal.prototype.initialize.apply(this, arguments);
                },
                toHTML() {
                  return '<div class="modal" id="myModal"> <div class="modal-dialog"> <div class="modal-content">' +
                         '<div class="modal-header">' +
                         '  <h4 class="modal-title">Information</h4>' +
                         '  <button type="button" class="close" data-dismiss="modal">&times;</button>' +
                         '</div>' +
                         '<div class="modal-body"> Details.. </div>' +
                         '<div class="modal-footer"> <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button> </div>' +
                         '</div> </div> </div>';
                }
            });

            _converse.api.listen.on('renderToolbar', function(view)
            {
                const id = view.model.get("box_id");
                const info = addToolbarItem(view, id, "pade-info-" + id, '<a class="fas fa-info-circle" title="Information"></a>');

                info.addEventListener('click', function(evt)
                {
                    evt.stopPropagation();

                    new infoDialog().show();

                }, false);
            });

            console.log("info plugin is ready");
        }
    });

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
