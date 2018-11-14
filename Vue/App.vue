<style scoped lang="less">
    .Visual_Inspector{
        user-select: none;
        font-size: 12px;
        color: #17233d;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
        text-align: center;

        *{
            padding: 0;
            margin: 0;
        }

        .vi_controllers {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 99998;
            padding: 5px;
            text-shadow: 1px 1px 0 white;
            border-top: 1px solid #ddd;

            // background: linear-gradient(to bottom, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%)
            // background: linear-gradient(to bottom, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);
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
            min-width: 20%;
            padding-right: 12px;

            .vi_slider{
                width: 100%;
                vertical-align: middle;

            }

            .vi_slider /deep/ .vi-ivu-slider-button-wrap{
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
            }
        }
    }
</style>

<template>
    <div class="Visual_Inspector">
        <!--<FloatingBar-->
            <!--:showPanel="showPanel"-->
            <!--:showMockup="showMockup"-->
            <!--@togglePanel="showPanel = !showPanel"-->
            <!--@toggleMockup="showMockup = !showMockup"-->
            <!--@quit="$emit('quit')"/>-->

        <Mockup
            :opacity="opacity"
            :blendMode="blendMode"
            :freeze="freeze"
            :src="img.src"
            :w="mockup.width"
            :h="mockup.height"
            :x="mockup.left"
            :y="mockup.top"
            @moveAndResize="moveAndResize"
            v-if="img.src"
            v-show="showMockup"/>

        <div class="vi_controllers" v-if="showPanel">
            <h3>Visual Inspector</h3>

            <div class="vi_formLine vi_opacity">
                <Slider class="vi_slider" v-model="opacity"  :step="0.01"  :min="0" :max="1"></Slider>
            </div>

            <div class="vi_formLine">
                <Checkbox v-model="freeze" class="vi_freeze">冻结</Checkbox>
                <Checkbox v-model="showMockup">显示</Checkbox>
                <Checkbox v-model="useRestore">实时</Checkbox>
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
                    <span class="tit">快速适配 <span class="ico">^</span></span>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native="reset">重置</DropdownItem>
                        <DropdownItem :key="index" v-for="(item, index) in wTypes" @click.native="wType = index">{{ item }}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div class="vi_customSize vi_formLine" @keydown.stop @keyup.stop>
                <input title="width" placeholder="width" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.width" @keypress="handleCustomSizeInput"/>
                <input title="height" placeholder="height" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.height" @keypress="handleCustomSizeInput"/>
                <input title="left" placeholder="left" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.left" @keypress="handleCustomSizeInput"/>
                <input title="top" placeholder="top" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.top" @keypress="handleCustomSizeInput"/>
            </div>
        </div>
    </div>
</template>

<script>
    // import FloatingBar from './FloatingBar';
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
            Checkbox, Slider, Dropdown, DropdownMenu, DropdownItem,
            // FloatingBar,
            Mockup
        },
        props: {
            src : {
                type: String,
                default: function () {
                    return ''
                }
            },
            restoredData: {
                type: Object,
                default: function () {
                    return {
                    }
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
                wTypes: ['原图大小', '原图大小/2', '窗口宽高', '页面宽高', '窗口居中'],
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
                modes: {
                    normal: '正常',
                    multiply: '正片叠底',
                    screen: '滤色',
                    overlay: '叠加',
                    darken: '变暗',
                    lighten: '变亮',
                    "color-dodge": '颜色减淡',
                    "color-burn": '颜色加深',
                    "hard-light": '强光',
                    "soft-light": '柔光',
                    difference: '差值',
                    exclusion: '排除',
                    hue: '色相',
                    saturation: '饱和度',
                    color: '颜色',
                    luminosity: '亮度',
                },
                useRestore: false,
            }, this.restoredData);
        },
        watch: {
            wType(val) {
                let mockup = this.mockup;
                switch (val) {
                    case 0:
                        this.moveAndResize({width: this.img.width, height: this.img.height});
                        break;
                    case 1:
                        this.moveAndResize({width: this.img.width / 2, height: this.img.height / 2});
                        break;
                    case 2:
                        this.moveAndResize({width: window.innerWidth, height: window.innerHeight});
                        break;
                    case 3:
                        this.moveAndResize({width: window.innerWidth, height: document.documentElement.scrollHeight});
                        break;
                    case 4:
                        this.moveAndResize({left: Math.max(0, (window.innerWidth - mockup.width) / 2), top: Math.max(0, (window.innerHeight - mockup.height) / 2 + window.scrollY)});
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
                                let {opacity, freeze, blendMode, wType, mockup, img, useRestore} = this.$data;
                                sessionStorage._viData = JSON.stringify({opacity, freeze, blendMode, wType, mockup, img, useRestore});
                                requestAnimationFrame(fn);
                            } else {
                                delete sessionStorage._viData;
                            }
                        }, 500);

                        requestAnimationFrame(fn);
                    }
                },
                immediate: true
            }
        },
        methods: {
            handleCustomSizeInput(e) {
                if (e.which >57 || e.which < 48) e.preventDefault();
                if (e.which === 13) e.target.blur();
            },

            handlePreventScroll(e) {
                if (e.target.tagName.toLowerCase() !== 'body') return;
                if (!this.freeze && 37 <= e.which && e.which <= 40) {
                    e.preventDefault();

                    let x = this.mockup.left,
                        y = this.mockup.top,
                        count = e.shiftKey ? 10 : 1;

                    x = +x;
                    y = +y;

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
                if (e.target.tagName.toLowerCase() !== 'body') return;
                if (e.key === 'h') this.showMockup = !this.showMockup;
                if (e.key === 'f') this.showPanel = !this.showPanel;
                if (e.key === 'd') this.freeze = !this.freeze;
            },

            fastOpacity(e) {
                if (e.target.tagName.toLowerCase() !== 'body') return;
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
                this.moveAndResize({left: 0, top: 0});
                if (this.img.width > window.innerWidth) this.wType = 2;
                else this.wType = 0;
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
                (document.head||document.documentElement).appendChild(this._link);
            },

            removeCss() {
                this._link.remove();
            }
        },
        directives: {
            autoSelect: {
                bind(el) {
                    // fix popup context menu bug
                    el._select = function() {
                        if (el._tid) clearTimeout(el._tid);
                        el._tid = setTimeout(el.select.bind(el), 20)
                    };

                    el.addEventListener('focus', el._select)
                },
                unbind(el) {
                    el.removeEventListener('focus', el._select)
                }
            }
        },
        created() {
            window.scrollTo(0, 0);
            this.bindEvs();
            this.insertCss();

        },
        beforeDestroy() {
            this.unBindEvs();
            this.removeCss();
            this.useRestore = false;
        }
    }
</script>
