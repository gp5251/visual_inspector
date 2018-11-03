<style scoped lang="less">
    .Visual_Inspector{
        user-select: none;
        font-size: 12px;
        color: #17233d;

        &.vi_closed{
            .vi_controllers{
                display: none;
            }
        }

        .vi_toggler{
            position: fixed;
            right: 5px;
            top: 5px;
            line-height: 30px;
            text-align: center;
            border-radius: 5px;
            border-color: black;
            background: #eee;
            z-index: 9999;
            touch-action: none;

            span{
                display: block;
                white-space: nowrap;
                line-height: 30px;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 0 5px;
            }
        }

        .vi_mockup {
            width: 100%;
            height: 100%;
            z-index: 9997;
            position: absolute;
            left: 0;
            top: 0;
            background: rgba(255, 255, 255, .5) url() no-repeat center ~"0 / 100%" auto;
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
            background-color: #eee;
            z-index: 9998;
            padding: 10px;
            text-shadow: 1px 1px 0 white;
            border-top: 1px solid #ddd;

            // background: rgba(242,246,248,1);background: -moz-linear-gradient(top, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(242,246,248,1)), color-stop(50%, rgba(216,225,231,1)), color-stop(51%, rgba(181,198,208,1)), color-stop(100%, rgba(224,239,249,1)));background: -webkit-linear-gradient(top, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);background: -o-linear-gradient(top, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);background: -ms-linear-gradient(top, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);background: linear-gradient(to bottom, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f2f6f8', endColorstr='#e0eff9', GradientType=0 );
            // background: rgba(183,222,237,1);background: -moz-linear-gradient(top, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(183,222,237,1)), color-stop(50%, rgba(113,206,239,1)), color-stop(51%, rgba(33,180,226,1)), color-stop(100%, rgba(183,222,237,1)));background: -webkit-linear-gradient(top, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);background: -o-linear-gradient(top, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);background: -ms-linear-gradient(top, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);background: linear-gradient(to bottom, rgba(183,222,237,1) 0%, rgba(113,206,239,1) 50%, rgba(33,180,226,1) 51%, rgba(183,222,237,1) 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7deed', endColorstr='#b7deed', GradientType=0 );
            background: rgba(255,255,255,1);background: -moz-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(255,255,255,1)), color-stop(47%, rgba(246,246,246,1)), color-stop(100%, rgba(237,237,237,1)));background: -webkit-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);background: -o-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);background: -ms-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ededed', GradientType=0 );

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
                content: '对比模式:';
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
                margin-top: 8px;
            }

            .vi_sliderWraper{
                // max-width: 100px;
                min-width: 80px;
                display: block;
                margin-left: 30px;
            }

            .vi_slider{
                width: 100%;
                vertical-align: middle;
            }
        }
        .vi_others{
            white-space: nowrap;
        }
    }
</style>

<template>
    <div class="Visual_Inspector" :class="{'vi_closed': closed}">
        <div ref="toggler" class="vi_toggler">
            <span @click="closed = !closed" >{{ closed ? '打开面板' : '收起面板'}}</span>
            <span @click="showMockup = !showMockup" >{{ showMockup ? '隐藏图层' : '显示图层'}}</span>
            <span class="vi_quit" @click="$emit('quit')">退出</span>
        </div>

        <div class="vi_mockup" :class="{freeze}" ref="mockup" :style="mockupStyle" v-show="showMockup"></div>

        <div class="vi_controllers">
            <h3>Visual Inspector</h3>
            <Blender @changeMode="changeBlendMode" :blendMode="blendMode" class="vi_blender vi_formLine"/>

            <div class="vi_formLine vi_opacity">
                <div class="vi_sliderWraper">
                    <Slider class="vi_slider" v-model="opacity"  :step="0.05"  :min="0" :max="1"></Slider>
                </div>
            </div>

            <div class="vi_formLine vi_others">
                <!--<checkbox v-model="showMockup" title="显示隐藏图层">显示</checkbox>-->
                <checkbox v-model="freeze" title="冻结后图层将不可拖动和拉伸">冻结</checkbox>
            </div>

            <div class="vi_formLine vi_resize">
                <button @click="reset" class="vi_reset">重置</button>
                <button class="vi_reset" :key="index" v-for="(item, index) in wTypes" @click="wType = index">{{ item }}</button>
            </div>
        </div>
    </div>
</template>


<script>
    import interact from 'interactjs'
    import Blender from './Blender'
    import Checkbox from '../iview/components/checkbox';
    import Slider from '../iview/components/slider';

    export default {
        name: "App",
        components: {Blender, Checkbox, Slider},
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
                closed: false,
                showMockup: true,
                opacity: 1,
                freeze: 0,
                blendMode: 'normal',
                wTypes: ['原图', '原图/2', '窗口', '页面'],
                wType: -1,
                mockup: {
                    // width: window.innerWidth,
                    // height: window.innerHeight,
                    left: 0,
                    top: 0
                },
                img: {
                    name: '暂无',
                    width: 0,
                    height: 0,
                    src: ''
                },
                preventScroll: true
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
                // style.backgroundSize = this.getBgSize(this.wType);
                return style;
            }
        },
        watch: {
            wType(val) {
                    let style = this.$refs.mockup.style;
                    if (val === 0) { // 原图大小
                        style.width = this.img.width + 'px';
                        style.height = this.img.height + 'px';
                    } else if (val === 1) { // 原图大小/2
                        style.width = this.img.width / 2 + 'px';
                        style.height = this.img.height / 2 + 'px';
                    } else if (val === 2) { // 窗口大小
                        style.width = window.innerWidth + 'px';
                        style.height = window.innerHeight + 'px';
                    } else if (val === 3) { // 页面大小
                        style.width = window.innerWidth + 'px';
                        style.height = (document.documentElement.scrollHeight || document.body.scrollHeight)+ 'px';
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
                        this.wType = 2;
                    }, err => {
                        console.error('failed to get img', val);
                    });
                },
                immediate: true
            }
        },
        methods: {
            changeBlendMode(mode) {
                this.blendMode = mode;
            },
            handlePreventScroll(e) {
                if (this.preventScroll) {
                    e.preventDefault();

                    let {mockup} = this.$refs,
                        {x = 0, y = 0} = mockup.dataset,
                        count = e.shiftKey ? 10 : 1;
                    x = +x;
                    y = +y;

                    switch (e.which) {
                        case 37:
                            x -= count;
                            mockup.dataset.x = x;
                            break;
                        case 38:
                            y -= count;
                            mockup.dataset.y = y;
                            break;
                        case 39:
                            x += count;
                            mockup.dataset.x = x;
                            break;
                        case 40:
                            y += count;
                            mockup.dataset.y = y;
                    }

                    mockup.style.webkitTransform = mockup.style.transform = `translate(${x}px, ${y}px)`;
                }
            },
            reset() {
                const mockup = this.$refs.mockup;
                mockup.style.webkitTransform = mockup.style.transform = 'translate(0, 0)';
                mockup.setAttribute('data-x', 0);
                mockup.setAttribute('data-y', 0);

                this.wType = 0;
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
                let onmove =(event)=>{
                    let target = event.target,
                        // keep the dragged position in the data-x/data-y attributes
                        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    // translate the element
                    target.style.webkitTransform =
                        target.style.transform =
                            'translate(' + x + 'px, ' + y + 'px)';

                    // update the posiion attributes
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                };

                interact(this.$refs.toggler)
                    // .on('click', event => event.stopImmediatePropagation(), { capture: true })
                    .draggable({
                        inertia: true,
                        autoScroll: true,
                        onmove
                    });

                interact(this.$refs.mockup)
                    .draggable({
                        onmove,
                        snap: {
                            targets: [
                                {x: 0, y: 0, range: 20},
                                function () {
                                    return {
                                        x: window.innerWidth,
                                        y: 0,
                                        range: 20
                                    }
                                }
                            ],
                            relativePoints: [
                                {x: 0, y: 0}, {x: 1, y: 0}
                            ]
                        }
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

                        // update the element's style
                        target.style.width  = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.webkitTransform = target.style.transform =
                            'translate(' + x + 'px,' + y + 'px)';

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);

                        this.wType = -1;
                    });
            },
            send(data, cb) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                        cb && cb(response);
                    })
                })
            }
        },
        mounted() {
            this.initMockup();
            this._handlePreventScroll = this.handlePreventScroll.bind(this);
            //
            document.body.addEventListener('keydown', this._handlePreventScroll)
        },
        beforeDestroy() {
            document.body.removeEventListener('keydown', this._handlePreventScroll)
        }
    }
</script>
