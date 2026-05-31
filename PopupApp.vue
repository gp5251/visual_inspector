<template>
  <div id="app">
    <h3>Visual Inspector</h3>
    <div class="filePicker">
      <span class="tit">{{ $t("insert") }}</span>
      <input type="file" @change="insertImg" :key="newInputKey" accept="image/*" />
    </div>
    <button @click="quit" v-if="appIsRunning">{{ $t("quit") }}</button>
    <div class="lang">
      <span @click="changeLang('cn')" :class="{ on: $i18n.locale == 'cn' }">中文</span>
      <span @click="changeLang('en')" :class="{ on: $i18n.locale == 'en' }">English</span>
    </div>
    <div class="shortcuts">
      <h4>{{ $t("shortcuts.title") }}</h4>
      <div class="shortcut-grid">
        <div class="shortcut-item">
          <kbd>H</kbd>
          <span>{{ $t("shortcuts.toggleMockup") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>F</kbd>
          <span>{{ $t("shortcuts.toggleToolbar") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>D</kbd>
          <span>{{ $t("shortcuts.toggleFreeze") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>0-9</kbd>
          <span>{{ $t("shortcuts.opacity") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>←↑→↓</kbd>
          <span>{{ $t("shortcuts.move") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>Shift + ↑↓←→</kbd>
          <span>{{ $t("shortcuts.moveFast") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>Alt + 0</kbd>
          <span>{{ $t("shortcuts.reset") }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>Alt + 1~4</kbd>
          <span>{{ $t("shortcuts.quickMatch") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      appIsRunning: false,
      newInputKey: 0
    };
  },
  methods: {
    insertImg(e) {
      let [file] = e.target.files;
      this.readFileAsDataUrl(file).then(dataUrl => {
        this.send({ type: 'insertImg', data: { dataUrl } }, ({ type, state }) => {
          if (type === 'insertImg') {
            this.appIsRunning = !!state;
            this.newInputKey = Math.random();
          }
        });
      });
    },

    changeLang(lang) {
      this.send({ type: 'changeLang', data: { lang } }, response => {
        if (response && response.type === 'changeLang') {
          this.$i18n.locale = response.data.lang;
          this.saveLang(response.data.lang);
        }
      });
    },

    dataURLtoBlob(dataUrl) {
      let arr = dataUrl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new Blob([u8arr], { type: mime });
    },

    readFileAsDataUrl(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function(e) {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    quit() {
      this.send({ type: 'quit' }, ({ type, state }) => {
        if (type === 'quit') this.appIsRunning = !!state;
      });
    },

    send(data, cb) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
            cb && response && cb(response);
            console.log('response', response);
            });
        }
      });
    },

    getLang() {
      return new Promise(resolve => {
        chrome.storage.local.get({ lang: chrome.i18n.getMessage("locales") }, data => {
          resolve(data.lang);
        });
      });
    },

    saveLang(lang) {
      chrome.storage.local.set({ lang }, () => {
        console.log('lang saved');
      });
    }
  },
  created() {
    this.getLang().then(lang => {
      this.$i18n.locale = lang;

      this.send({ type: 'appState', data: { lang } }, (response) => {
        if (response && response.type === 'appState') {
          this.appIsRunning = response.data.state === 'running';
        }
      });
    });
  }
};
</script>

<style>
.shortcuts {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f0f0f0;
    text-align: left;
}
.shortcuts h4 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.5px;
}
.shortcut-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
}
.shortcut-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
}
.shortcut-item kbd {
    display: inline-block;
    min-width: 28px;
    text-align: center;
    padding: 2px 6px;
    font-size: 11px;
    font-family: -apple-system, "SF Mono", "Monaco", "Menlo", monospace;
    color: #444;
    background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
    border: 1px solid #d4d4d4;
    border-bottom-width: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    white-space: nowrap;
    line-height: 1.4;
}
.shortcut-item span {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

