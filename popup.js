import Vue from 'vue';
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const i18n = new VueI18n({
	locale: 'cn', // 语言标识
	messages: {
		cn: {
			insert: "点击插入设计稿",
            quit: '退出'
        },
        en: {
			insert: "Insert Mockup",
			quit: 'Quit'
        }
    }
});

new Vue({
    el: '#app',
    i18n,
    data: {
        appIsRunning: false,
        newInputKey: 0
    },
    template: `
        <div id="app">
            <h3>Visual Inspector</h3>
            <div class="filePicker">
                <span class="tit">{{ $t("insert") }}</span>
                <input type="file" @change="insertImg" :key="newInputKey" />
            </div>
            <button @click="quit" v-if="appIsRunning"> {{ $t("quit") }} </button>
			<div class="lang">
				<span @click="changeLang('cn')" :class="{on: $i18n.locale == 'cn'}">中文</span>
				<span @click="changeLang('en')" :class="{on: $i18n.locale == 'en'}">English</span>
			</div>
        </div>
    `,
    methods: {
        insertImg(e) {
            let [file] = e.target.files;
            this.readFileAsDataUrl(file)
                .then(dataUrl => {
                    this.send({type: 'insertImg', data: {dataUrl}}, ({type, state}) => {
                        if (type === 'insertImg') {
                            this.appIsRunning = !!state;
                            this.newInputKey = Math.random();
                        }
                    });
                })
        },

        changeLang(lang) {
			this.send({type: 'changeLang', data: {lang}}, response => {
				if (response && response.type === 'changeLang') {
					this.$i18n.locale = response.data.lang;
				}
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
        this.send({type: 'getAppState'}, ({type, data}) => {
            if (type === 'getAppState') {
                this.appIsRunning = data.state === 'running';
                this.$i18n.locale = data.lang;
			}
        });
    }
});


