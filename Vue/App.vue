<style scoped lang="less">
    .Visual_Inspector{
        user-select: none;
        font-size: 12px;

        &.closed{
            .controllers{
                display: none;
            }
        }

        .toggler{
            position: fixed;
            right: 5px;
            top: 5px;
            line-height: 30px;
            text-align: center;
            border-radius: 5px;
            border-color: black;
            background: #eee;
            z-index: 9999;

            span{
                display: block;
                white-space: nowrap;
                line-height: 30px;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 0 5px;
            }
        }

        .mockup {
            width: 100%;
            height: 100%;
            z-index: 9997;
            position: absolute;
            left: 0;
            top: 0;
            background: rgba(255, 255, 255, .5) url() no-repeat center ~"0 / 100%" auto;
            box-shadow: 0 0 1px 2px #aaa;
        }

        .controllers {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #eee;
            z-index: 9998;
            padding: 5px;

            h3{
                padding-bottom: 5px;
            }
        }
        .reset{
            padding: 3px 10px;
            margin-right: 5px;
            border-radius: 3px;
        }
        input[type=file]{
            margin: 5px 0;
            -webkit-appearance: button;
        }

        .formLine{
            padding: 5px 0;
        }

        .smallInput{
            width: 30%;
        }

        .opacity{
            width: 50%;
            vertical-align: middle;

            &::before{
                content: 'opacity:';
                display: inline-block;
                white-space: nowrap;
                float: left;
            }
        }
        .blender{
            width: 20%;
        }
    }
</style>

<template>
    <div class="Visual_Inspector" :class="{closed}" v-show="img.src">
        <div ref="toggler" class="toggler">
            <span @click="closed = !closed" >{{ closed ? '打开面板' : '收起面板'}}</span>
            <span @click="showMockup = !showMockup" >{{ showMockup ? '隐藏图层' : '显示图层'}}</span>
        </div>

        <div class="mockup" ref="mockup" :style="mockupStyle" v-show="showMockup"></div>

        <div class="controllers">
            <h3>Visual Inspector</h3>
            <Blender @changeMode="changeBlendMode" :blendMode="blendMode" class="blender"/>

            <div>
                <div class="formLine">
                    <Button @click="reset" class="reset" type="primary" size="small">重置</Button>
                    <Button class="reset" type="primary" size="small" :key="index" v-for="(item, index) in wTypes" @click="wType = index">{{ item }}</Button>
                </div>

                <!--<div v-if="wType == 3">-->
                    <!--<Input v-model="mockup.width" size="small" number placeholder="宽度" class="smallInput"/>-->
                    <!--<Input v-model="mockup.height" size="small" number placeholder="高度" class="smallInput"/>-->
                <!--</div>-->

                <Slider class="opacity" v-model="opacity"  :step="0.05"  :min="0" :max="1"></Slider>

                <div class="formLine">
                    <span>图层控制: </span>
                    <Checkbox v-model="showMockup">显示</Checkbox>
                    <Checkbox v-model="freeze">冻结</Checkbox>
                    <Checkbox v-model="preventScroll">键盘滚动</Checkbox>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import interact from 'interactjs'
    import Blender from './Blender'

    export default {
        name: "App",
        components: {Blender},
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
                blendMode: 'darken',
                wTypes: ['原图大小', '窗口大小', '页面大小'],
                wType: 1,
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
            },
            mockupWapperStyle() {
                let {left, top} = this.mockup;
                return {
                    webkitTransform: `translate(${left}px, ${top}px)`,
                    transform: `translate(${left}px, ${top}px)`
                };
            },
        },
        watch: {
            wType() {
                let style = this.$refs.mockup.style;
                if (this.wType == 0) { // 原图大小
                    style.width = this.img.width + 'px';
                    style.height = this.img.height + 'px';
                } else if (this.wType == 1) { // 窗口大小
                    style.width = window.innerWidth + 'px';
                    style.height = window.innerHeight + 'px';
                } else if (this.wType == 2) { // 页面大小
                    style.width = window.innerWidth + 'px';
                    style.height = (document.documentElement.scrollHeight || document.body.scrollHeight)+ 'px';
                }
            }
        },
        methods: {
            changeBlendMode(mode) {
                console.log('changeBlendMode', mode)
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
                            // mockup.left = mockup.left - 1;
                            x -= count;
                            mockup.dataset.x = x;
                            break;
                        case 38:
                            // mockup.top = mockup.top - 1;
                            y -= count;
                            mockup.dataset.y = y;
                            break;
                        case 39:
                            // mockup.left = mockup.left + 1;
                            x += count;
                            mockup.dataset.x = x;
                            break;
                        case 40:
                            // mockup.top = mockup.top + 1;
                            y += count;
                            mockup.dataset.y = y;
                    }

                    mockup.style.webkitTransform = mockup.style.transform = `translate(${x}px, ${y}px)`;
                }
            },
            reset() {
                const mockup = this.$refs.mockup;
                mockup.style.webkitTransform = mockup.style.transform = 'translate(0, 0)';
                mockup.style.width = '100%';
                mockup.style.height = '100%';
                mockup.setAttribute('data-x', 0);
                mockup.setAttribute('data-y', 0);
            },
            // changeImg(e) {
            //     if (this.img.src) URL.revokeObjectURL(this.img.src);
            //
            //     let [file] = e.target.files;
            //     this.getImg(file).then(img => {
            //         this.img = {
            //             name: file.name,
            //             width: img.naturalWidth,
            //             height: img.naturalHeight,
            //             src: img.src
            //         }
            //     }, e => console.error(e));
            // },

            getImg(url) {
                return new Promise((resolve, reject)=>{
                    const img = new Image;
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                })
            },

            // dataURLtoBlob(dataUrl) {
            //     let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            //     while (n--) u8arr[n] = bstr.charCodeAt(n);
            //     return new Blob([u8arr], {type: mime});
            // },
            //
            // readFileAsDataUrl(file) {
            //     return new Promise(resolve => {
            //         const reader = new FileReader();
            //         reader.onload = function(e) {resolve(e.target.result)};
            //         reader.readAsDataURL(file);
            //     })
            // },

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

                // interact(this.$refs.toggler)
                //     .on('click', event => event.stopImmediatePropagation(), { capture: true })
                //     .draggable({
                //         inertia: true,
                //         autoScroll: true,
                //         onmove
                //     });

                interact(this.$refs.mockup)
                    .draggable({
                        onmove
                    })
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: true, right: true, bottom: true, top: true},

                        // minimum size
                        restrictSize: {
                            min: {width: 200, height: 100},
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
                    });
            },
            send(data, cb) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                        cb && cb(response);
                        console.log('response', response);
                    })
                })
            }
        },
        async created() {
            let img = await this.getImg(this.src);
            this.img = {
                width: img.naturalWidth,
                height: img.naturalHeight,
                src: img.src
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
