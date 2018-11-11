import Vue from 'vue';

new Vue({
    el: '#app',
    data: {
        appIsRunning: false,
        newInputKey: 0
    },
    template: `
        <div id="app">
            <h3>Visual Inspector</h3>
            <div class="filePicker">
                <span class="tit">点击插入设计稿</span>
                <input type="file" @change="insertImg" :key="newInputKey" />
            </div>
            <button @click="quit" v-if="appIsRunning"> 退出 </button>
        </div>
    `,
    methods: {
        insertImg(e) {
            let [file] = e.target.files;
            this.readFileAsDataUrl(file)
                .then(dataUrl => {
                    this.send({type: 'insertImg', payload: {dataUrl}}, ({type, state}) => {
                        if (type === 'insertImg') {
                            this.appIsRunning = !!state;
                            this.newInputKey = Math.random();
                        }
                    });
                })
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

        quit() {
            this.send({type: 'quit'}, ({type, state}) => {
                if (type === 'quit') this.appIsRunning = !!state
            });
        },

        send(data, cb) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                    cb && response && cb(response);
                    console.log('response', response);
                });
            });
        }
    },
    created() {
        this.send({type: 'getAppState'}, ({type, state}) => {
            if (type === 'getAppState') this.appIsRunning = !!state
        });
    }
});


