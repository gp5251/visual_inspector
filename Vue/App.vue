<style lang="less">
    .Visual_Inspector{
        user-select: none;
        font-size: 12px;
        color: #17233d;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
        text-align: center;

        *{
            padding: 0;
            margin: 0;
			box-sizing: content-box;
        }

        .vi_controllers {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 99999;
            padding: 5px;
            text-shadow: 1px 1px 0 white;
            border-top: 1px solid #ddd;
            background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);

            h3{
                padding-bottom: 5px;
                display: inline-block;
                margin-right: 10px;
                text-shadow: 1px 1px 0 white;
                color: #2d8cf0;
                font-size: 14px;
            }
        }
        .vi_reset{
            padding: 3px 10px;
            margin-right: 5px;
        }

        .vi_formLine{
            display: inline-block;
            vertical-align: middle;
            margin-right: 5px;
            padding: 3px 0;

            &::before{
                transform-origin: 0 center;
                display: inline-block;
                color: #17233d;
                margin-right: 5px;
                text-shadow: 1px 1px 0 white;
            }
        }

        .vi_freeze{
            margin-right: 5px;
        }

        .vi_blender {
            .tit{
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 4px 12px;

                .ico{
                    vertical-align: middle;
                    font-weight: bold;
                }
            }
        }

        .vi_quickMatch{
            .tit{
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 4px 12px;

                .ico{
                    vertical-align: middle;
                    font-weight: bold;
                }
            }
        }
        .vi_opacity{
            min-width: 15%;
            padding-right: 12px;

            .vi_slider{
                width: 100%;
                vertical-align: middle;

            }

            .vi_slider .vi-ivu-slider-button-wrap{
                top: -6px;
            }
        }

        .vi_customSize{
            .vi_input{
                height: 24px;
                padding: 2px;
                width: 42px;
                font-size: 12px;
                border: 1px solid #ddd;
                border-radius: 3px;
                margin-right: -5px;
                background-color: white;
                box-sizing: border-box;
                display: inline-block;

                outline: none;
            }
        }
    }

    .vi_lang_en /deep/ .vi-ivu-dropdown .vi-ivu-dropdown-item{
		line-height: 20px;
    }
</style>

<template>
    <div class="Visual_Inspector">
        <Mockup
            :opacity="opacity"
            :blendMode="blendMode"
            :freeze="freeze"
            :src="img.src"
            v-if="img.src"
            v-show="showMockup"/>

        <div class="vi_controllers" v-if="showPanel">
            <h3>Visual Inspector</h3>

            <div class="vi_formLine vi_opacity">
                <Slider class="vi_slider" v-model="opacity"  :step="0.01"  :min="0" :max="1"></Slider>
            </div>

            <div class="vi_formLine">
                <Checkbox v-model="freeze" class="vi_freeze">{{ this.$t("freeze") }}</Checkbox>
                <Checkbox v-model="showMockup">{{ this.$t("show") }}</Checkbox>
                <Checkbox v-model="useRestore">{{ this.$t("realtime") }}</Checkbox>
            </div>

            <div class="vi_formLine vi_blender">
                <Dropdown trigger="click">
                    <span class="tit">{{ modes[blendMode] }} <span class="ico">^</span></span>
                    <DropdownMenu slot="list">
                        <DropdownItem
                                :selected="key === blendMode"
                                :key="key"
                                v-for="(value, key) in modes"
                                @click.native="blendMode = key">{{ value }}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div class="vi_formLine vi_quickMatch">
                <Dropdown trigger="click">
                    <span class="tit">{{ this.$t("quickMatch.quickMatch") }} <span class="ico">^</span></span>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native="reset">{{ this.$t("quickMatch.reset") }}</DropdownItem>
                        <DropdownItem :key="index" v-for="(item, index) in wTypes" @click.native="wType = index">{{ item }}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div class="vi_customSize vi_formLine" @keydown.stop @keyup.stop>
                <input title="width" placeholder="width" type="text" class="vi_input" v-model.lazy="mockup.width" @keypress="handleCustomSizeInput"/>
                <input title="height" placeholder="height" type="text" class="vi_input" v-model.lazy="mockup.height" @keypress="handleCustomSizeInput"/>
                <input title="left" placeholder="left" type="text" class="vi_input" v-model.lazy="mockup.left" @keypress="handleCustomSizeInput"/>
                <input title="top" placeholder="top" type="text" class="vi_input" v-model.lazy="mockup.top" @keypress="handleCustomSizeInput"/>
            </div>
        </div>
    </div>
</template>

<script>
    import Mockup from './Mockup';
    import Checkbox from '../iview/components/checkbox';
    import Slider from '../iview/components/slider';
    import Dropdown from '../iview/components/dropdown';
    import DropdownMenu from '../iview/components/dropdown-menu';
    import DropdownItem from '../iview/components/dropdown-item';
    import {throttle} from "../utils";
    import '../iview/iview.css';

	export default {
        name: "App",
        components: {
            Checkbox, Slider, Dropdown, DropdownMenu, DropdownItem, Mockup
        },
        props: {
            src : {
                type: String,
                default() {
                    return ''
                }
            },
            restoredData: {
                type: Object,
                default() {
                    return { }
                }
            }
        },
        data() {
            return Object.assign({
                showPanel: true,
                showMockup: true,
                opacity: 1,
                freeze: 0,
                blendMode: 'normal',
                wType: -1,
                mockup: {
                    width: 0,
                    height: 0,
                    left: 0,
                    top: 0
                },
                img: {
                    width: 0,
                    height: 0,
                    src: ''
                },
                useRestore: false,
				tipMsg:''
            }, this.restoredData);
        },
		computed: {
			modes() {
				return {
					normal: this.$t("modes.normal"),
					multiply: this.$t("modes.multiply"),
					screen: this.$t("modes.screen"),
					overlay: this.$t("modes.overlay"),
					darken: this.$t("modes.darken"),
					lighten: this.$t("modes.lighten"),
					"color-dodge": this.$t("modes.colorDodge"),
					"color-burn": this.$t("modes.colorBurn"),
					"hard-light": this.$t("modes.hardLight"),
					"soft-light": this.$t("modes.softLight"),
					difference: this.$t("modes.difference"),
					exclusion: this.$t("modes.exclusion"),
					hue: this.$t("modes.hue"),
					saturation: this.$t("modes.saturation"),
					color: this.$t("modes.color"),
					luminosity: this.$t("modes.luminosity")
                }
			},
			wTypes(){
				return [
					this.$t("quickMatch.naturalWidth"),
					this.$t("quickMatch.naturalWidth*2"),
					this.$t("quickMatch.naturalWidth/2"),
					this.$t("quickMatch.windowWidth"),
					this.$t("quickMatch.centerInScreen")
				]
            }
        },
        watch: {
        	showMockup(val) {
        		this.tipMsg = this.$t(val ? "tip.showMockup" : "tip.hideMockup");
            },
			showPanel(val) {
				this.tipMsg = this.$t(val ? "tip.showPanel" : "tip.hidePanel");
			},
			freeze(val) {
				this.tipMsg = this.$t(val ? "tip.freeze" : "tip.unFreeze");
			},
			opacity(val) {
				this.tipMsg = this.$t("opacity") + ": " + +(val * 100).toFixed(2) + "%";
            },
            wType(val) {
                let mockup = this.mockup;
                switch (val) {
                    case 0: // 原图大小
                        this.moveAndResize({
                            width: this.img.width,
                            height: this.img.height
                        });
						this.tipMsg = this.$t("quickMatch.naturalWidth");
                        break;
					case 1: // 原图两倍
						this.moveAndResize({
							width: this.img.width * 2,
							height: this.img.height * 2
						});
						this.tipMsg = this.$t("quickMatch.naturalWidth*2");
						break;
					case 2: // 原图一半大小
						this.moveAndResize({
							width: this.img.width / 2,
							height: this.img.height / 2
						});
						this.tipMsg = this.$t("quickMatch.naturalWidth/2");
						break;
                    case 3: // 窗口宽度
						let width = window.innerWidth,
							height = this.img.height / (this.img.width / width);
						this.moveAndResize({left: 0, top: 0, width, height});
						this.tipMsg = this.$t("quickMatch.windowWidth");
                        break;
                    case 4: // 窗口居中
                        this.moveAndResize({
                            left: Math.max(0, (window.innerWidth - mockup.width) / 2),
                            top: Math.max(0, (window.innerHeight - mockup.height) / 2 + Math.max(document.documentElement.scrollTop, document.body.scrollTop))
                        });
						this.tipMsg = this.$t("quickMatch.centerInScreen");
                }
            },
            src: {
                handler(val) {
                    this.getImg(val).then(({width, height, src}) => {
                        this.img = {
                            width, height, src
                        };
                        if (!this.useRestore) this.reset();
                    }, err => console.error('failed to get img', err));
                },
                immediate: true
            },
            useRestore: {
                handler(val) {
                    if (val) {
                        let fn = throttle(()=>{
                            if (this.useRestore) {
                                let {opacity, freeze, blendMode, wType, mockup, img, useRestore, showPanel} = this.$data;
                                chrome.storage.local.set({_viData: JSON.stringify({opacity,freeze, blendMode, wType, mockup, img, useRestore,  showPanel})})
                                requestAnimationFrame(fn);
                            } else {
                            	chrome.storage.local.remove('_viData');
                            }
                        }, 500);

                        requestAnimationFrame(fn);
                    }

					this.tipMsg = this.$t(val ? "tip.useRestore" : "tip.unUseRestore");
                },
                immediate: true
            },
			tipMsg(val) {
        		this.$tip(val);
            }
        },
        methods: {
            handleCustomSizeInput(e) {
                if (e.which >57 || e.which < 48) e.preventDefault();
                if (e.which === 13) e.target.blur();
            },

            handlePreventScroll(e) {
	            if (e.target !== e.currentTarget) return;
                if (!this.freeze && 37 <= e.which && e.which <= 40) {
                    e.preventDefault();

                    let x = +this.mockup.left,
                        y = +this.mockup.top,
                        count = e.shiftKey ? 10 : 1;

                    switch (e.which) {
                        case 37:
                            x -= count;
                            break;
                        case 38:
                            y -= count;
                            break;
                        case 39:
                            x += count;
                            break;
                        case 40:
                            y += count;
                    }

                    this.moveAndResize({left: x, top: y});
                }
            },

            fastToggle(e) {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'h' || e.which === 72) this.showMockup = !this.showMockup;
                if (e.key === 'f' || e.which === 70) this.showPanel = !this.showPanel;
                if (e.key === 'd' || e.which === 68) this.freeze = !this.freeze;

				if (e.altKey) {
					if (e.key === '0' || e.which === 48) this.reset();
					if (e.key === '1' || e.which === 49) this.wType = 0;
					if (e.key === '2' || e.which === 50) this.wType = 1;
					if (e.key === '3' || e.which === 51) this.wType = 2;
					if (e.key === '4' || e.which === 52) this.wType = 3;
                }
            },

            fastOpacity(e) {
				if (e.target !== e.currentTarget || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (+e.key >= 0) {
                    if (this._tid) clearTimeout(this._tid);
                    if (!this._fastOpacity) this._fastOpacity = [];

                    let num = e.key;
                    this._fastOpacity.push(num);
                    if (this._fastOpacity.length >= 2) {
                        let arr = this._fastOpacity.slice(-2);
                        let opacity = (+arr.join('')) / 100;
                        this._fastOpacity = [];
                        if (opacity === 0) opacity = 1;
                        this.opacity = opacity;
                    }

                    this._tid = setTimeout(()=>{
                        if (this._fastOpacity.length === 1) {
                            let [opacity] = this._fastOpacity;
                            if (opacity > 0) {
                                opacity /= 10;
                                this.opacity = opacity;
                            }
                        }
                        this._fastOpacity = [];
                    }, 1000)
                }
            },

            reset() {
            	let width, height;
                if (this.img.width > window.innerWidth) {
					width = window.innerWidth;
					height = this.img.height / (this.img.width / width);
				} else {
                	width = this.img.width;
                	height = this.img.height;
				}

                this.moveAndResize({
                    width, height, 
                    left: Math.max(0, (window.innerWidth - width) / 2),
                    top: Math.max(0, (window.innerHeight - height) / 2 + Math.max(document.documentElement.scrollTop, document.body.scrollTop))
                });

				this.tipMsg = this.$t("quickMatch.reset");
            },

            moveAndResize(rect) {
                Object.assign(this.mockup, rect);
                this.wType = -1;
            },

            getImg(url) {
                return new Promise((resolve, reject)=>{
                    const img = new Image;
                    img.src = url;
                    img.onload = () => resolve({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        src: url
                    });
                    img.onerror = reject;
                })
            },

            send(data, cb) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                        cb && cb(response);
                    })
                })
            },

            bindEvs() {
                document.body.addEventListener('keydown', this.handlePreventScroll);
                document.body.addEventListener('keyup', this.fastToggle);
                document.body.addEventListener('keyup', this.fastOpacity);
            },

            unBindEvs() {
                document.body.removeEventListener('keydown', this.handlePreventScroll)
                document.body.removeEventListener('keyup', this.fastToggle);
                document.body.removeEventListener('keyup', this.fastOpacity);
            },

            insertCss() {
                this._link = document.createElement('link');
                this._link.rel = "stylesheet";
                this._link.href = chrome.extension.getURL('content.css');

                window.appRoot.shadowRoot.appendChild(this._link)
            },

            removeCss() {
                this._link.remove();
            },

            showHelperMsg() {
                let msg = [
                    ['- h 键: 显示和隐藏图片', '- h: show or hide mockup'],
                    ['- f 键: 显示和隐藏底部工具栏', '- f: show or hide the bottom toolbar'],
                    ['- d 键: 冻结和解冻图片', '- d: freeze or unfreeze mockup'],
                    ['- 数字键（0-9）：`设置图片透明度`。如：1秒内快速按下两次5，将设置图片55%的透明度。如果1秒内只按下了一次数字键，如5，一秒后将自动补0，即设置图片透明度为50%。', '- Number keys (0-9): Quickly set the mockup transparency. For example, if you press 5 twice in 1 second, the transparency of the mockup will be set at 55%. If only the number key is pressed once in 1 second, such as 5, it will automatically fill 0 after one second, that is, set the mockup transparency to 50%.'],
                    ['- 方向键：移动图片，一次移动1px。如果同时按下Shift键，将一次移动10px。', '- Arrow keys: Move the mockup and move 1px at a time. If you press the Shift key at the same time, you will move 10px at a time.'],
                    ['- 快速匹配', '- Quick adaptation:'],
                    ['\t- alt + 0 : 重置', '\t- alt + 0: Reset'],
                    ['\t- alt + 1 : 原图大小', '\t- alt + 1: Original image size'],
                    ['\t- alt + 2 : 原图两倍', '\t- alt + 2: Original size *2'],
                    ['\t- alt + 3 : 原图一半', '\t- alt + 3: Original size /2'],
                    ['\t- alt + 4 : 窗口宽度', '\t- alt + 4: Window Width'],
                ]
                .map(msg => msg[this.$i18n.locale === 'cn' ? 0 : 1])
                .join('\n');

                console.log('%c' + msg, 'color: yellow');
            }
        },
        created() {
            this.bindEvs();
            this.insertCss();
            this.showHelperMsg();
        },
        beforeDestroy() {
            this.unBindEvs();
            this.removeCss();
            this.useRestore = false;
        }
    }
</script>
