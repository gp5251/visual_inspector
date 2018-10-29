<style scoped lang="less">
    .mockup {
        width: 300px;
        height: 300px;
        z-index: 9999;
        position: relative;
        background: #eee url(__blank) no-repeat center 0;
    }
    .controllers {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #eee;
        z-index: 9999;
    }
    button{
        padding: 5px 12px;
        margin-right: 5px;
    }
    input{
        margin: 5px 0;
    }
</style>

<template>
    <div id="app">
        <div class="mockUp" ref="el" :style="{opacity, backgroundImage: imgUrl ? `url(${imgUrl})` : 'none'}"></div>

        <div class="controllers" id="controllers">
            <h3>FeHelper</h3>
            <h4>当前图片：{{ fileName }}</h4>

            <button @click="hideMockup = true" v-if="hideMockup">hide mockup</button>
            <button @click="hideMockup = false" v-else>show mockup</button>
            <button @click="autoSize">autoSize</button>
            <button @click="freeze = 0" v-if="freeze">unFreeze</button> <br/>
            <button @click="freeze = 1" v-else>freeze</button> <br/>

            <span style="display: inline-block;width: 30px; text-align: center; vertical-align: 3px">{{ opacity }}</span> <input type="range" v-model="opacity" max="1" min="0.1" step="0.1"/> <br/>

            <input type="file" @change="changeImg" />
        </div>
    </div>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "App",
        data() {
            return {
                opacity: 1,
                fileName: '暂无',
                freeze: 0,
                hideMockup: false,
                imgUrl: ''
            }
        },
        methods: {
            changeImg(e) {
                let [file] = e.target.files;
                this.imgUrl = URL.createObjectURL(file);
                // if (file) {
                //     this.readFileAsDataUrl(file)
                //         .then(base64 =>{
                //             this.fileName = file.name;
                //             this.imgUrl = base64;
                //             // this.$emit('changeImg', {file: base64})
                //         })
                // }
            },

            autoSize() {
                this.$refs.el.cssText = 'width: 100%;height: 100%;';
            },

            dataURLtoBlob(dataUrl) {
                let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) u8arr[n] = bstr.charCodeAt(n);
                return new Blob([u8arr], {type: mime});
            },

            readFileAsDataUrl(file) {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = function(e) {resolve(e.target.result)};
                    reader.readAsDataURL(file);
                })
            },

            initMockup() {
                interact(this.$refs.el)
                    .draggable({
                        onmove(event) {
                            let target = event.target,
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
                    })
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: true, right: true, bottom: true, top: true},

                        // minimum size
                        restrictSize: {
                            min: {width: 100, height: 50},
                        },

                        inertia: true,
                    })
                    .on('resizemove', function (event) {
                        let target = event.target,
                            x = (parseFloat(target.getAttribute('data-x')) || 0),
                            y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // update the element's style
                        target.style.width = event.rect.width + 'px';
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
            },
            listen() {
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", 'data:', request);
                    switch (request.type) {
                        case 'run':
                            // this.showMockup = true;
                            break;
                        case 'quit':
                            // this.showMockup = false;
                            break;
                        default:
                            console.log('not handled', request);
                    }
                    return true;
                });
            },
            send(data, cb) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                        cb(response);
                        console.log('response', response);
                    })
                })
            }
        },
        created() {
            this.listen();
            // this.loadState().then(d => d && Object.assign(this.$data, d));
        }
    }
</script>
