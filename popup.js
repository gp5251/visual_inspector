import Vue from 'vue';
import VueI18n from "vue-i18n";
import App from './PopupApp.vue';

Vue.use(VueI18n);

const i18n = new VueI18n({
	locale: 'cn',
	messages: {
		cn: {
			insert: "点击插入设计稿",
			quit: '退出',
			shortcuts: {
				title: "快捷键",
				toggleMockup: "显示/隐藏设计稿",
				toggleToolbar: "显示/隐藏工具栏",
				toggleFreeze: "冻结/解冻设计稿",
				opacity: "设置透明度",
				move: "移动设计稿 (1px)",
				moveFast: "移动设计稿 (10px)",
				reset: "重置",
				quickMatch: "快速匹配"
			}
		},
		en: {
			insert: "Click here to insert mockup",
			quit: 'Quit',
			shortcuts: {
				title: "Shortcuts",
				toggleMockup: "Show/hide mockup",
				toggleToolbar: "Show/hide toolbar",
				toggleFreeze: "Freeze/unfreeze mockup",
				opacity: "Set opacity",
				move: "Move mockup (1px)",
				moveFast: "Move mockup (10px)",
				reset: "Reset",
				quickMatch: "Quick match"
			}
		}
	}
});

new Vue({
    el: '#app',
    i18n,
    render: h => h(App)
});
