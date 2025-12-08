import Vue from 'vue';
import VueI18n from "vue-i18n";
import App from './PopupApp.vue';

Vue.use(VueI18n);

const i18n = new VueI18n({
	locale: 'cn',
	messages: {
		cn: {
			insert: "点击插入设计稿",
            quit: '退出'
        },
        en: {
			insert: "Click here to insert mockup",
			quit: 'Quit'
        }
    }
});

new Vue({
    el: '#app',
    i18n,
    render: h => h(App)
});
