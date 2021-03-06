import Vue from 'vue'
import VueI18n from 'vue-i18n'
import cn from "./cn";
import en from "./en";

Vue.use(VueI18n);

const DEFAULT_LANG = 'cn'
const locales = {
	cn, en
}

const i18n = new VueI18n({
	locale: DEFAULT_LANG,
	messages: locales
})


export const setupLang = (lang = DEFAULT_LANG) => {
	if (locales[lang] === undefined) lang = DEFAULT_LANG;
	Vue.config.lang = lang;
	i18n.locale = lang;
}

setupLang();
export default i18n