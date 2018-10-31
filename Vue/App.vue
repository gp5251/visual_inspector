<style scoped lang="less">
    .feHelper{
        user-select: none;
        font-size: 14px;

        &.closed{
            .controllers{
                display: none;
            }
        }

        .toggler{
            position: fixed;
            right: 5px;
            top: 5px;
            width: 80px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border-radius: 5px;
            border-color: black;
            background: #eee;
            z-index: 9999;
        }

        .mockup {
            /*width: 100%;*/
            /*height: 100%;*/
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
    }
</style>

<template>
    <div class="feHelper" :class="{closed}">
        <span ref="toggler" @click="closed = !closed" class="toggler" >{{ closed ? '打开面板' : '收起面板'}}</span>

        <div class="mockup" ref="mockup" :style="mockupStyle" v-show="img.src && showMockup"></div>

        <div class="controllers">
            <h3>FeHelper</h3>

            <span>选取设计稿：</span>
            <input type="file" accept="image/*" @change="changeImg" />

            <div v-if="img.src">
                <div class="formLine">
                    <Button @click="reset" class="reset" type="primary" size="small">重置</Button>

                    <RadioGroup v-model="wType" type="button" size="small">
                        <Radio :label="index" :key="index" v-for="(item, index) in wTypes">{{ item }}</Radio>
                    </RadioGroup>

                    <!--<Input v-model="opacity" size="small" number placeholder="透明度" class="smallInput"/>-->
                </div>

                <div v-if="wType == 2">
                    <Input v-model="mockup.width" size="small" number placeholder="宽度" class="smallInput"/>
                    <Input v-model="mockup.height" size="small" number placeholder="高度" class="smallInput"/>
                </div>

                <!--<div>-->
                    <!--<span class="opacity">透明度：</span>-->
                    <!--<Slider style="width:68%;" v-model="opacity"  :step="0.05"  :min="0" :max="1" show-input></Slider>-->
                <!--</div>-->

                <div class="formLine">
                    <Checkbox v-model="showMockup">显示</Checkbox>
                    <Checkbox v-model="freeze">冻结</Checkbox>
                    <Checkbox v-model="preventScroll">键盘滚动</Checkbox>

                    <span>混合模式：</span>
                    <Select v-model="blendMode" style="width: 30%;" size="small" >
                        <Option value="normal">正常</Option>
                        <Option value="multiply">正片叠底</Option>
                        <Option value="screen">滤色</Option>
                        <Option value="overlay">叠加</Option>
                        <Option value="darken">变暗</Option>
                        <Option value="lighten">变亮</Option>
                        <Option value="color-dodge">颜色减淡</Option>
                        <Option value="color-burn">颜色加深</Option>
                        <Option value="hard-light">强光</Option>
                        <Option value="soft-light">柔光</Option>
                        <Option value="difference">差值</Option>
                        <Option value="exclusion">排除</Option>
                        <Option value="hue">色相</Option>
                        <Option value="saturation">饱和度</Option>
                        <Option value="color">颜色</Option>
                        <Option value="luminosity">亮度</Option>
                    </Select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "App",
        data() {
            return {
                closed: false,
                opacity: 1,
                showMockup: true,
                freeze: 0,
                blendMode: 'darken',
                wTypes: ['原图大小', '窗口大小', '自定义'],
                wType: 1,
                mockup: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    left: 0,
                    top: 0
                },
                img: {
                    name: '暂无',
                    width: 0,
                    height: 0,
                    src: ''
                },
                preventScroll: false
            }
        },
        computed: {
            mockupStyle() {
                let {width, height, left, top} = this.mockup,
                    style = {
                        opacity: this.opacity,
                        'mix-blend-mode': this.blendMode,

                        width: width + 'px',
                        height: height + 'px',
                        // left: left + 'px',
                        // top: top + 'px'

                        webkitTransform: 'translate(' + left + 'px, ' + top + 'px)',
                        transform: 'translate(' + left + 'px, ' + top + 'px)'
                };
                if (this.freeze) style.pointerEvents = 'none';
                if (this.img.src) style.backgroundImage = `url(${this.img.src})`;
                // style.backgroundSize = this.getBgSize(this.wType);
                return style;
            }
        },
        watch: {
            wType() {
                if (this.wType == 0) { // 原图大小
                    this.mockup.width = this.img.width;
                    this.mockup.height = this.img.height;
                } else if (this.wType == 1) { // 窗口大小
                    this.mockup.width = window.innerWidth;
                    this.mockup.height = window.innerHeight;
                } else if (this.wType == 2) { // 自定义

                }
            }
        },
        methods: {
            handlePreventScroll(e) {
                console.log('handlePreventScroll', this)
                
                if (this.preventScroll) {
                    e.preventDefault();

                    let {mockup} = this;
                    switch (e.which) {
                        case 37:
                            mockup.left = mockup.left - 1;
                            break;
                        case 38:
                            mockup.top = mockup.top - 1;
                            break;
                        case 39:
                            mockup.left = mockup.left + 1;
                            break;
                        case 40:
                            mockup.top = mockup.top + 1;
                    }
                }
            },
            reset() {
                const mockup = this.$refs.mockup;
                // mockup.style.webkitTransform = mockup.style.transform = 'translate(0, 0)';
                // mockup.style.width = '100%';
                // mockup.style.height = '100%';
                mockup.setAttribute('data-x', 0);
                mockup.setAttribute('data-y', 0);
                this.mockup = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    left: 0,
                    top: 0
                }
            },
            changeImg(e) {
                if (this.img.src) URL.revokeObjectURL(this.img.src);

                let [file] = e.target.files;
                this.getImg(file).then(img => {
                    this.img = {
                        name: file.name,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        src: img.src
                    }
                }, e => console.error(e));
            },

            getImg(url) {
                return new Promise((resolve, reject)=>{
                    const img = new Image;
                    img.src = URL.createObjectURL(url);
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
                //
                // interact(this.$refs.toggler)
                //     .on('click', event => event.stopImmediatePropagation(), { capture: true })
                //     .draggable({
                //         inertia: true,
                //         autoScroll: true,
                //         onmove
                //     });

                interact(this.$refs.mockup)
                    .draggable({
                        onmove:(event)=>{
                            let target = event.target,
                                // keep the dragged position in the data-x/data-y attributes
                                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                            // update the posiion attributes
                            target.setAttribute('data-x', x);
                            target.setAttribute('data-y', y);

                            this.mockup = {
                                left: x,
                                top: y
                            }
                        }
                    })
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: true, right: true, bottom: true, top: true},

                        // minimum size
                        // restrictSize: {
                        //     min: {width: 100, height: 50},
                        // },

                        inertia: true,
                    })
                    .on('resizemove',(event) => {
                        let target = event.target,
                            x = (parseFloat(target.getAttribute('data-x')) || 0),
                            y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // update the element's style
                        // target.style.width  = event.rect.width + 'px';
                        // target.style.height = event.rect.height + 'px';

                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);

                        this.mockup.width = event.rect.width;
                        this.mockup.height = event.rect.height;
                        this.mockup.left = x;
                        this.mockup.top = y;

                        console.log(event.deltaRect.left, event.deltaRect.top, event.deltaRect)
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
        mounted() {
            this.initMockup();
            this._handlePreventScroll = this.handlePreventScroll.bind(this);

            document.body.addEventListener('keydown', this._handlePreventScroll)
        },
        beforeDestroy() {
            document.body.removeEventListener('keydown', this._handlePreventScroll)
        }
    }
</script>
