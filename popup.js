import Vue from 'vue';

new Vue({
    el: '#app',
    template: `
        <div id="app">
            <h3>FeHelper</h3>
            <h4>插件状态：{{ appState }}</h4>
            <h4>当前图片：{{ fileName }}</h4>
            
            <button @click="run">run</button> <button @click="stop">stop</button> <br/>
            
            <span style="display: inline-block;width: 30px; text-align: center; vertical-align: 3px">{{ opacity }}</span> <input type="range" v-model="opacity" max="1" min="0.1" step="0.1"/> <br/>
            
            <input type="file" @change="changeImg" />
        </div>
    `,
    data: {
        appState: 'stopped',
        opacity: 1,
        fileName: '暂无'
    },
    watch: {
        opacity() {
            this.send({opacity: this.opacity, type: 'changeOpacity'})
        }
    },
    methods: {
        run() {
            this.send({type: 'run'}, d => {
                if (d.done) this.appState = 'running'
            });
        },

        stop() {
            this.send({type: 'stop'}, d => {
                if (d.done) this.appState = 'stopped'
            })
        },

        changeOpacity() {
            this.send({type: 'changeOpacity', opacty: this.opacty}, d => {
                if (d.done) console.log('opacity changed', this.opacty)
            })
        },

        changeImg(e) {
            let [file] = e.target.files;
            if (file) {
                this.readFileAsDataUrl(file)
                    .then(base64 =>{
                        this.fileName = file.name;
                        this.send({type: 'changeImg', file: base64})
                    })
            }

        },

        readFileAsDataUrl(file) {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = function(e) {resolve(e.target.result)};
                reader.readAsDataURL(file);
            })
        },

        send(data, cb) {
            chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                    cb(response);
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
    },
    created() {
        // window.onbeforeunload = this.saveState.bind(this);
        // this.loadState().then(d => d && Object.assign(this.$data, d));
    }
});


