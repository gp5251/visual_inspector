import Vue from 'vue';

new Vue({
    el: '#app',
    template: `
        <div id="app">
            <h3>Visual Inspector</h3>
            <!--<button @click="run">run</button> <button @click="stop">stop</button>-->
            <div class="filePicker">
                <span class="tit">插入设计稿</span>
                <input type="file" @change="insertImg">
            </div>
        </div>
    `,
    data: {
        appState: 'stopped',
        fileName: '暂无'
    },
    methods: {
        insertImg(e) {
            let [file] = e.target.files;
            console.log(file);

            this.readFileAsDataUrl(file)
                // .then(this.dataURLtoBlob)
                .then(dataUrl => {
                    this.send({type: 'insertImg', payload: {dataUrl}});
                })
                // .then(b => {
                //     let src = URL.createObjectURL(b);
                //     this.send({type: 'insertImg', payload: {src}});
                // })
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
        // run() {
        //     this.appState = 'running';
        //     this.send({type: 'run'});
        // },
        //
        // stop() {
        //     this.appState = 'stopped';
        //     this.send({type: 'stop'})
        // },

        send(data, cb) {
            chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                    cb && cb(response);
                    console.log('response', response);
                });
            });
        },

        // loadState() {
        //     console.log('load state');
        //     return new Promise(resolve => {
        //         chrome.storage.local.get('state', state => {
        //             if(JSON.stringify(state) !== '{}') resolve(state);
        //             else resolve(null);
        //         });
        //     })
        // },
        //
        // saveState() {
        //     console.log('save state');
        //     chrome.storage.local.set('state', this.$data);
        // }
    }
});


