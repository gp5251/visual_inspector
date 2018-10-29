import interact from 'interactjs';
import $ from 'jquery';

class App {
    constructor() {
        this.$el = $('<div/>');
        this.inited = false;
    }

    init() {
        if (this.inited) return;
        this.inited = true;

        this.$el[0].style.cssText = "width: 300px;height:300px;z-index:9999;position:relative;background: #eee;"

        interact(this.$el[0]).draggable({
            onmove(event) {
                var target = event.target,
                    // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                // translate the element
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';

                // update the posiion attributes
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            // restrict: {
            //   restriction: 'parent',
            //   elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            // }
            // onend(event) {
            //     var textEl = event.target.querySelector('p');

            //     textEl && (textEl.textContent =
            //         'moved a distance of ' +
            //         (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
            //             Math.pow(event.pageY - event.y0, 2) | 0))
            //         .toFixed(2) + 'px');
            // }
        })
            .resizable({
                // resize from all edges and corners
                edges: { left: true, right: true, bottom: true, top: true },

                // keep the edges inside the parent
                // restrictEdges: {
                //   outer: 'parent',
                //   endOnly: true,
                // },

                // minimum size
                restrictSize: {
                    min: { width: 100, height: 50 },
                },

                inertia: true,
            })
            .on('resizemove', function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                // update the element's style
                target.style.width  = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
            });

        this.bindEv();
        console.log('FeHelper is running')
    }

    bindEv() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
            console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", 'data:', request);
            this.$el.trigger('message', {...request, sendResponse});
            return true;
        });

        this.$el
            .on('message', function() {
                let msg = arguments[1];
                console.log('msg', msg)
                switch (msg.type) {
                    case 'run':
                        this.run(msg);
                        break;
                    case 'stop':
                        this.stop(msg);
                        break;
                    case 'changeImg':
                        this.changeImg(msg);
                        break;
                    case 'changeOpacity':
                        this.changeOpacity(msg);
                        break;
                    default:
                        console.log('ev not handled', msg);
                }
            }.bind(this))
    }

    changeImg({file, sendResponse}) {
        let imgBlob = this.dataURLtoBlob(file);
        let url = URL.createObjectURL(imgBlob);
        this.$el.css('background', `#eee url(${url}) no-repeat center 0`);
        sendResponse({done: true});
    }

    changeOpacity({opacity, sendResponse}) {
        this.$el.css({opacity});
        sendResponse({done: true})
    }

    run({sendResponse}) {
        this.$el.appendTo('body');
        sendResponse({done: true})
        console.log('app running');
    }

    stop({sendResponse}) {
        this.$el.detach();
        sendResponse({done: true})
        console.log('app stopped running');
    }

    dataURLtoBlob(dataUrl) {
        var arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], {type:mime});
    }
}

const app = new App;
app.init();

