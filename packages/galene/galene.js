(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {

    var Strophe, $iq, $msg, $pres, $build, b64_sha1, _ , dayjs, _converse, html, _, __, Model, BootstrapModal, galene_confirm, galene_invitation, galene_tab_invitation, galene_ready;

    converse.plugins.add("galene", {
        dependencies: [],

        initialize: function () {
            _converse = this._converse;

            Strophe = converse.env.Strophe;
            $iq = converse.env.$iq;
            $msg = converse.env.$msg;
            $pres = converse.env.$pres;
            $build = converse.env.$build;
            b64_sha1 = converse.env.b64_sha1;
            dayjs = converse.env.dayjs;
            html = converse.env.html;
            Model = converse.env.Model;
            BootstrapModal = converse.env.BootstrapModal;
            _ = converse.env._;
            __ = _converse.__;

            _converse.api.settings.update({
                galene_head_display_toggle: false,
                galene_signature: 'GALENE',
				galene_host: location.hostname
            });

            galene_confirm  = __('Galene Meeting?');
            galene_invitation = __('Please join meeting in room at');
            galene_tab_invitation = __('Or open in new tab at');

            _converse.api.listen.on('messageNotification', function (data)
            {
                console.debug("messageNotification", data);

                var chatbox = data.chatbox;
                var bodyElement = data.stanza.querySelector('body');

                if (bodyElement)
                {
                    var body = bodyElement.innerHTML;
                    var url = _converse.api.settings.get("galene_signature");
                    var pos = body.indexOf(url + "/");

                    if (pos > -1)
                    {
                        var room = body.substring(pos + url.length + 1);
                        var label = pos > 0 ? body.substring(0, pos) : galene_invitation;
                        var from = chatbox.getDisplayName().trim();
                        var avatar = _converse.api.settings.get("notification_icon");

                        if (data.chatbox.vcard.attributes.image) avatar = data.chatbox.vcard.attributes.image;

                        var prompt = new Notification(from,
                        {
                            'body': label + " " + room,
                            'lang': _converse.locale,
                            'icon': avatar,
                            'requireInteraction': true
                        });

                        prompt.onclick = function(event)
                        {
                            event.preventDefault();

                            var box_jid = Strophe.getBareJidFromJid(chatbox.get("contact_jid") || chatbox.get("jid") || chatbox.get("from"));
                            var view = _converse.chatboxviews.get(box_jid);

                            if (view)
                            {
                                doLocalVideo(view, room, label);
                            }
                        }
                    }
                }
            });

            _converse.api.listen.on('getToolbarButtons', function(toolbar_el, buttons)
            {
				if (galene_ready) {				
					console.debug("getToolbarButtons", toolbar_el.model.get("jid"));
					let color = "fill:var(--chat-toolbar-btn-color);";
					if (toolbar_el.model.get("type") === "chatroom") color = "fill:var(--muc-toolbar-btn-color);";
							
					buttons.push(html`
						<button class="plugin-galene" title="${__('Galene Meeting')}" @click=${performVideo}/>
							<svg style="width:20px; height:20px; ${color}" viewBox="0 0 452.388 452.388"  xml:space="preserve"> <g> 	<g id="Layer_8_38_"> 		<path d="M441.677,43.643H10.687C4.785,43.643,0,48.427,0,54.329v297.425c0,5.898,4.785,10.676,10.687,10.676h162.069v25.631 			c0,0.38,0.074,0.722,0.112,1.089h-23.257c-5.407,0-9.796,4.389-9.796,9.795c0,5.408,4.389,9.801,9.796,9.801h158.506 			c5.406,0,9.795-4.389,9.795-9.801c0-5.406-4.389-9.795-9.795-9.795h-23.256c0.032-0.355,0.115-0.709,0.115-1.089V362.43H441.7 			c5.898,0,10.688-4.782,10.688-10.676V54.329C452.37,48.427,447.589,43.643,441.677,43.643z M422.089,305.133 			c0,5.903-4.784,10.687-10.683,10.687H40.96c-5.898,0-10.684-4.783-10.684-10.687V79.615c0-5.898,4.786-10.684,10.684-10.684 			h370.446c5.898,0,10.683,4.785,10.683,10.684V305.133z M303.942,290.648H154.025c0-29.872,17.472-55.661,42.753-67.706 			c-15.987-10.501-26.546-28.571-26.546-49.13c0-32.449,26.306-58.755,58.755-58.755c32.448,0,58.753,26.307,58.753,58.755 			c0,20.553-10.562,38.629-26.545,49.13C286.475,234.987,303.942,260.781,303.942,290.648z"/> </g></g> </svg>
						</button>
					`);		
				}					
				
                return buttons;
            });

            _converse.api.listen.on('connected', async function()
            {
                window.connection = _converse.connection;
								
				const features = await _converse.api.disco.getFeatures(_converse.api.settings.get("galene_host"));
				
				features.each(feature => {
					const fieldname = feature.get('var');
					
					if (fieldname == "urn:xmpp:sfu:galene:0") {
						console.debug("SFU found");		
						galene_ready = true;							
					}
				});					
            });			

            _converse.api.listen.on('afterMessageBodyTransformed', function(text)
            {
                if (text.indexOf(_converse.api.settings.get("galene_signature")) > -1)
                {
                    console.debug("afterMessageBodyTransformed", text);

                    const url = text.substring(0);
                    const link_room = url.substring(url.lastIndexOf("/") + 1);
                    const link_label = galene_invitation;
                    const tab_label = galene_tab_invitation;

                    text.references = [];
                    text.addTemplateResult(0, text.length, html`<a @click=${clickVideo} data-room="${link_room}" data-url="${url}" href="#">${link_label} ${link_room}</a>`);
                }
            });

            console.debug("galene plugin is ready");
        }
    });

    function __confirm(msg, callback) {
      if (confirm(galene_confirm)) {
          callback();
      }
    }

    function __displayError(error) {
      alert(error);
    }

    function getChatViewFromElement($el) {
        return $el.closest('converse-chat.chatbox') || $el.closest('converse-muc.chatbox');
    }

    function performVideo(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();

        const chatView = getChatViewFromElement(ev.currentTarget);
        __confirm(galene_confirm, function() {
            doVideo(chatView);
        });
    }

    function clickVideo(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();

        var url = ev.target.getAttribute("data-url");
        var room = ev.target.getAttribute("data-room");

        if (ev.currentTarget) {
          const chatView = getChatViewFromElement(ev.currentTarget);
          doLocalVideo(chatView, room, url, galene_invitation);
        }
    }

    var doVideo = function doVideo(view)
    {
        const room = Strophe.getNodeFromJid(view.model.attributes.jid).toLowerCase().replace(/[\\]/g, '') + "-" + Math.random().toString(36).substr(2,9);
        const url = _converse.api.settings.get("galene_signature") + '/' + room;

        console.debug("doVideo", room, url, view);

        view.model.sendMessage({'body': url});	
        doLocalVideo(view, room, galene_invitation);

    }

    var doLocalVideo = function doLocalVideo(view, room, label)
    {
        const chatModel = view.model;
        console.debug("doLocalVideo", view, room, label);

		const isOverlayedDisplay = _converse.api.settings.get("view_mode") === "overlayed";
		const headDisplayToggle = isOverlayedDisplay || _converse.api.settings.get("galene_head_display_toggle") === true;
		const div = view.querySelector(headDisplayToggle ? ".chat-body" : ".box-flyout");

		if (div) {
				div.innerHTML = '';
                const jid = view.getAttribute("jid");
                if(Array.from(document.querySelectorAll("iframe.galene")).filter(f => f.__jid === jid).length > 0) {
                  __displayError(__('A meet is already running into room'));
                  return;
                }
                const toggleHandler = function() {
                  galeneFrame.toggleHideShow();
                };
                const dynamicDisplayManager = new function() {
                  let __resizeHandler;
                  let __resizeWatchImpl;
                  this.start = function() {
                    const $chatBox = document.querySelector('.converse-chatboxes');
                    const $anchor = document.querySelector('#conversejs.conversejs');
                    __resizeHandler = function() {
                      const currentView = _converse.chatboxviews.get(jid)
                      if (currentView && headDisplayToggle) {
                        const $head = currentView.querySelector(".chat-head");
                        $head.removeEventListener('dblclick', toggleHandler);
                        $head.addEventListener('dblclick', toggleHandler);
                      }
                      const currentDiv = currentView && currentView.querySelector(headDisplayToggle ? ".chat-body" : ".box-flyout");
                      let top = currentDiv ? currentDiv.offsetTop : 0;
                      let left = currentDiv ? currentDiv.offsetLeft : 0;
                      let width = currentDiv ? currentDiv.offsetWidth : 0;
                      let height = currentDiv ? currentDiv.offsetHeight : 0;
                      let current = currentDiv && currentDiv.offsetParent;
                      while (current && current !== $anchor) {
                        top += current.offsetTop;
                        left += current.offsetLeft;
                        current = current.offsetParent;
                      }
                      galeneFrame.style.top = top + "px";
                      galeneFrame.style.left = left + "px";
                      galeneFrame.style.width = width + "px";
                      galeneFrame.style.height = height + "px";
                    };
                    __resizeWatchImpl = new function() {
                      let __resizeObserver;
                      if (isOverlayedDisplay && typeof ResizeObserver === 'function') {
                        __resizeObserver = new ResizeObserver(function(entries) {
                          if (entries.length > 0) {
                            __resizeHandler();
                          }
                        });
                      }
                      const __resizeWatchEvents = ['controlBoxOpened', 'controlBoxClosed', 'chatBoxBlurred',
                        'chatBoxFocused', 'chatBoxMinimized', 'chatBoxMaximized',
                        'chatBoxViewInitialized', 'chatRoomViewInitialized'];
                      const __startResize = function() {
                        galeneFrame.style.pointerEvents = 'none';
                        document.addEventListener('mousemove', __deferredResize);
                      };
                      const __endResize = function() {
                        galeneFrame.style.pointerEvents = '';
                        document.removeEventListener('mousemove', __deferredResize);
                      };
                      let timeoutId;
                      const __deferredResize = function() {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(__resizeHandler, 0);
                      };
                      this.start = function() {
                        _converse.api.listen.on('startDiagonalResize', __startResize);
                        _converse.api.listen.on('startHorizontalResize', __startResize);
                        _converse.api.listen.on('startVerticalResize', __startResize);
                        document.addEventListener('mouseup', __endResize);
                        window.addEventListener('resize', __resizeHandler);
                        __resizeWatchEvents.forEach(c => _converse.api.listen.on(c, __deferredResize));
                        if (__resizeObserver) {
                          __resizeObserver.observe(div);
                          __resizeObserver.observe($anchor);
                          __resizeObserver.observe($chatBox);
                        }
                      };
                      this.close = function() {
                        _converse.api.listen.not('startDiagonalResize', __startResize);
                        _converse.api.listen.not('startHorizontalResize', __startResize);
                        _converse.api.listen.not('startVerticalResize', __startResize);
                        document.removeEventListener('mouseup', __endResize);
                        window.removeEventListener('resize', __resizeHandler);
                        __resizeWatchEvents.forEach(c => _converse.api.listen.not(c, __deferredResize));
                        if (__resizeObserver) {
                          __resizeObserver.disconnect();
                        }
                      };
                    };
                    galeneFrame.style.position = "absolute";
                    $anchor.appendChild(galeneFrame);
                    __resizeWatchImpl.start();
                    _converse.api.listen.on('chatBoxClosed', closeGalene);
                    this.triggerChange();
                  };
                  this.triggerChange = function() {
                    __resizeHandler();
                  };
                  this.close = function() {
                    __resizeWatchImpl.close();
                    _converse.api.listen.not('chatBoxClosed', closeGalene);
                  };
                };
                let galeneFrame = document.createElement('iframe');
                let firstTime = true;

				let openChatbox = function (view)
				{
					let jid = view.model.get("jid");
					let type = view.model.get("type");

					console.debug("openChatbox", jid, type);

					if (jid)
					{
						if (type == "chatbox") _converse.api.chats.open(jid, {'bring_to_foreground': true}, true);
						else
						if (type == "chatroom") _converse.api.rooms.open(jid, {'bring_to_foreground': true}, true);
					}
				}	
				
                let closeGalene = function(currentModel) {
                  console.debug("doLocalVideo - closeGalene", this);
				  
                  dynamicDisplayManager.triggerChange();
                  if (currentModel && currentModel.cid !== chatModel.cid) {
                    return;
                  }
                  dynamicDisplayManager.close();
                  galeneFrame.remove();
				  view.close();
				  setTimeout(function() { openChatbox(view) });				  
                }
				
                let galeneIframeCloseHandler = function ()
                {
                  console.debug("doLocalVideo - galeneIframeCloseHandler");
                  if (!firstTime) // meeting closed and root url is loaded
                  {
                    closeGalene();
                  }
                  if (firstTime) firstTime = false;   // ignore when galene-meet room url is loaded
                };
                galeneFrame.toggleHideShow = function() {
                  if (galeneFrame.style.display === 'none') {
                    galeneFrame.show();
                  } else {
                    galeneFrame.hide();
                  }
                };
                galeneFrame.show = function() {
                  galeneFrame.style.display = '';
                };
                galeneFrame.hide = function() {
                  galeneFrame.style.display = 'none';
                };
                galeneFrame.__jid = jid;
                galeneFrame.addEventListener("load", galeneIframeCloseHandler);
                galeneFrame.setAttribute("src", "./packages/galene/index.html?username=" + Strophe.getNodeFromJid(_converse.connection.jid) + "&password=&group=" + room + "&host=" + _converse.api.settings.get("galene_host"));
                galeneFrame.setAttribute("class", "galene");
                galeneFrame.setAttribute("allow", "microphone; camera;");
                galeneFrame.setAttribute("frameborder", "0");
                galeneFrame.setAttribute("seamless", "seamless");
                galeneFrame.setAttribute("allowfullscreen", "true");
                galeneFrame.setAttribute("scrolling", "no");
                galeneFrame.setAttribute("style", "z-index:1049;width:100%;height:100%;");
                dynamicDisplayManager.start();
				
                galeneFrame.contentWindow.addEventListener("message", function (event) {
                  if (typeof event.data === 'string') {
                    let data = JSON.parse(event.data);
                    let galeneEvent = data['galene_event'];
                    if ('close' === galeneEvent) {
                      closeGalene();
                    }
                  }
                }, false);
		}
    }		
}));
