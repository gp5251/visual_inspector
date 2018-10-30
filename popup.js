import Vue from 'vue';

new Vue({
    el: '#app',
    template: `
        <div id="app">
            <h3>FeHelper</h3>
            <h4>插件状态：{{ appState }}</h4>
            <h4>当前图片：{{ fileName }}</h4>
            
            <button @click="run">run</button> <button @click="stop">stop</button>
        </div>
    `,
    data: {
        appState: 'stopped',
        fileName: '暂无'
    },
    methods: {
        run() {
            this.appState = 'running';
            this.send({type: 'run'});
        },

        stop() {
            this.appState = 'stopped';
            this.send({type: 'stop'})
        },

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


