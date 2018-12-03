(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["converse"], factory);
    } else {
        factory(converse);
    }
}(this, function (converse) {
    var videoRecorder = null;

    converse.plugins.add("screencast", {
        'dependencies': [],

        'initialize': function () {
            console.log("screencast plugin is ready");
        },

        'overrides': {
            ChatBoxView: {

                renderToolbar: function renderToolbar(toolbar, options) {
                    var result = this.__super__.renderToolbar.apply(this, arguments);
                    var view = this;
                    var id = this.model.get("box_id");
                    var html = '<a class="fa fa-desktop" title="ScreenCast. Click to start and stop"></a>';

                    addToolbarItem(view, id, "webmeet-screencast-" + id, html);

                    setTimeout(function()
                    {
                        var screencast = document.getElementById("webmeet-screencast-" + id);

                        if (screencast)
                        {
                            screencast.addEventListener('click', function(evt)
                            {
                                evt.stopPropagation();

                                if (videoRecorder == null)  // toggle - start otherwise stop
                                {
                                    navigator.getDisplayMedia({ video: true }).then(stream =>
                                    {
                                        handleStream(stream, view);

                                    }, error => {
                                        handleError(error)
                                    });

                                } else {
                                    videoRecorder.stop();
                                }

                            }, false);
                        }

                    });

                    return result;
                }
            }
        }
    });

    var handleStream = function handleStream (stream, view)
    {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((audioStream) => handleAudioStream(stream, audioStream, view)).catch((e) => handleError(e))
    }

    var handleAudioStream = function handleStream (stream, audioStream, view)
    {
        stream.addTrack(audioStream.getAudioTracks()[0]);
        audioStream.removeTrack(audioStream.getAudioTracks()[0]);

        var video = document.createElement('video');
        video.playsinline = true;
        video.autoplay = true;
        video.muted = true;
        video.srcObject = stream;
        video.style.display = "none";

        setTimeout(function()
        {
            videoRecorder = new MediaRecorder(stream);
            videoChunks = [];

            videoRecorder.ondataavailable = function(e)
            {
                if (e.data.size > 0)
                {
                    console.debug("screencast - ondataavailable", e.data);
                    videoChunks.push(e.data);
                }
            }

            videoRecorder.onstop = function(e)
            {
                console.debug("screencast - onstop", e);

                stream.getTracks().forEach(track => track.stop());

                var blob = new Blob(videoChunks, {type: 'video/webm;codecs=h264'});
                var file = new File([blob], "screencast-" + Math.random().toString(36).substr(2,9) + ".webm", {type: 'video/webm;codecs=h264'});
                view.model.sendFiles([file]);
                videoRecorder = null;
            }

            videoRecorder.start();
        });
    }

    var handleError = function handleError (e)
    {
        console.error("ScreenCast", e)
    }

    var newElement = function(el, id, html)
    {
        var ele = document.createElement(el);
        if (id) ele.id = id;
        if (html) ele.innerHTML = html;
        document.body.appendChild(ele);
        return ele;
    }

    var addToolbarItem = function(view, id, label, html)
    {
        var placeHolder = view.el.querySelector('#place-holder');

        if (!placeHolder)
        {
            var smiley = view.el.querySelector('.toggle-smiley.dropup');
            smiley.insertAdjacentElement('afterEnd', newElement('li', 'place-holder'))
            placeHolder = view.el.querySelector('#place-holder');
        }
        placeHolder.insertAdjacentElement('afterEnd', newElement('li', label, html));
    }
}));
