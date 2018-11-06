<style scoped lang="less">
    .Visual_Inspector{
        user-select: none;
        font-size: 12px;
        color: #17233d;

        .vi_mockup {
            width: 100%;
            height: 100%;
            z-index: 9997;
            position: absolute;
            left: 0;
            top: 0;
            background: rgba(0, 0, 0, .5) url() no-repeat center ~"0 / 100%" auto;
            box-shadow: 0 0 1px 0 #ccc;
            touch-action: none;

            &.freeze::after{
                display: none;
            }

            &::after{
                content: '';
                width: 100%;
                height: 100%;
                padding: 3px;
                position: absolute;
                left: -3px;
                top: -3px;
                box-sizing: content-box;
                background: radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left top,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left bottom,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right top,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right bottom,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left 50%,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat 50% top,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat 50% bottom,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right top,
                radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right 50%;
                background-size: 6px 6px;
            }
        }

        .vi_controllers {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9998;
            padding: 10px;
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
            }

            .vi_quit{
                position: absolute;
                right: 5px;
                top: 5px;
                font-weight: bold;
                cursor: pointer;
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
                transform: scale(.9, .9);
                display: inline-block;
                color: #17233d;
                margin-right: 5px;
                text-shadow: 1px 1px 0 white;
            }
        }

        .vi_blender{
            &::before{
                content: '混合模式:';
            }
        }
        .vi_resize{
            &::before{
                content: '位置大小:';
            }

            button{
                line-height: 14px;
                background: white;
                border: 1px solid #ddd;
                // box-shadow: 0 0 3px #ccc;
                font-size: 12px;
                color: #17233d;

                &:focus{
                    outline: none;
                    box-shadow: 0 0 5px #5cadff;
                }
            }
        }
        .vi_opacity{
            min-width: 25%;
            padding-right: 5px;

            &::before{
                content: '透明:';
                float: left;
            }

            .vi_sliderWraper{
                min-width: 80px;
                display: block;
                margin-left: 30px;
            }

            .vi_slider{
                width: 100%;
                vertical-align: middle;

            }
            .vi_slider /deep/ .vi-ivu-slider-wrap{
                margin: 8px 0;
            }
        }
        .vi_others{
            white-space: nowrap;
        }

        .vi_customSize{
            &::before{
                content: '自定义:';
            }

            .vi_input{
                height: 22px;
                padding: 2px;
                width: 48px;
                border: 1px solid #ddd;
                border-radius: 3px;
                margin-right: 2px;
                &:focus{
                    outline: none;
                    box-shadow: 0 0 5px #5cadff;
                }
            }
        }
    }
</style>

<template>
    <div class="Visual_Inspector">
        <FloatingBar
                :showPanel="showPanel"
                :showMockup="showMockup"
                @togglePanel="showPanel = !showPanel" @toggleMockup="showMockup = !showMockup" @quit="$emit('quit')"/>

        <div class="vi_mockup" :class="{freeze}" ref="mockup" :style="mockupStyle" v-show="showMockup"></div>

        <div class="vi_controllers" v-show="showPanel">
            <h3>Visual Inspector</h3>
            <Blender @changeMode="changeBlendMode" :blendMode="blendMode" class="vi_blender vi_formLine"/>

            <div class="vi_formLine vi_opacity">
                <div class="vi_sliderWraper">
                    <Slider class="vi_slider" v-model="opacity"  :step="0.01"  :min="0" :max="1"></Slider>
                </div>
            </div>

            <div class="vi_formLine vi_others">
                <!--<Checkbox v-model="allowKeyMove">方向键</Checkbox>-->
                <Checkbox v-model="freeze">冻结</Checkbox>
            </div>

            <div class="vi_formLine vi_resize">
                <button @click="reset" class="vi_reset">重置</button>
                <button class="vi_reset" :key="index" v-for="(item, index) in wTypes" @click="wType = index">{{ item }}</button>
            </div>

            <div class="vi_customSize vi_formLine" @keydown.stop @keyup.stop>
                <input placeholder="width" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.width" @keypress="handleCustomSizeInput"/>
                <input placeholder="height" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.height" @keypress="handleCustomSizeInput"/>
                <input placeholder="left" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.left" @keypress="handleCustomSizeInput"/>
                <input placeholder="top" v-autoSelect type="text" class="vi_input" v-model.lazy="mockup.top" @keypress="handleCustomSizeInput"/>
            </div>
        </div>
    </div>
</template>


<script>
    import interact from 'interactjs';
    import Blender from './Blender';
    import FloatingBar from './floatingBar';
    import Checkbox from '../iview/components/checkbox';
    import Slider from '../iview/components/slider';
    import '../iview/iview.css';

    export default {
        name: "App",
        components: {Blender, Checkbox, Slider, FloatingBar},
        props: {
            src : {
                type: String,
                default: function () {
                    return ''
                }
            }
        },
        data() {
            return {
                showPanel: true,
                showMockup: true,
                opacity: 1,
                freeze: 0,
                blendMode: 'normal',
                wTypes: ['原图', '原图/2', '窗口', '页面'],
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
                allowKeyMove: true,
            }
        },
        computed: {
            mockupStyle() {
                let style = {
                    opacity: this.opacity,
                    'mix-blend-mode': this.blendMode,
                };
                if (this.freeze) style.pointerEvents = 'none';
                if (this.img.src) style.backgroundImage = `url(${this.img.src})`;
                return style;
            }
        },
        watch: {
            wType(val) {
                let mockup = this.mockup;
                if (val === 0) { // 原图大小
                    mockup.width = this.img.width;
                    mockup.height = this.img.height;
                } else if (val === 1) { // 原图大小/2
                    mockup.width = this.img.width / 2;
                    mockup.height = this.img.height / 2;
                } else if (val === 2) { // 窗口大小
                    mockup.width = window.innerWidth;
                    mockup.height = window.innerHeight;
                } else if (val === 3) { // 页面大小
                    mockup.width = window.innerWidth;
                    mockup.height = document.documentElement.scrollHeight;
                }
            },
            src: {
                handler(val) {
                    this.getImg(val).then(img => {
                        this.img = {
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            src: img.src
                        };
                        this.reset();
                    }, err => console.error('failed to get img', err));
                },
                immediate: true
            },
            "mockup.width": function (val) {
                let value = +val;
                if (value > 0) this.$refs.mockup.style.width = value + 'px';
                this.wType = -1;
            },
            "mockup.height": function (val) {
                let value = +val;
                if (value > 0) this.$refs.mockup.style.height = value + 'px';
                this.wType = -1;
            },
            "mockup.left": function (val) {
                let value = +val;
                if (!isNaN(value)) {
                    let {y} = this.$refs.mockup.dataset;
                    this._moveMockup(val, y);
                    this.wType = -1;
                }
            },
            "mockup.top": function (val) {
                let value = +val;
                if (!isNaN(value)) {
                    let {x} = this.$refs.mockup.dataset;
                    this._moveMockup(x, val);
                    this.wType = -1;
                }
            }
        },
        methods: {
            changeBlendMode(mode) {
                this.blendMode = mode;
            },
            handleCustomSizeInput(e) {
                if (e.which >57 || e.which < 48) e.preventDefault();
            },
            handlePreventScroll(e) {
                if (e.target.tagName.toLowerCase() !== 'body') return;
                if (!this.freeze && 37 <= e.which && e.which <= 40) {
                    e.preventDefault();

                    let {mockup} = this.$refs,
                        {x = 0, y = 0} = mockup.dataset,
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

                    this.moveMockup(x, y);
                }
            },

            toggleMockup(e) {
                if (e.target.tagName.toLowerCase() !== 'body') return;
                if (e.key === 'h') this.showMockup = !this.showMockup;
            },

            togglePannel(e) {
                if (e.target.tagName.toLowerCase() !== 'body') return;
                if (e.key === 'f') this.showPanel = !this.showPanel;
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
                        this._fastOpacity = [];
                    }, 3000)
                }
            },

            reset() {
                this.moveMockup(0, 0);
                if (this.img.width > window.innerWidth) this.wType = 2;
                else this.wType = 0;
            },

            _moveMockup(x = 0, y = 0) {
                let {mockup} = this.$refs;
                mockup.style.webkitTransform = mockup.style.transform = `translate(${x}px, ${y}px)`;
                mockup.setAttribute('data-x', x);
                mockup.setAttribute('data-y', y);
            },

            moveMockup(x = 0, y = 0) {
                this.mockup.left = x;
                this.mockup.top = y;
            },

            getImg(url) {
                return new Promise((resolve, reject)=>{
                    const img = new Image;
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                })
            },

            initMockup() {
                interact(this.$refs.mockup)
                    .draggable({
                        onmove: event => {
                            let target = event.target,
                                // keep the dragged position in the data-x/data-y attributes
                                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                            this.moveMockup(+x.toFixed(1), +y.toFixed(1));
                        },
                        // snap: {
                        //     targets: [
                        //         {x: 0, y: 0, range: 15},
                        //         function () {
                        //             return {
                        //                 x: window.innerWidth,
                        //                 y: 0,
                        //                 range: 15
                        //             }
                        //         }
                        //     ],
                        //     relativePoints: [
                        //         {x: 0, y: 0}, {x: 1, y: 0}
                        //     ]
                        // }
                    })
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: true, right: true, bottom: true, top: true},

                        // minimum size
                        restrictSize: {
                            min: {width: 100, height: 50},
                        },

                        inertia: true,
                    })
                    .on('resizemove',(event) => {
                        let target = event.target,
                            x = (parseFloat(target.getAttribute('data-x')) || 0),
                            y = (parseFloat(target.getAttribute('data-y')) || 0);

                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        this.mockup.width = +event.rect.width.toFixed(1);
                        this.mockup.height = +event.rect.height.toFixed(1);

                        this.moveMockup(+x.toFixed(1), +y.toFixed(1));

                        this.wType = -1;
                    });
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
                document.body.addEventListener('keyup', this.toggleMockup);
                document.body.addEventListener('keyup', this.fastOpacity);
                document.body.addEventListener('keyup', this.togglePannel);
            },
            unBindEvs() {
                document.body.removeEventListener('keydown', this.handlePreventScroll)
                document.body.removeEventListener('keyup', this.toggleMockup);
                document.body.removeEventListener('keyup', this.fastOpacity);
                document.body.removeEventListener('keyup', this.togglePannel);
            }
        },
        directives: {
            autoSelect: {
                bind(el) {
                    // fix mac popup contextMenu bug
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
            window.scrollTo(0,0);
            this.bindEvs();
        },
        mounted() {
            this.initMockup();
        },
        beforeDestroy() {
            this.unBindEvs();
        }
    }
</script>
